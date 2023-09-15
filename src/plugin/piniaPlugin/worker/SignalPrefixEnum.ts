/**
 * 信号量
 */
enum SignalPrefixEnum {
  /**
   * 查询数据
   */
  QUERY = 0,
  /**
   * 查询成功
   */
  QUERY_SUCCESS = 1,
  /**
   * 查询失败
   */
  QUERY_FAIL = 2,
  /**
   * 更新数据
   */
  WRITE = 3,
  /**
   * 更新数据成功
   */
  WRITE_SUCCESS = 4,
  /**
   * 更新数据失败
   */
  WRITE_FAIL = 5,
  /**
   * 初始化数据操作对象
   */
  INIT = 6,
  /**
   * 创建数据操作对象成功
   */
  INIT_SUCCESS = 7,
  /**
   * 创建数据操作对象失败
   */
  INIT_FAILURE = 8,
  /**
   * 清空数据操作对象
   */
  CLEAR = 9,
  /**
   * 获取数据操作对象配置信息(版本, 名称, 大小...)
   */
  DETAIL = 10,
  /**
   * 获取数据操作对象配置信息成功
   */
  GET_DETAIL_SUCCESS = 11,
  /**
   * 获取数据操作对象配置信息失败
   */
  GET_DETAIL_FAIL = 12,
  /**
   * 获取子线程环境简单描述信息
   */
  WORKER_DETAIL = 13
}

export { SignalPrefixEnum };
