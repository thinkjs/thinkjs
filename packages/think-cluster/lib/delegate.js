const helper = require('think-helper');
const assert = require('assert');
const AgentClient = require('./agent_client.js');
const util = require('./util.js');
const agentClient = new AgentClient();

function delegate(cls, classId){
  assert(cls && helper.isFunction(cls), `delegate object required and must be a function`);
  //no need delegate workers
  if(!util.canDelegate()) return cls;

  classId = classId || helper.md5(cls).slice(0, 8);
  //it's already registered
  if(!agentClient.register(classId, cls)) return cls;
  //in agent worker, can not delegate methos
  if(util.isAgent()) return cls;

  let methods = cls.delegateMethods;
  if(helper.isFunction(methods)){
    methods = methods();
  }
  assert(helper.isArray(methods) && methods.length, 'delegateMethods required and must be an array');

  let cArgs = null;
  cls.prototype.constructor = function(){
    cArgs = arguments;
    cls.apply(this, arguments);
  }
  methods.forEach(method => {
    assert(helper.isFunction(cls.prototype[method]), `.${method} is not a function`);
    let methodFn = cls.prototype[method];
    cls.prototype[method] = function(){
      //if agent client is closed, run method directly
      if(agentClient.isClosed){
        return methodFn.apply(this, arguments);
      };
      return agentClient.send({
        classId,
        cArgs, //constructor arguments
        method,
        mArgs: arguments //method arguments
      }, {ctx: this, method: methodFn});
    }
  });
  return cls;
}

module.exports = delegate;