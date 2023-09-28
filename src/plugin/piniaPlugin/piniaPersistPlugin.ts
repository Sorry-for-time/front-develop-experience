import {
  recursiveReplaceValue,
  unwrapReactiveOrRefObj
} from "@/util/reactiveUtil";
import type {
  PiniaCustomProperties,
  PiniaCustomStateProperties,
  PiniaPluginContext
} from "pinia";
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

/**
 * 创建 pinia-indexedDB-webWorker 持久化插件以及导出插件配置信息
 *
 * @param workerNum 使用的子线程数(所有 store 使用取模尽可能平均配使用已存在的所有 worker)
 * @param persistReadOnly 是否序列化并保存/加载只读数据 @see recursiveReplaceValue, @see unwrapReactiveOrRefObj
 * @returns pinia-custom-persist-plugin creating factory
 */
const createPiniaIndexedDBPersistPlugin = (
  workerNum: number = 1
): {
  plugin: (
    context: PiniaPluginContext
  ) => Partial<PiniaCustomProperties & PiniaCustomStateProperties> | void;
  pluginStatus: Readonly<PersistPluginStatus>;
} => {
  const maxConcurrency: number = navigator.hardwareConcurrency;
  // check illegal
  if (workerNum > maxConcurrency || workerNum < 0) {
    throw TypeError(`the workerNum: ${workerNum} is out of range`);
  }
  const workers: Array<Worker> = [];
  const pluginStatus: PersistPluginStatus = {
    workerNum: 0,
    workers,
    registerStoreOptions: [],
    workerEnvironmentSimpleDesc: [],
    loadStatus: []
  };

  /**
   * 当前 store 使用的线程所在线程列表下标
   */
  let selectWorkerLocation: number = 0;

  /**
   * 本地阻塞数据持久化方案
   *
   * @param context pinia 上下文环境
   * @param storageType 阻塞存储方案类型
   */
  const syncBlockingStorage = (
    context: PiniaPluginContext,
    storageType: "localStorage" | "sessionStorage"
  ): void => {
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
  };

  return {
    /**
     * pinia-indexedDB-webWorker 持久化插件
     *
     * @param context 上下文环境
     */
    plugin: (
      context: PiniaPluginContext
    ): Partial<PiniaCustomProperties & PiniaCustomStateProperties> | void => {
      const persist = context.options.persist;
      if (
        (typeof persist === "object" || typeof persist === "function") &&
        persist
      ) {
        // extract store ref...
        const { store } = context;
        switch (persist.storage) {
          case "indexedDB":
            // 仅在使用到 indexedDB 时才创建 worker 实例
            if (workers.length < workerNum) {
              workers.push(new StorageWorker());
            }
            pluginStatus.workerNum = workers.length;
            // 用于持久化的 key 名称
            const persistKey: string = persist?.key ? persist.key : store.$id;
            const dataTransferWorker: Worker = workers[selectWorkerLocation];
            // 更新下一个 store 使用的 worker 下标
            selectWorkerLocation = (selectWorkerLocation + 1) % workers.length;
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
                    function init({
                      data
                    }: MessageEvent<DataTransferPacket>): void {
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
                pluginStatus.loadStatus.push({
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
                      pluginStatus.workerEnvironmentSimpleDesc.push(
                        data.payload
                      );
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
            break;
          case "localStorage":
            syncBlockingStorage(context, "localStorage");
            break;
          case "sessionStorage":
            syncBlockingStorage(context, "sessionStorage");
            break;
          default:
            throw new TypeError(
              `error persist config, please check your persist config, --> ${persist.storage} is not defined`
            );
        }
      }
    },
    /**
     * 插件状态信息
     */
    pluginStatus
  };
};

export { createPiniaIndexedDBPersistPlugin };
