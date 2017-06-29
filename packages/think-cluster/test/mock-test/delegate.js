const test = require('ava');
const delegate = require('../../lib/delegate')

class MyClass {

  static delegateMethods(){
    return ['get','set'];
  }

  get(name){}

  set(name,value){}
}

test.serial('normal case', async t => {

  process.env.THINK_ENABLE_AGENT = false;

  const cls = delegate(MyClass);
  let instance = new cls();

  t.is(instance instanceof MyClass,true)
  t.is(cls.name,'delegateCls')
});

test.serial('normal case', async t => {
  process.env.THINK_AGENT_WORKER = true;
  const cls = delegate(MyClass);
  t.is(cls.name,'MyClass')
});


// class MyClass {
//
//   static delegateMethods(){
//     return ['get','set']
//   }
//
//   get(name){}
//
//   set(name,value){}
// }
//
// function delegate(cls){
//   let delegateCls = class delegateCls extends cls {};
//   let cArgs = null;
//
//   delegateCls.prototype.constructor = function(){
//     cArgs = arguments;
//     delegateCls.apply(this, arguments);
//   }
//
//   let methods = delegateCls.delegateMethods();
//   methods.forEach(method =>{
//     delegateCls.prototype[method] = function(){
//       console.log(method)
//     }
//   })
//
//   return delegateCls;
// }
//
// let d = delegate(MyClass);
//
// console.log(new d())