import type {
  PiniaCustomProperties,
  PiniaCustomStateProperties,
  PiniaPluginContext
} from "pinia";
import { toRaw } from "vue";
import StorageWorker from "./storageWorker?worker";
import type {
  DataTransferPacket,
  WorkerMSG,
  WriteMsg
} from "./worker/MessageEventHandler";
import { SignalPrefixEnum } from "./worker/SignalPrefixEnum";

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
   * 注册的 indexedDB 操作对象配置信息(受限于异步机制, 该值可能延迟加载)
   */
  registerStoreOptions: Array<LocalForageOptions>;
  /**
   * 注册的线程工作环境简要描述信息列表(受限于异步机制, 该值可能延迟加载)
   */
  workerEnvironmentSimpleDesc: Array<WorkerMSG>;
};

/**
 * 创建 pinia-indexedDB-webWorker 持久化插件
 *
 * @param workerNum
 * @returns indexedDB 持久化插件
 */
const createPiniaIndexedDBPersistPlugin = (workerNum: number = 1) => {
  const maxConcurrency: number = navigator.hardwareConcurrency;
  if (workerNum > maxConcurrency || workerNum < 0) {
    throw TypeError(`the workerNum: ${workerNum} is out of range`);
  }

  const workers: Array<Worker> = [];

  const pluginStatus: PersistPluginStatus = {
    workerNum,
    workers,
    registerStoreOptions: [],
    workerEnvironmentSimpleDesc: []
  };

  for (let i: number = 0; i < workerNum; i++) {
    workers.push(new StorageWorker());
  }

  /**
   * 当前 store 使用的线程所在线程列表下标
   */
  let selectWorkerLocation: number = 0;

  return {
    /**
     * pinia-indexedDB-webWorker 持久化插件
     * @param context  上下文环境
     */
    plugin: (
      context: PiniaPluginContext
    ): Partial<PiniaCustomProperties & PiniaCustomStateProperties> | void => {
      const { store } = context;
      const dataTransferWorker: Worker = workers[selectWorkerLocation];
      // 更新下一个 store 使用的 worker 下标
      selectWorkerLocation = (selectWorkerLocation + 1) % workers.length;
      // 初始化配置
      const initConfig: DataTransferPacket = {
        header: SignalPrefixEnum.INIT,
        payload: store.$id
      };
      // 初始化 webworker 线程
      Promise.resolve(initConfig)
        // 通知子线程进行初始化
        .then((res) => {
          dataTransferWorker.postMessage(res);
          return new Promise((resolve, reject) => {
            dataTransferWorker.addEventListener(
              "message",
              function init({ data }: MessageEvent<DataTransferPacket>): void {
                if (
                  data.header === SignalPrefixEnum.INIT_SUCCESS &&
                  data.storeId === store.$id
                ) {
                  resolve(data.header);
                  // clean up
                  dataTransferWorker.removeEventListener("message", init);
                } else if (
                  data.header === SignalPrefixEnum.INIT_FAILURE &&
                  data.storeId === store.$id
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
              storeId: store.$id,
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
                  data.storeId === store.$id
                ) {
                  resolve(data.payload);
                  // clean up
                  dataTransferWorker.removeEventListener(
                    "message",
                    requestExistsData
                  );
                } else if (
                  data.header === SignalPrefixEnum.QUERY_FAIL &&
                  data.storeId === store.$id
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
        .then((res) => {
          // 写入数据并订阅数据更新器
          if (typeof res !== "undefined") {
            store.$state = res as any;
          }
          store.$subscribe((_mutation, state) => {
            const currentDataPacket: DataTransferPacket<WriteMsg> = {
              header: SignalPrefixEnum.WRITE,
              payload: {
                storeId: store.$id,
                key: "state",
                data: toRaw(state)
              }
            };
            dataTransferWorker.postMessage(currentDataPacket);
          });
        })
        .finally(() => {
          console.log(`${store.$id} init done...`);
          const requestWorkerDetailPacket: DataTransferPacket<string> = {
            payload: store.$id,
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
                store.$id === data.storeId
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
            payload: store.$id
          };
          dataTransferWorker.postMessage(getStorageOptionsPacket);
          dataTransferWorker.addEventListener(
            "message",
            function onReportStorageOptions({
              data
            }: MessageEvent<DataTransferPacket>) {
              if (
                data.header === SignalPrefixEnum.GET_DETAIL_SUCCESS &&
                store.$id === data.storeId
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
    },
    /**
     * 插件内置状态信息
     */
    pluginStatus
  };
};

export { createPiniaIndexedDBPersistPlugin };