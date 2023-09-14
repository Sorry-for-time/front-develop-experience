import { createDecorator } from "vue-facing-decorator";
/**
 * 适用于 vue-class 组件的方法切面装饰器
 *
 * @param operation 配置选项
 */
function Aspect(
  operation?: Partial<{
    /**
     * 方法执行之前, 可以对参数进行进行处理, 发送请求等
     */
    before: (...params: Array<any>) => void;
    /**
     * 方法执行完毕之后, 可以对返回结果进行转换处理
     */
    after: (result?: any) => any;
    /**
     * 方法执行过程中遇到的异常处理
     */
    onError: (reason?: any) => void;
    /**
     * 方法执行完毕之后的辅助函数, 可用于清理工作等
     */
    finally: VoidFunction;
  }>
) {
  return createDecorator(
    (options, key) => {
      const originMethod: Function | undefined = options.methods?.[key];
      if (typeof originMethod !== "function") {
        throw new TypeError(`${key} is not a method`);
      }
      options.methods[key] = new Proxy(originMethod!, {
        apply(target, thisArg, argArray) {
          try {
            if (typeof operation?.before === "function") {
              operation.before(...argArray);
            }
            const tmpResult = Reflect.apply(target, thisArg, argArray);
            if (typeof operation?.after === "function") {
              return operation.after(tmpResult);
            } else {
              return tmpResult;
            }
          } catch (reason) {
            if (typeof operation?.onError === "function") {
              operation.onError(reason);
            }
            throw reason;
          } finally {
            if (typeof operation?.finally === "function") {
              operation.finally();
            }
          }
        }
      });
    },
    { preserve: true }
  );
}

export { Aspect };
