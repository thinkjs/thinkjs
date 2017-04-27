import test from 'ava';
import thinkInstance from '../index.js';
import helper from 'think-helper';

test('.getInstance is function', t => {
  let cls = class {
    constructor(){
      this.name = 1;
    }
  }
  cls = thinkInstance(cls);
  t.is(helper.isFunction(cls.getInstance), true);
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
  t.is(instance1 === instance2, true);
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
  t.is(instance1 === instance2, false);
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
  t.is(instance1 === instance2, false);
  t.is(instance2 === instance3, true);
});

test('get different instance 2', t => {
  let cls = class {
    constructor(){
      this.name = 1;
    }
  }
  cls = thinkInstance(cls);
  const instance2 = cls.getInstance({name: 1});
  const instance3 = cls.getInstance({name: 1}, 2);
  t.is(instance2 === instance3, false);
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
  t.is(close, true);
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
  t.is(close, true);
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
  t.is(close, false);
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
  t.is(close, 5);
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
  t.is(instance1.name === 'name', true);
  t.is(instance1.value === 'thinkjs', true);
});