const assert = require('assert');
const helper = require('think-helper');
/**
 * invoke logic
 */

function invokeLogic(options, app){
  return (ctx, next) => {
    const isMultiModule = app.modules.length;
    if(isMultiModule){
      assert(ctx.module, 'module can not be blank in multi module');
    }
    assert(ctx.controller, 'controller can not be blank');
    assert(ctx.action, 'action can not be blank');

    const logics = app.logics;
    if(isMultiModule){
      logics = logics[ctx.module];
    }
    //logics empty
    if(helper.isEmpty(logics)){
      return next();
    }
    let logic = logics[ctx.controller];
    // logic not exist
    if(helper.isEmpty(logic)){
      return next();
    }
    const instance = new logic(ctx);
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
        return Promise.resolve(instance[method]())
      }
    }).then(data => {
      if(data === false) return false;
      if(instance.__after){
        return Promise.resolve(instance.__after());
      }
    }).then(data => {
      if(data !== false){
        return next();
      }
    });
  }
}

module.exports = invokeLogic;