const assert = require('assert');
const helper = require('think-helper');

function invokeController(options, app){
  
  return (ctx, next) => {
    const isMultiModule = app.modules.length;
    const controllers = app.controllers;

    if(isMultiModule){
      assert(ctx.module, 'ctx.module required in multi module');
    }
    assert(ctx.controller, 'ctx.controller required');
    assert(ctx.action, 'ctx.action required');
    
    if(isMultiModule){
      controllers = controllers[ctx.module];
    }
    //controllers empty
    if(helper.isEmpty(controllers)){
      return next();
    }
    let controller = controllers[ctx.controller];
    // controller not exist
    if(helper.isEmpty(controller)){
      return next();
    }
    const instance = new controller(ctx);
    let promise = Promise.resolve();
    if(instance.__before){
      promise = Promise.resolve(instance.__before());
    }
    // if return false, it will be prevent next process
    return promise.then(data => {
      if(data === false) return false;
      let method = `${ctx.action}Action`;
      if(!instance[method]){
        method = '__call';
      }
      if(instance[method]){
        return instance[method]();
      }
    }).then(data => {
      if(data === false) return false;
      if(instance.__after){
        return instance.__after();
      }
    }).then(data => {
      if(data !== false){
        return next();
      }
    });
  }
}

module.exports = invokeController;