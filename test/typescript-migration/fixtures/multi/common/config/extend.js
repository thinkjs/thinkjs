module.exports = [{ context: { order: 'first', first: true, isGet: 'configured' } }, { context: { order: 'second', second: true }, service: { identity() { return this; } } }];
