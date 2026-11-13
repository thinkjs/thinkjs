module.exports =
  (namespace) =>
  (...args) => {
    const think = globalThis.think;
    if (think && think.app && think.app.options && think.app.options.debug) {
      const logger = think.logger;
      if (logger && logger.debug) logger.debug(namespace, ...args);
    }
  };
