const path = require('path');

module.exports = app => {
  const think = app.think;
  const isDev = think.env === 'development';
  const mockPath = think.config('mock') || path.join(think.ROOT_PATH, 'mock');

  function mockControllerAction(target, name, descriptor) {
    const fn = descriptor.value;
    descriptor.value = function() {
      if (!isDev) return fn.apply(this, arguments); // 非开发模式禁用mock

      // 存在 this.action 调用，所以不能直接 this.ctx.controller 来获取 controllerName
      const reg = new RegExp(`${think.ROOT_PATH}(/app)?/controller/(.+)`);
      const controllerName = ((this.__filename.match(reg) || [])[2] || '').replace(/\.[^/.]+$/, '');
      const actionOrMethodName = name.replace(/(\w+)Action$/, '$1');
      const mockFileBasePath = path.join(mockPath, controllerName, actionOrMethodName);

      const jsFilePath = `${mockFileBasePath}.js`;
      if (think.isFile(jsFilePath)) {
        think.logger.info('MockSuccess:', jsFilePath);
        delete require.cache[require.resolve(jsFilePath)]; // disable require cache
        const data = think.interopRequire(jsFilePath, true);
        const isActionType = /\w+Action$/.test(name);
        return isActionType ? this.json(data) : data;
      }
      think.logger.error('MockFail:', mockFileBasePath);
      return fn.apply(this, arguments);
    };
    return descriptor;
  }

  function mockServiceAction(target, name, descriptor) {
    const fn = descriptor.value;
    descriptor.value = function() {
      if (!isDev) return fn.apply(this, arguments); // 非开发模式禁用mock

      const reg = new RegExp(`${think.ROOT_PATH}(/app)?/service/(.+)`);
      const serviceName = ((this.__filename.match(reg) || [])[2] || '').replace(/\.[^/.]+$/, '');
      const methodName = name;

      const mockFileBasePath = path.join(mockPath, 'service', serviceName, methodName);
      const jsFilePath = `${mockFileBasePath}.js`;
      if (think.isFile(jsFilePath)) {
        think.logger.info('MockSuccess:', jsFilePath);
        delete require.cache[require.resolve(jsFilePath)]; // disable require cache
        const data = think.interopRequire(jsFilePath, true);
        return data;
      }
      think.logger.error('MockFail:', mockFileBasePath);
      return fn.apply(this, arguments);
    };
    return descriptor;
  }

  return {
    mockControllerAction,
    mockServiceAction,
  }
};

