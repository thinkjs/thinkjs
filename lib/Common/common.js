'use strict';
var utils = require('thinkjs-util');
for(var name in utils){
  global[name] = utils[name];
}