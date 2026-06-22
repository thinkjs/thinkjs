const EventEmitter = require('events');

module.exports = class FakeRedis extends EventEmitter {
  constructor() {
    super();

    this.data = new Map();

    // 兼容 think-redis 内部的访问
    this.connector = {
      connecting: true
    };
  }

  async set(key, value, type, expire) {
    this.data.set(key, String(value));

    if (type && expire) {
      const timeout = type === 'EX' ? expire * 1000 : expire;

      setTimeout(() => {
        this.data.delete(key);
      }, timeout);
    }

    return 'OK';
  }

  async get(key) {
    return this.data.has(key)
      ? this.data.get(key)
      : null;
  }

  async del(key) {
    const result = this.data.delete(key) ? 1 : 0;
    console.log(Array.from(this.data));
    return result;
  }

  async incr(key) {
    const value = Number(this.data.get(key) || 0) + 1;
    this.data.set(key, String(value));
    return value;
  }

  async decr(key) {
    const value = Number(this.data.get(key) || 0) - 1;
    this.data.set(key, String(value));
    return value;
  }

  disconnect() {
    this.connector.connecting = false;
  }
};