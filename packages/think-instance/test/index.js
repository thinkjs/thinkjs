const {test} = require('node:test');
const assert = require('node:assert/strict');
const thinkInstance = require('../index.js');
const helper = require('think-helper');

test('.getInstance is function', t => {
  let cls = class {
    constructor(){
      this.name = 1;
    }
  }
  cls = thinkInstance(cls);
  assert.strictEqual(helper.isFunction(cls.getInstance), true);
});

test('get same instance', t => {
  let cls = class {
    constructor(){
      this.name = 1;
    }
  }
  cls = thinkInstance(cls);
  const instance1 = cls.getInstance({})
  const instance2 = cls.getInstance({});
  assert.strictEqual(instance1 === instance2, true);
});
test('get different instance', t => {
  let cls = class {
    constructor(){
      this.name = 1;
    }
  }
  cls = thinkInstance(cls);
  const instance1 = cls.getInstance({})
  const instance2 = cls.getInstance({name: 1});
  assert.strictEqual(instance1 === instance2, false);
});

test('get different instance 2', t => {
  let cls = class {
    constructor(){
      this.name = 1;
    }
  }
  cls = thinkInstance(cls);
  const instance1 = cls.getInstance({})
  const instance2 = cls.getInstance({name: 1});
  const instance3 = cls.getInstance({name: 1});
  assert.strictEqual(instance1 === instance2, false);
  assert.strictEqual(instance2 === instance3, true);
});

test('get different instance 2 #2', t => {
  let cls = class {
    constructor(){
      this.name = 1;
    }
  }
  cls = thinkInstance(cls);
  const instance2 = cls.getInstance({name: 1});
  const instance3 = cls.getInstance({name: 1}, 2);
  assert.strictEqual(instance2 === instance3, false);
});

test('get instance, set max', t => {
  let close = false;
  let cls = class {
    constructor(){
      this.name = 1;
    }
    close(){
      close = true;
    }
  }
  cls = thinkInstance(cls, 1, 'close');
  const instance1 = cls.getInstance({name: 1});
  const instance2 = cls.getInstance({name: 1}, 2);
  assert.strictEqual(close, true);
});

test('get instance, set max & close', t => {
  let close = false;
  let cls = class {
    constructor(){
      this.name = 1;
    }
    close2(){
      close = true;
    }
  }
  cls = thinkInstance(cls, 1, 'close2');
  const instance1 = cls.getInstance({name: 1});
  const instance2 = cls.getInstance({name: 1}, 2);
  assert.strictEqual(close, true);
});

test('get instance, set max & close 2', t => {
  let close = false;
  let cls = class {
    constructor(){
      this.name = 1;
    }
  }
  cls = thinkInstance(cls, 1, 'close2');
  const instance1 = cls.getInstance({name: 1});
  const instance2 = cls.getInstance({name: 1}, 2);
  assert.strictEqual(close, false);
});

test('get instance, set max & close 3', t => {
  let close = 0;
  let cls = class {
    constructor(index){
      this.index = index;
    }
    close(){
      close += this.index;
    }
  }
  cls = thinkInstance(cls, 1, 'close');
  const instance1 = cls.getInstance(2);
  const instance2 = cls.getInstance(3);
  const instance3 = cls.getInstance(4);
  assert.strictEqual(close, 5);
});



test('get instance with multi args', t => {
  let cls = class {
    constructor(name, value){
      this.name = name;
      this.value = value;
    }
  }
  cls = thinkInstance(cls);
  const instance1 = cls.getInstance('name', 'thinkjs')
  assert.strictEqual(instance1.name === 'name', true);
  assert.strictEqual(instance1.value === 'thinkjs', true);
});