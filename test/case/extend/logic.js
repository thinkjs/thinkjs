import test from 'ava';
const mock = require('mock-require');
const mockie = require('../../lib/mockie');
mockie.mockThinkValidator();
let logic = require('../../../lib/extend/logic');
const mockThink = {
  app:{
    validators:{}
  }
};

global.think = Object.assign({}, mockThink);

test.serial('validate with empty rules', async t => {
  let result = logic.validate();

  t.is(result,undefined)
});

test.serial('validate pass', async t => {
  let rules = {
    mockResult:false,
    username: {
      string: true,       // 字段类型为 String 类型
      required: true,     // 字段必填
      default: 'thinkjs', // 字段默认值为 'thinkjs'
      trim: true,         // 字段需要trim处理
      method: 'GET'       // 指定获取数据的方式
    },
    age: {
      int: {min: 20, max: 60} // 20到60之间的整数
    }
  }
  think.app.validators.rules = {
    name:{string:true},
    version:{string:true}
  };
  let flag = logic.validate(rules);
  t.is(flag,true);
  think.app.validators.rules = null;
});

test.serial('validate error', async t => {
  let rules = {
    mockResult:true,
    username: {
      string: true,       // 字段类型为 String 类型
      required: true,     // 字段必填
      default: 'thinkjs', // 字段默认值为 'thinkjs'
      trim: true,         // 字段需要trim处理
      method: 'GET'       // 指定获取数据的方式
    },
    age: {
      int: {min: 20, max: 60} // 20到60之间的整数
    }
  };
  let flag = logic.validate(rules);
  t.is(flag,false);
});

test.serial('_after', async t => {
  const ret = logic.__after();
  t.is(ret,undefined);
});

test.serial('_after', async t => {
  logic.allowMethods = ['POST','GET'];
  logic.config = ()=>{};
  logic.fail = ()=>{};
  const ret = logic.__after();
  t.is(ret,false);
});

test.serial('_after', async t => {
  logic.allowMethods = 'POST,GET';
  logic.method = 'GET';
  logic.config = ()=>{};
  logic.fail = ()=>{};
  const ret = logic.__after();
  t.is(ret,undefined);
});

test.serial('_after', async t => {
  logic.rules = {
    mockResult:false,
    username: {
      string: true,       // 字段类型为 String 类型
      required: true,     // 字段必填
      default: 'thinkjs', // 字段默认值为 'thinkjs'
      trim: true,         // 字段需要trim处理
      method: 'GET'       // 指定获取数据的方式
    },
    age: {
      int: {min: 20, max: 60} // 20到60之间的整数
    }
  };
  let ret = logic.__after();
  t.is(ret,undefined);
});

test.serial('_after', async t => {
  logic = mock.reRequire('../../../lib/extend/logic');
  logic.rules = {
    mockResult:true,
    username: {
      string: true,       // 字段类型为 String 类型
      required: true,     // 字段必填
      default: 'thinkjs', // 字段默认值为 'thinkjs'
      trim: true,         // 字段需要trim处理
      method: 'GET'       // 指定获取数据的方式
    },
    age: {
      int: {min: 20, max: 60} // 20到60之间的整数
    }
  };
  logic.config = ()=>{};
  logic.fail = ()=>{};
  let ret = logic.__after();
  t.is(ret,false);
});

test.serial('_after', async t => {
  logic = mock.reRequire('../../../lib/extend/logic');
  logic.rules = {
    mockResult:false,
    username: {
      string: true,       // 字段类型为 String 类型
      required: true,     // 字段必填
      default: 'thinkjs', // 字段默认值为 'thinkjs'
      trim: true,         // 字段需要trim处理
      method: 'GET'       // 指定获取数据的方式
    },
    age: {
      int: {min: 20, max: 60} // 20到60之间的整数
    }
  };
  logic.config = ()=>{};
  logic.fail = ()=>{};
  let ret = logic.__after();
  t.is(ret,undefined);
});
