import type {
  PiniaCustomProperties,
  PiniaCustomStateProperties,
  PiniaPluginContext
} from "pinia";
import { toRaw } from "vue";
import StorageWorker from "./storageWorker?worker";
import type {
  DataTransferPacket,
  WriteMsg
} from "./worker/MessageEventHandler";
import { SignalPrefixEnum } from "./worker/SignalPrefixEnum";

/**
 * 创建 pinia indexedDB 持久化插件
 *
 * @returns pinia 持久化插件
 */
const createPiniaIndexedDBPersistPlugin = () => {
  const dataTransferWorker = new StorageWorker();

  /**
   * pinia indexedDB 持久化存储
   *
   * @param context pinia 上下文
   */
  return (
    context: PiniaPluginContext
  ): Partial<PiniaCustomProperties & PiniaCustomStateProperties> | void => {
    const { store } = context;

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
      });
  };
};

export { createPiniaIndexedDBPersistPlugin };
