const assert = require('assert');
const { runHttpQuery } = require('apollo-server-core');

/**
 * [thinkGraphql description]
 * @param  {[type]} options [graphql options]
 * @return {[type]}         [description]
 */
function thinkGraphql(options) {
  assert(arguments.length === 1, `Graphql expects exactly one argument, got ${arguments.length}`);
  return runHttpQuery([this.ctx], {
    method: this.ctx.method,
    options: options,
    query: this.ctx.method === 'GET' ? this.ctx.param() : this.ctx.post()
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
  controller: {
    thinkGraphql: thinkGraphql
  }
};
