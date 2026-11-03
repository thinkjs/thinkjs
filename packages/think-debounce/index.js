"use strict";
/**
 * Debounce class
 * runs a time-consuming operation. The operation may be called several times concurrently
 * but within think-debounce, it will only be run once before it's finished.
 */
class Debounce {
    constructor() {
        this.queues = {};
    }
    /**
     * debounce
     * @param {String} key
     * @param {Function} fn
     */
    debounce(key, fn) {
        if (!(key in this.queues)) {
            this.queues[key] = [];
            return Promise.resolve().then(() => {
                return fn();
            }).then(data => {
                process.nextTick(() => {
                    this.queues[key].forEach(deferred => deferred.resolve(data));
                    delete this.queues[key];
                });
                return data;
            }).catch(err => {
                process.nextTick(() => {
                    this.queues[key].forEach(deferred => deferred.reject(err));
                    delete this.queues[key];
                });
                return Promise.reject(err);
            }); // Native promises recursively unwrap callback results.
        }
        else {
            return new Promise((resolve, reject) => {
                this.queues[key].push({
                    // A shared key must represent the same operation/result type.
                    // The heterogeneous queue erases T; restore it only at this boundary.
                    resolve: value => resolve(value),
                    reject
                });
            });
        }
    }
}
module.exports = Debounce;
