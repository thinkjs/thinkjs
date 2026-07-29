const EventEmitter = require('events');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function globToRegExp(pattern) {
  const source = String(pattern)
    // 先转义正则特殊字符，但保留 Redis glob 符号
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');

  return new RegExp(`^${source}$`);
}

class FakeScanStream extends EventEmitter {
  constructor(keys, count = 10) {
    super();

    this.keys = keys;
    this.count = count;
    this.cursor = 0;
    this.paused = false;
    this.ended = false;
    this.started = false;
  }

  start() {
    if (this.started) return;

    this.started = true;

    // 保证调用方有机会先注册 data/end 监听器
    queueMicrotask(() => {
      this.readNext();
    });
  }

  readNext() {
    if (this.paused || this.ended) return;

    if (this.cursor >= this.keys.length) {
      this.ended = true;
      this.emit('end');
      return;
    }

    const chunk = this.keys.slice(
      this.cursor,
      this.cursor + this.count
    );

    this.cursor += chunk.length;
    this.emit('data', chunk);

    // 如果 data 监听器没有 pause，则继续读取下一批
    if (!this.paused) {
      queueMicrotask(() => {
        this.readNext();
      });
    }
  }

  pause() {
    this.paused = true;
    return this;
  }

  resume() {
    if (this.ended) return this;

    this.paused = false;

    queueMicrotask(() => {
      this.readNext();
    });

    return this;
  }
}
module.exports = class FakeRedis extends EventEmitter {
  constructor() {
    super();

    this.data = new Map();
    this.timers = new Map();

    // 兼容 think-redis 内部的访问
    this.connector = {
      connecting: true
    };
  }

  async set(key, value, type, expire) {
    await sleep(50);

    key = String(key);
    this.data.set(key, String(value));

    if (type && expire) {
      const timeout = type === 'EX'
        ? Number(expire) * 1000
        : Number(expire);

      const timer = setTimeout(() => {
        this.data.delete(key);
        this.timers.delete(key);
      }, timeout);

      // 不让该定时器阻止 Node.js 测试进程退出
      if (typeof timer.unref === 'function') {
        timer.unref();
      }

      this.timers.set(key, timer);
    }

    return 'OK';
  }

  async get(key) {
    await sleep(50);

    return this.data.has(key)
      ? this.data.get(key)
      : null;
  }

  async del(key) {
    await sleep(50);

    const result = this.data.delete(key) ? 1 : 0;
    return result;
  }

  async incr(key) {
    await sleep(50);

    const value = Number(this.data.get(key) || 0) + 1;
    this.data.set(key, String(value));
    return value;
  }

  async decr(key) {
    await sleep(50);

    const value = Number(this.data.get(key) || 0) - 1;
    this.data.set(key, String(value));
    return value;
  }
  /**
   * mock ioredis scanStream。
   *
   * support：
   * - match
   * - count
   * - pause()
   * - resume()
   * - data event
   * - end event
   */
  scanStream(options = {}) {
    const {
      match = '*',
      count = 10
    } = options;

    const regexp = globToRegExp(match);

    const keys = [...this.data.keys()]
      .filter(key => regexp.test(key));

    const stream = new FakeScanStream(keys, count);

    stream.start();

    return stream;
  }

  pipeline() {
    const commands = [];

    const pipeline = {
      del: (...keys) => {
        commands.push({
          name: 'del',
          args: keys
        });

        return pipeline;
      },

      exec: async() => {
        const results = [];

        for (const command of commands) {
          try {
            const result = await this[command.name](
              ...command.args
            );

            // ioredis pipeline.exec() 返回 [error, result]
            results.push([null, result]);
          } catch (err) {
            results.push([err, null]);
          }
        }

        return results;
      }
    };

    return pipeline;
  }

  disconnect() {
    this.connector.connecting = false;
    this.emit('end');
  }
};
