const helper = require('think-helper');
const Logger = require('./');

const LOGGER = Symbol('logger');

module.exports = {
  context: {
    get logger() {
      if (!this[LOGGER]) {
        this[LOGGER] = new Logger(helper.parseAdapterConfig(this.config('logger')), true);
      }

      return this[LOGGER];
    }
  },
  controller: {
    get logger() {
      return this.ctx.logger;
    }
  }
};
