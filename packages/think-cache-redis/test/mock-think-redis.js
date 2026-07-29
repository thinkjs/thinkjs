module.exports = class MockThinkRedis {
  constructor() {
    this.store = new Map();
    this.calls = {
      get: [],
      set: [],
      delete: [],
      deleteRegKey: []
    };
  }

  async get(key) {
    key = String(key);
    this.calls.get.push([key]);

    return this.store.has(key)
      ? this.store.get(key)
      : null;
  }

  async set(key, value, type, expire) {
    key = String(key);

    this.calls.set.push([
      key,
      value,
      type,
      expire
    ]);

    this.store.set(key, value);

    return 'OK';
  }

  async delete(key) {
    key = String(key);
    this.calls.delete.push([key]);

    return this.store.delete(key)
      ? 1
      : 0;
  }

  async deleteRegKey(pattern) {
    pattern = String(pattern);
    this.calls.deleteRegKey.push([pattern]);

    const regexp = globToRegExp(pattern);

    for (const key of Array.from(this.store.keys())) {
      if (regexp.test(key)) {
        this.store.delete(key);
      }
    }

    return 'OK';
  }

  clear() {
    this.store.clear();

    this.calls.get = [];
    this.calls.set = [];
    this.calls.delete = [];
    this.calls.deleteRegKey = [];
  }
}

function globToRegExp(pattern) {
  const source = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');

  return new RegExp(`^${source}$`);
}
