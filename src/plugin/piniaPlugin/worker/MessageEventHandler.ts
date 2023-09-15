import localforage, { key } from "localforage";
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

class MessageEventHandler {
  /**
   * 数据操作对象映射集
   */
  #storeOperationMap: Map<string, LocalForage>;

  public constructor() {
    this.#storeOperationMap = new Map();
  }

  /**
   * 初始化并创建指定名称的数据操作对象
   * @param storeId 数据对象 id
   */
  #init(storeId: string) {
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
        default:
          break;
      }
    };
  }
}

export { MessageEventHandler };
