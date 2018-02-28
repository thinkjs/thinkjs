const assert = require('assert');
const { runHttpQuery } = require('apollo-server-core');

/**
 * [thinkGraphql description]
 * @param  {[type]} options [graphql options]
 * @return {[type]}         [description]
 */
function thinkGraphql(options, ctx = this.ctx) {
  assert(arguments.length === 2, `Graphql expects exactly two argument, got ${arguments.length}`);
  return runHttpQuery([ctx], {
    method: ctx.method,
    options: options,
    query: ctx.method === 'GET' ? ctx.param() : ctx.post()
  }).then(res => {
    return res;
  }, err => {
    if ('HttpQueryError' !== err.name) {
      throw err;
    }
    return err;
  });
}


/**
 * extends to controller
 */
module.exports = {
  think: {
    thinkGraphql: thinkGraphql
  },
  controller: {
    thinkGraphql: thinkGraphql
  }
};
