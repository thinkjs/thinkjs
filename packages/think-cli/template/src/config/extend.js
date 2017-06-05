const view = require('think-view');
const model = require('think-model');

module.exports = [
  view, //make application support view
  model(think.app)
];

