import assert = require('assert');
import helper = require('think-helper');
import createDebug = require('debug');

const debug = createDebug('think-gc');

interface Collectible {
  gcType: string;
  gc(): unknown;
}

// Predicate return values are tested for truthiness; promises are not awaited.
type Interval = number | string | (() => unknown);

// min interval, 1 hour
const MIN_STEP = 3600 * 1000;
let intervalTimes = 0;
const gcTypes: Record<string, () => void> = {};
let timerStart = false;

function gc<T extends Collectible>(instance: T, interval: Interval = MIN_STEP, MIN_INTERVAL = MIN_STEP): void {
  assert(instance && helper.isFunction(instance.gc), 'instance.gc must be a function');
  assert(instance && helper.isString(instance.gcType), 'instance.gcType must be a string');
  if (gcTypes[instance.gcType]) return;

  // The legacy CommonJS assignment failed silently for inherited read-only
  // falsy properties. Preserve that behavior under strict TypeScript emission.
  Reflect.set(gcTypes, instance.gcType, function() {
    if (helper.isFunction(interval)) {
      // Keep helper.isFunction semantics rather than changing the runtime guard.
      if (!(interval as () => unknown)()) return;
    } else {
      interval = helper.ms(interval);
      const num = Math.floor(interval / MIN_INTERVAL);
      if (intervalTimes % num !== 0) return;
    }
    debug(`run gc, type: ${instance.gcType}`);
    instance.gc();
  });

  if (!timerStart) {
    timerStart = true;
    const timer = setInterval(() => {
      intervalTimes++;
      for (const type in gcTypes) {
        gcTypes[type]();
      }
    }, MIN_INTERVAL);
    if (timer.unref) timer.unref();
  }
}

export = gc;
