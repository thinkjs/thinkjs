const assert = require('assert');
const helper = require('think-helper');
const debug = require('debug')('think-gc');

// min interval, 1 hour
const MIN_STEP = 3600 * 1000;
let intervalTimes = 0;
const gcTypes = {};
let timerStart = false;

function gc(instance, interval = MIN_STEP, MIN_INTERVAL = MIN_STEP) {
  assert(instance && helper.isFunction(instance.gc), 'instance.gc must be a function');
  assert(instance && helper.isString(instance.gcType), 'instance.gcType must be a string');
  if (gcTypes[instance.gcType]) return;

  gcTypes[instance.gcType] = function() {
    if (helper.isFunction(interval)) {
      if (!interval()) return;
    } else {
      interval = helper.ms(interval);
      const num = Math.floor(interval / MIN_INTERVAL);
      if (intervalTimes % num !== 0) return;
    }
    debug(`run gc, type: ${instance.gcType}`);
    instance.gc();
  };

  if (!timerStart) {
    timerStart = true;
    const timer = setInterval(() => {
      intervalTimes++;
      for (const type in gcTypes) {
        gcTypes[type]();
      }
    }, MIN_INTERVAL);
    timer.unref && timer.unref();
  }
}

module.exports = gc;
