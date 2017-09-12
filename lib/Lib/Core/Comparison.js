"use strict";

var COMPARISON = {
  EQ: '=',
  NEQ: '!=',
  '<>': '!=',
  GT: '>',
  EGT: '>=',
  LT: '<',
  ELT: '<=',
  NOTLIKE: 'NOT LIKE',
  LIKE: 'LIKE',
  NOTILIKE: 'NOT ILIKE',
  ILIKE: 'ILIKE',
  IN: 'IN',
  NOTIN: 'NOT IN'
};
var allowKeys = ['EXP', 'BETWEEN', 'NOT BETWEEN'];
var keys = Object.keys(COMPARISON);

exports.COMPARISON = COMPARISON;
exports.COMPARISON_LIST = keys.concat(keys.map(function(item) {
  return COMPARISON[item];
})).concat(allowKeys);
