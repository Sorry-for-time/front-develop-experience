import {
  recursiveReplaceValue,
  unwrapReactiveOrRefObj
} from "@/util/reactiveUtil";
import type { PiniaPluginContext } from "pinia";
import StorageWorker from "./storageWorker?worker";
import type {
  DataTransferPacket,
  WorkerMSG,
  WriteMsg
} from "./worker/MessageEventHandler";
import { SignalPrefixEnum } from "./worker/SignalPrefixEnum";

/**
 * 插件注册状态
 */
export type PersistPluginStatus = {
  /**
   * 总线程数
   */
  workerNum: number;
  /**
   * 线程列表
   */
  workers: Array<Worker>;
  /**
   * 注册的 indexedDB 操作对象配置信息(受限于异步机制, 该值可能延迟更新)
   */
  registerStoreOptions: Array<LocalForageOptions>;
  /**
   * 注册的线程工作环境简要描述信息列表(受限于异步机制, 该值可能延迟更新)
   */
  workerEnvironmentSimpleDesc: Array<WorkerMSG>;
  /**
   * store 持久化数据加载状态信息
   */
  loadStatus: Array<{
    /**
     * store 唯一标识
     * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/now
     */
    storeId: string;
    /**
     * 加载起始时间戳记录
     * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/now
     */
    start: number;
    /**
     * 加载结束时间戳
     */
    finish: number;
  }>;
};

class PiniaMultiPersistPluginFactory {
  /**
   * 平台支持的最大线程数
   */
  static #maxConcurrency: number = globalThis.navigator.hardwareConcurrency;

  /**
   * 注册最大线程数(由所有使用 indexedDB 序列化方式的 store 共享)
   */
  #workerNum: number;

  /**
   * 工作者线程列表
   */
  #workers: Array<Worker>;

  /**
   * 当前使用 indexedDB 持久化方案 store 所使用的工作者线程在线程列表里所处的下标
   */
  #selectWorkerLocation: number;

  /**
   * 插件状态
   */
  #pluginStatus: PersistPluginStatus;

