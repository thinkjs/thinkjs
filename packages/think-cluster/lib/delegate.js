const helper = require('think-helper');
const assert = require('assert');
const AgentClient = require('./agent_client.js');
const Agent = require('./agent.js');
const util = require('./util.js');

const agentClientInstance = AgentClient.getInstance();

function delegate(cls, classId) {
  assert(cls && helper.isFunction(cls), `delegate object required and must be a function`);

  classId = classId || helper.md5(cls).slice(0, 8);
  // in agent worker, not need delegate methods
  if (util.isAgent()) {
    Agent.register(classId, cls);
    return cls;
  }
  // agent worker is not enabled
  if (!util.enableAgent()) return cls;

  const delegateCls = class delegateCls extends cls {};
  let methods = delegateCls.delegateMethods;
  if (helper.isFunction(methods)) {
    methods = methods();
  }
  assert(helper.isArray(methods) && methods.length, 'delegateMethods required and must be an array');

  let cArgs = null;
  delegateCls.prototype.constructor = function() {
    cArgs = arguments;
    delegateCls.apply(this, arguments);
  };
  methods.forEach(method => {
    assert(helper.isFunction(delegateCls.prototype[method]), `.${method} is not a function`);
    const methodFn = delegateCls.prototype[method];
    delegateCls.prototype[method] = function() {
      // if agent client is closed, run method directly
      if (agentClientInstance.isClosed) {
        return methodFn.apply(this, arguments);
      };
      return agentClientInstance.send({
        classId,
        cArgs, // constructor arguments
        method,
        mArgs: arguments // method arguments
      }, {ctx: this, method: methodFn});
    };
  });
  return delegateCls;
}

module.exports = delegate;
