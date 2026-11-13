import wrap = require('@thinkjs-build-fixture/core');

function describe(value: number): string {
  return String(wrap(value).value);
}
export = describe;