  private constructor(workerNum: number) {
    // check init status
    if (workerNum < 0) {
      throw TypeError(`the workerNum: ${workerNum} is out of range`);
    }

    if (import.meta.env.DEV) {
      console.log(
        "%c" + `platform max concurrency is: ${new.target.#maxConcurrency}`,
        "border-radius: 4px; color: white; text-shadow: 1px 1px 1px black; background: rgb(16, 88, 65); padding: 4px"
      );
      if (workerNum > new.target.#maxConcurrency) {
        console.warn(
          `the worker num: ${workerNum} is grater than platform max hardware count: ${
            new.target.#maxConcurrency
          }, suggest reduce the workerNum...`
        );
      }
    }

    this.#workerNum = workerNum;
    this.#workers = [];
    this.#selectWorkerLocation = 0;
    this.#pluginStatus = {
      workerNum: 0,
      workers: this.#workers,
      registerStoreOptions: [],
      workerEnvironmentSimpleDesc: [],
      loadStatus: []
    };
  }

  public static build(workerNum: number = 1) {
    return new PiniaMultiPersistPluginFactory(workerNum);
  }

  /**
   * 当前插件使用状态,
   */
  public get pluginStatus(): Readonly<PersistPluginStatus> {
    return this.#pluginStatus;
  }

  #useSyncedWebStorage(
    context: PiniaPluginContext,
    storageType: "localStorage" | "sessionStorage"
  ): void {
    const { store, options } = context;
    const key: string = options.persist?.key ? options.persist.key : store.$id;
    const persistReadOnly: boolean = options.persist?.persistReadonly
      ? true
      : false;
    const persistedDataStr: string | null =
      storageType === "localStorage"
        ? localStorage.getItem(key)
        : sessionStorage.getItem(key);
    // load from local data if exists...
    const beforeRestore = options.persist?.beforeRestore;
    const afterRestore = options.persist?.afterRestore;

    if (typeof beforeRestore === "function") {
      beforeRestore(context);
    }

    if (persistedDataStr) {
      const deSerializedData = JSON.parse(persistedDataStr);
      store.$patch((state) => {
        // restore
        recursiveReplaceValue(state, deSerializedData, persistReadOnly);
      });
    }

    if (typeof afterRestore === "function") {
      afterRestore(context);
    }
    // add state change listener and record new state
    store.$subscribe((_mutation, state) => {
      const serializedDataStr = JSON.stringify(
        unwrapReactiveOrRefObj(state, persistReadOnly)
      );
      storageType === "localStorage"
        ? localStorage.setItem(key, serializedDataStr)
        : sessionStorage.setItem(key, serializedDataStr);
    });
  }

  #useAsyncStorage(context: PiniaPluginContext): void {
    const { store } = context;
    const persist = context.options.persist!;
    // 仅在使用到 indexedDB 时才创建 worker 实例
    if (this.#workers.length < this.#workerNum) {
      this.#workers.push(new StorageWorker());
    }
    this.#pluginStatus.workerNum = this.#workers.length;
    // 用于持久化的 key 名称
    const persistKey: string = persist?.key ? persist.key : store.$id;
    const dataTransferWorker: Worker =
      this.#workers[this.#selectWorkerLocation];
    // 更新下一个 store 使用的 worker 下标
    this.#selectWorkerLocation =
      (this.#selectWorkerLocation + 1) % this.#workers.length;
    // 初始化配置
    const initConfig: DataTransferPacket = {
      header: SignalPrefixEnum.INIT,
      payload: persistKey
    };
    const start: number = performance.now();
    // 初始化 webWorker 线程
    Promise.resolve(initConfig)
      // 通知子线程进行数据操作对象初始化
      .then((res) => {
        dataTransferWorker.postMessage(res);
        return new Promise((resolve, reject) => {
          dataTransferWorker.addEventListener(
            "message",
            function init({ data }: MessageEvent<DataTransferPacket>): void {
              if (
                data.header === SignalPrefixEnum.INIT_SUCCESS &&
                data.storeId === persistKey
              ) {
                resolve(data.header);
                // clean up
                dataTransferWorker.removeEventListener("message", init);
              } else if (
                data.header === SignalPrefixEnum.INIT_FAILURE &&
                data.storeId === persistKey
              ) {
                reject({
                  description: `web-worker's indexeddb init fail`,
                  reason: data.payload
                });
                // clean up
                dataTransferWorker.removeEventListener("message", init);
              }
            }
          );
        });
      })
      // 发送获取已存在数据请求
      .then(() => {
        const requestPersistPacket: DataTransferPacket = {
          header: SignalPrefixEnum.QUERY,
          payload: {
            storeId: persistKey,
            key: "state"
          }
        };
        dataTransferWorker.postMessage(requestPersistPacket);
      })
      .then(() => {
        // 处理请求数据的结果
        return new Promise((resolve, reject) => {
          dataTransferWorker.addEventListener(
            "message",
            function requestExistsData({
              data
            }: MessageEvent<DataTransferPacket>): void {
              if (
                data.header === SignalPrefixEnum.QUERY_SUCCESS &&
                data.storeId === persistKey
              ) {
                resolve(data.payload);
                // clean up
                dataTransferWorker.removeEventListener(
                  "message",
                  requestExistsData
                );
              } else if (
                data.header === SignalPrefixEnum.QUERY_FAIL &&
                data.storeId === persistKey
              ) {
                reject({
                  description: "can not query default data",
                  reason: data.payload
                });
                // clean up
                dataTransferWorker.removeEventListener(
                  "message",
                  requestExistsData
                );
              }
            }
          );
        });
      })
      .then((res: any) => {
        const beforeRestore = persist.beforeRestore;
        if (typeof beforeRestore === "function") {
          beforeRestore(context);
        }
        // 写入数据并订阅数据更新器
        if (typeof res !== "undefined" && res !== null) {
          store.$patch((state) => {
            recursiveReplaceValue(
              state,
              res,
              persist.persistReadonly ? true : false
            );
          });
        }
        const finish: number = performance.now();
        this.#pluginStatus.loadStatus.push({
          storeId: persistKey,
          start,
          finish
        });
        const afterRestore = persist.afterRestore;
        if (typeof afterRestore === "function") {
          afterRestore(context);
        }
        store.$subscribe((_mutation, state) => {
          const currentDataPacket: DataTransferPacket<WriteMsg> = {
            header: SignalPrefixEnum.WRITE,
            payload: {
              storeId: persistKey,
              key: "state",
              data: unwrapReactiveOrRefObj(
                state,
                persist.persistReadonly ? true : false
              )
            }
          };
          dataTransferWorker.postMessage(currentDataPacket);
        });
      })
      .finally(() => {
        if (import.meta.env.DEV) {
          console.log(`${store.$id} --> ${persistKey} init done...`);
        }
        const requestWorkerDetailPacket: DataTransferPacket<string> = {
          payload: persistKey,
          header: SignalPrefixEnum.WORKER_DETAIL
        };

        const pluginStatus = this.#pluginStatus;
        dataTransferWorker.postMessage(requestWorkerDetailPacket);
        dataTransferWorker.addEventListener(
          "message",
          function onReportWorkerDetail({
            data
          }: MessageEvent<DataTransferPacket>) {
            if (
              data.header === SignalPrefixEnum.WORKER_DETAIL &&
              persistKey === data.storeId
            ) {
              pluginStatus.workerEnvironmentSimpleDesc.push(data.payload);
              dataTransferWorker.removeEventListener(
                "message",
                onReportWorkerDetail
              );
            }
          }
        );
        const getStorageOptionsPacket: DataTransferPacket = {
          header: SignalPrefixEnum.DETAIL,
          payload: persistKey
        };
        dataTransferWorker.postMessage(getStorageOptionsPacket);
        dataTransferWorker.addEventListener(
          "message",
          function onReportStorageOptions({
            data
          }: MessageEvent<DataTransferPacket>) {
            if (
              data.header === SignalPrefixEnum.GET_DETAIL_SUCCESS &&
              persistKey === data.storeId
            ) {
              pluginStatus.registerStoreOptions.push(data.payload);
              // clean up
              dataTransferWorker.removeEventListener(
                "message",
                onReportStorageOptions
              );
            }
          }
        );
      });
  }

  /**
   * 创建 pinia 持久化插件
   *
   * @param context pinia 实例上下文
   */
  #createPlugin(context: PiniaPluginContext) {
    const persist = context.options.persist;
    if (
      (typeof persist === "object" || typeof persist === "function") &&
      persist
    ) {
      // extract store ref...
      switch (persist.storage) {
        case "indexedDB":
          this.#useAsyncStorage(context);
          break;
        case "localStorage":
          this.#useSyncedWebStorage(context, "localStorage");
          break;
        case "sessionStorage":
          this.#useSyncedWebStorage(context, "sessionStorage");
          break;
        default:
          throw new TypeError(
            `error persist config, please check your persist config, --> ${persist.storage} is not defined`
          );
      }
    }
  }

  /**
   * store 持久化插件
   */
  public get persistPlugin() {
    return this.#createPlugin.bind(this);
  }
}

export { PiniaMultiPersistPluginFactory };
