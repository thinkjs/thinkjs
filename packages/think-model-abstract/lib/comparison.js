const COMPARISON = {
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
const allowKeys = ['EXP', 'BETWEEN', 'NOT BETWEEN'];
const keys = Object.keys(COMPARISON);

exports.COMPARISON = COMPARISON;
exports.COMPARISON_LIST = keys.concat(keys.map(item => COMPARISON[item])).concat(allowKeys);
