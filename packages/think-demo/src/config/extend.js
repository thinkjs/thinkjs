const view = require('think-view');
const fetch = require('think-fetch');
const model = require('think-model');

module.exports = [
  view, //make application support view
  fetch, // HTTP request client
  model,
];