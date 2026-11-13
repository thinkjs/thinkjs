import assert = require('assert');
import helper = require('think-helper');

type Constructor = new (...args: never[]) => object;
type RuntimeConstructor = new (...args: unknown[]) => object;
type InstanceCache = Record<string, object | undefined>;

const classArray: RuntimeConstructor[] = [];
const instanceArray: InstanceCache[] = [];

type CacheMethod<T extends Constructor> = (...config: ConstructorParameters<T>) => InstanceType<T> | undefined;
type Falsy = false | 0 | 0n | '' | null | undefined;
type Wrapped<T extends Constructor> =
  T extends {getInstance: (...args: never[]) => unknown} ? T :
  'getInstance' extends keyof T ? Omit<T, 'getInstance'> & {
    new(...config: ConstructorParameters<T>): InstanceType<T>;
    getInstance: Exclude<T['getInstance'], Falsy> | CacheMethod<T>;
  } : T & {getInstance: CacheMethod<T>};

/**
 * Cache instances by JSON-serialized constructor arguments. Existing callable
 * methods keep their signatures; possibly-falsy members include the new method.
 * Non-positive limits can immediately evict the instance just created.
 */
function thinkInstance<T extends Constructor>(
  cls: T, maxLength?: number, beforeDeleteMethod?: string
): Wrapped<T>;
function thinkInstance(cls: RuntimeConstructor & {getInstance?: unknown}, maxLength = 10, beforeDeleteMethod = 'close') {
  assert(helper.isFunction(cls), 'cls must be a function');

  if (cls.getInstance) return cls;

  let index = classArray.indexOf(cls);
  if (index === -1) {
    classArray.push(cls);
    index = classArray.length - 1;
  }
  if (!instanceArray[index]) {
    instanceArray[index] = {};
  }
  const item = instanceArray[index];

  // Assignment in the original non-strict CommonJS source silently failed for
  // frozen/read-only constructors. Reflect.set keeps that behavior in TS output.
  Reflect.set(cls, 'getInstance', function getInstance(...config: unknown[]) {
    const md5 = helper.md5(JSON.stringify(config));
    if (!item[md5]) {
      item[md5] = new cls(...config);
      if (Object.keys(item).length > maxLength) {
        for (const key in item) {
          // The cleanup name is dynamic. Keep the historical truthy check and
          // method receiver, including TypeError for a truthy non-function.
          const instance = item[key] as Record<string, (() => unknown) | undefined>;
          if (instance[beforeDeleteMethod]) {
            instance[beforeDeleteMethod]();
          }
          delete item[key];
          break;
        }
      }
    }
    return item[md5];
  });
  return cls;
}

export = thinkInstance;
