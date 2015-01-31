/**
 * thinkjs module path config
 * @type {Object}
 */
var root = think.THINK_LIB_PATH;
module.exports = {
  base: root + '/core/base.js',
  controller: root + '/controller/base.js',
  rest_controller: root + '/controller/rest.js',
  model: root + '/model/base.js',
  db_model: root + '/model/db.js',
  mongo_model: root + '/model/mongo.js',
  av_model: root + '/model/adv.js',
  relation_model: root + '/model/relation.js',
  app: root + '/core/app.js',
};