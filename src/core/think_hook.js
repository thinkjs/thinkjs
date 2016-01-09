'use strict';


/**
 * regitster or exec hook
 * @param  {String} name []
 * @return {}      []
 */
let Hook = (...args) => {
  let [name, http, data] = args;
  //get hook data
  if (args.length === 1) {
    return thinkData.hook[name] || [];
  }
  //remove hook
  if(http === null){
    thinkData.hook[name] = [];
    return;
  }
  // set hook data
  // think.hook('test', ['middleware1', 'middleware2'])
  if(think.isArray(http) || !think.isHttp(http)){
    return Hook.set(name, http, data);
  }
  //exec hook
  return Hook.exec(name, http, data);
};

/**
 * set hook
 * @return {} []
 */
Hook.set = (name, hooks, flag) => {
  //think.hook.set('test', function or class)
  if(think.isFunction(hooks)){
    let mname = 'middleware_' + think.uuid();
    think.middleware(mname, hooks);
    hooks = [mname];
  }
  else if(!think.isArray(hooks)){
    hooks = [hooks];
  }
  else{
    let first = hooks[0];
    if(first === 'append' || first === 'prepend'){
      flag = hooks.shift();
    }
  }
  let oriHooks = thinkData.hook[name] || [];
  if(flag === 'append'){
    oriHooks = oriHooks.concat(hooks);
  }else if(flag === 'prepend'){
    oriHooks = hooks.concat(oriHooks);
  }else{
    oriHooks = hooks;
  }
  thinkData.hook[name] = oriHooks;
};

/**
 * exec hook
 * @param  {String} name [hook name]
 * @param  {Object} http []
 * @param  {Mixed} data []
 * @return {Promise}      []
 */
// think.hook.exec = async (name, http, data) => {
//   //exec hook 
//   let list = thinkData.hook[name];
//   if (!list || list.length === 0) {
//     return Promise.resolve(data);
//   }

//   let length = list.length;
//   for(let i = 0; i < length; i++){
//     let result = await think.middleware.exec(list[i], http, data);
//     //prevent next middlewares invoked in hook
//     if(result === null){
//       break;
//     }else if (result !== undefined) {
//       data = result;
//     }
//   }
//   return data;
// };

let _execItemMiddleware = (list, index, http, data) => {
  let item = list[index];
  if(!item){
    return data;
  }
  return think.middleware.exec(item, http, data).then(result => {
    if(result === null){
      return data;
    }else if(result !== undefined){
      data = result;
    }
    return _execItemMiddleware(list, index + 1, http, data);
  });
};

Hook.exec = (name, http, data) => {
  //exec hook 
  let list = thinkData.hook[name];
  if (!list || list.length === 0) {
    return Promise.resolve(data);
  }
  return _execItemMiddleware(list, 0, http, data);
};

export default Hook;