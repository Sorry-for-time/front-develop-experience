import { createDecorator } from "vue-facing-decorator";

/**
 * Vue-Class 组件防抖装饰器(这要求方法没有返回值)
 *
 * @param wait 间隔延迟
 * @param startImmediate 首次使用是否立即执行
 */
function UseDebounce(
  wait: Readonly<number> = 200,
  startImmediate: Readonly<boolean> = true
): MethodDecorator {
  let timer: number | undefined = void 0;
  let immediate: boolean = startImmediate;

  return createDecorator(
    (options, key) => {
      const originMethod: Function | undefined = options.methods?.[key];
      if (typeof originMethod !== "function") {
        throw new TypeError(`${key} is not a method`);
      } else {
        options.methods[key] = new Proxy(originMethod!, {
          apply(target, thisArg, argArray) {
            if (immediate) {
              timer = setTimeout(() => {
                Reflect.apply(target, thisArg, argArray);
              }, 0);
              immediate = false;
            } else {
              if (timer) {
                clearTimeout(timer);
                timer = setTimeout(() => {
                  Reflect.apply(target, thisArg, argArray);
                }, wait);
              }
            }
          }
        });
      }
    },
    {
      preserve: true
    }
  ) as MethodDecorator;
}

/**
 * Vue-Class 组件方法节流装饰器(这要求方法没有返回值)
 *
 * @param wait 间隔延迟
 * @param startImmediate 首次使用是否立即执行
 */
function UseThrottle(
  wait: Readonly<number> = 200,
  startImmediate: Readonly<boolean> = true
): MethodDecorator {
  let locker: boolean = false;
  let immediate: boolean = startImmediate;

  return createDecorator(
    (options, key) => {
      const originMethod: Function | undefined = options.methods?.[key];
      if (typeof originMethod !== "function") {
        throw new TypeError(`${key} is not a method`);
      } else {
        options.methods[key] = new Proxy(originMethod!, {
          apply(target, thisArg, argArray) {
            if (immediate) {
              locker = true;
              setTimeout(() => {
                Reflect.apply(target, thisArg, argArray);
                locker = false;
              }, 0);
              immediate = false;
            }
            if (locker) {
              return;
            }
            locker = true;
            setTimeout((): void => {
              Reflect.apply(target, thisArg, argArray);
              locker = false;
            }, wait);
          }
        });
      }
    },
    {
      preserve: true
    }
  ) as MethodDecorator;
}

export { UseDebounce, UseThrottle };
