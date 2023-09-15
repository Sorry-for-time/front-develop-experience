import localforage from "localforage";
import { SignalPrefixEnum } from "./SignalPrefixEnum";

export type DataTransferPacket<T = any> = {
  header: SignalPrefixEnum;
  storeId?: string;
  payload?: T;
};

export type FailureReport<T = any> = {
  description: string;
  reason: T;
};

export type WriteMsg<T = any> = {
  storeId: string;
  key: string;
  data: T;
};

export type WorkerMSG = Partial<{
  name: string;
  appCodeName: string;
  appName: string;
  language: string;
  languages: string[];
  onLine: boolean;
  platform: string;
  product: string;
  deviceMemory: number;
  hardwareConcurrency: number;
}>;

class MessageEventHandler {
  /**
   * 数据操作对象映射集
   */
  #storeOperationMap: Map<string, LocalForage>;

  public constructor() {
    this.#storeOperationMap = new Map();
  }

  /**
   * 获取子线程环境的简单描述信息
   *
   * @returns 子线程环境简要描述信息
   */
  public get workerDetail(): WorkerMSG {
    return {
      name: self.name,
      appCodeName: navigator.appCodeName,
      appName: navigator.appName,
      language: navigator.language,
      languages: navigator.languages as any,
      onLine: navigator.onLine,
      platform: navigator.platform,
      product: navigator.product,
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency
    };
  }

  /**
   * 获取当前线程运行环境简要描述信息
   *
   * @param storeId 操作对象 id
   */
  #getWorkerDetail(storeId: string) {
    const workerDetailPacket: DataTransferPacket<WorkerMSG> = {
      header: SignalPrefixEnum.WORKER_DETAIL,
      storeId: storeId,
      payload: this.workerDetail
    };
    self.postMessage(workerDetailPacket);
  }

  /**
   * 初始化并创建指定名称的数据操作对象
   *
   * @param storeId 数据对象 id
   */
  #init(storeId: string): void {
    try {
      if (!this.#storeOperationMap.has(storeId)) {
        const instance: LocalForage = localforage.createInstance({
          version: 1,
          driver: [localforage.INDEXEDDB],
          storeName: storeId,
          description: `this store own of pinia's ${storeId}`
        });
        this.#storeOperationMap.set(storeId, instance);
        const initSuccessPacket: DataTransferPacket = {
          header: SignalPrefixEnum.INIT_SUCCESS,
          storeId
        };
        self.postMessage(initSuccessPacket);
        // 更新当前线程的名称
        if (!self.name) {
          self.name = storeId + " --- THREAD";
        } else {
          self.name = `${storeId}, ${self.name}`;
        }
      } else {
        throw new TypeError("the storeObject already exists");
      }
    } catch (reason) {
      console.warn(reason);
      const initFailPacket: DataTransferPacket<FailureReport> = {
        header: SignalPrefixEnum.INIT_FAILURE,
        storeId: storeId,
        payload: {
          description: `can not init the storage object,code: ${SignalPrefixEnum.INIT_FAILURE}`,
          reason
        }
      };
      self.postMessage(initFailPacket);
    }
  }

  /**
   * 查询指定数据对象包含的数据
   *
   * @param storeId 数据操作对象 id
   * @param key 数据对象 key 名称, 默认为 `state`
   */
  async #query(storeId: string, key: string) {
    try {
      if (this.#storeOperationMap.has(storeId)) {
        const instance: LocalForage = this.#storeOperationMap.get(storeId)!;
        const result = await instance.getItem(key);
        const queryResultPacket: DataTransferPacket = {
          header: SignalPrefixEnum.QUERY_SUCCESS,
          storeId,
          payload: result
        };
        self.postMessage(queryResultPacket);
      } else {
        throw new Error(
          "the storage should init before execute other operation"
        );
      }
    } catch (reason) {
      console.warn(reason);
      const reportPacket: DataTransferPacket<FailureReport> = {
        header: SignalPrefixEnum.QUERY_FAIL,
        storeId: storeId,
        payload: {
          description: "query data fail",
          reason
        }
      };
      self.postMessage(reportPacket);
    }
  }

  /**
   * 写入数据
   *
   * @param meta 写入配置信息
   */
  async #write(meta: WriteMsg) {
    try {
      if (this.#storeOperationMap.has(meta.storeId)) {
        await this.#storeOperationMap
          .get(meta.storeId)!
          .setItem(meta.key, meta.data);
        const writeSuccessPacket: DataTransferPacket = {
          header: SignalPrefixEnum.WRITE_SUCCESS,
          storeId: meta.storeId
        };
        self.postMessage(writeSuccessPacket);
      } else {
        throw new TypeError(
          "the storage should init before execute other operation"
        );
      }
    } catch (reason) {
      console.warn(reason);
      const reportPacket: DataTransferPacket = {
        header: SignalPrefixEnum.WRITE_FAIL,
        storeId: meta.storeId,
        payload: {
          description: "write data fail",
          reason
        }
      };
      self.postMessage(reportPacket);
    }
  }

  /**
   * 清空数据库
   *
   * @param storeId 数据操作对象名称
   */
  async #clear(storeId: string) {
    try {
      if (this.#storeOperationMap.has(storeId)) {
        const store: LocalForage = this.#storeOperationMap.get(storeId)!;
        await store.clear();
        const writeSuccessPacket: DataTransferPacket = {
          header: SignalPrefixEnum.WRITE_SUCCESS,
          storeId: storeId
        };
        self.postMessage(writeSuccessPacket);
      } else {
        throw new TypeError(
          "the storage should init before execute other operation"
        );
      }
    } catch (reason) {
      console.warn(reason);
      const reportPacket: DataTransferPacket = {
        header: SignalPrefixEnum.WRITE_FAIL,
        storeId: storeId,
        payload: {
          description: "clear store data fail",
          reason: reason
        }
      };
      self.postMessage(reportPacket);
    }
  }

  async #getStoreOptions(storeId: string) {
    try {
      if (this.#storeOperationMap.has(storeId)) {
        const instance = this.#storeOperationMap.get(storeId)!;
        const config = instance.config();
        const storeDetailPacket: DataTransferPacket<LocalForageOptions> = {
          header: SignalPrefixEnum.GET_DETAIL_SUCCESS,
          storeId: storeId,
          payload: config
        };
        self.postMessage(storeDetailPacket);
      } else {
        throw new TypeError(
          "the storage should init before execute other operation"
        );
      }
    } catch (reason) {
      console.warn(reason);
      const reportPacket: DataTransferPacket = {
        header: SignalPrefixEnum.GET_DETAIL_FAIL,
        storeId: storeId,
        payload: {
          description: "get store-options fail",
          reason: reason
        }
      };
      self.postMessage(reportPacket);
    }
  }

  /**
   * 派发监听
   */
  public startListen(): void {
    self.onmessage = ({ data }: MessageEvent<DataTransferPacket>) => {
      switch (data.header) {
        case SignalPrefixEnum.INIT:
          this.#init(data.payload);
          break;
        case SignalPrefixEnum.QUERY:
          this.#query(data.payload.storeId, data.payload.key);
          break;
        case SignalPrefixEnum.WRITE:
          this.#write(data.payload);
          break;
        case SignalPrefixEnum.CLEAR:
          this.#clear(data.payload.storeName);
          break;
        case SignalPrefixEnum.DETAIL:
          this.#getStoreOptions(data.payload);
        case SignalPrefixEnum.WORKER_DETAIL:
          this.#getWorkerDetail(data.payload);
        default:
          break;
      }
    };
  }
}

export { MessageEventHandler };
