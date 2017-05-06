import test from "ava";
import mock from 'mock-require';

let redisData = {};
const fileList = ['lalaland', 'Sing', 'Zootopia', 'Kung fu panda', 'Frozen', 'Ice Age'];
const debugData = [];
function mockRequire() {
  mockIORedis();
  return mock.reRequire('../index');
}
function mockDebug(param = []) {
  const debug1 = function(str) {
    
    return function(err) {
      param.push(err);
    }
  }
  mock('debug', debug1);
}
function mockIORedis() {
  class ThinkRedis {
    constructor() {
      this.connector = {
        connecting: true
      }
    }
    get(key) {
      return new Promise((resolve, reject) => {
        resolve(redisData[key]);
      });
    }
    set(key, val, type, expire) {
      return new Promise((resolve, reject) => {
        redisData[key] = val;
      
        if(expire) {
          if(this.expireTimeout) {
            clearTimeout(this.expireTimeout);
          }
          this.expireTimeout = setTimeout(()=> {
            this.expireTimeout = null;
            this.del(key);
          }, expire);
        } 
        resolve('OK');
      });
    }
    del(key) {
      delete redisData[key];
    }
  }
  mock('ioredis', ThinkRedis);
}

function sleep(dur) {
  dur = dur || 100;
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve();
    }, dur);
  });
}

test.serial('1. set and get session data without maxAge', t => {
  const cookieName = fileList[0];
  return new Promise(async (resolve, reject) => {
    const RedisSession = mockRequire();
    const options = {
      cookie: cookieName,
      autoUpdate: true
    }
    const ctx = {
      res: {
        once: function(status, fn) {
          setTimeout(function() {
            fn();
          }, 10);
        }
      }
    }
    const redisSession = new RedisSession(options, ctx);
    await redisSession.set('abc', '123');

    t.deepEqual(redisSession.data, {
      'abc': '123'
    });
    await sleep(100);
    const data = await redisSession.get('abc');
    t.is(data, '123');

    const redisSession1 = new RedisSession(options, ctx);
    const data1 = await redisSession1.get('abc');
    t.is(data1, '123');
    const data2 = await redisSession1.get();
    t.deepEqual(data2, {
      'abc': '123'
    });
    redisSession1.delete();
    t.deepEqual(redisSession1.data, {});

    resolve();
  });
});
test.serial('2. set and get session data with short maxAge', t => {
  const cookieName = fileList[1];
  return new Promise(async (resolve, reject) => {
    const RedisSession = mockRequire();
    const options = {
      cookie: cookieName,
      maxAge: 50
    }
    const ctx = {
      res: {
        once: function(status, fn) {
          setTimeout(function() {
            fn();
          }, 10);
        }
      }
    }
    const redisSession = new RedisSession(options, ctx);
    await redisSession.set('abc', '123');

    t.deepEqual(redisSession.data, {
      'abc': '123'
    });
    await sleep(100);
   
    const redisSession1 = new RedisSession(options, ctx);
    const data1 = await redisSession1.get('abc');
    t.is(data1, undefined);
    resolve();
  });
});

test.serial('3. set and get session data with fresh param', t => {
  const cookieName = fileList[2];
  return new Promise(async (resolve, reject) => {
    const RedisSession = mockRequire();
    const options = {
      cookie: cookieName,
      fresh: true
    }
    const ctx = {
      res: {
        once: function(status, fn) {
          setTimeout(function() {
            fn();
          }, 10);
        }
      }
    }
    const redisSession = new RedisSession(options, ctx);
    await redisSession.set('abc', '123');

    t.deepEqual(redisSession.data, {
      'abc': '123'
    });

    

    resolve();
  });
});
test.serial('4. set and get session data when JSON.parse(content) returns error', t => {
  const cookieName = fileList[3];
  return new Promise(async (resolve, reject) => {
    const debugParam = [];
    mockDebug(debugParam);
    const RedisSession = mockRequire();
    const options = {
      cookie: cookieName,
      maxAge: '1d'
    }
    const ctx = {
      res: {
        once: function(status, fn) {
          setTimeout(function() {
            fn();
          }, 10);
        }
      }
    }

    redisData[cookieName] = '{}';
    const redisSession = new RedisSession(options, ctx);
    await redisSession.set('abc', '123');
    await sleep(100);
    
    redisData[cookieName] = 'zz';
    const redisSession1 = new RedisSession(options, ctx);
    await redisSession1.set('abc', '123');
    
    t.is(debugParam.length, 1);
    resolve();
  });
});
 
test.serial('5. set and get session data when options is undefined', t => {
  return new Promise(async (resolve, reject) => {
   
    const RedisSession = mockRequire();
  
    const ctx = {
      res: {
        once: function(status, fn) {
          setTimeout(function() {
            fn();
          }, 10);
        }
      }
    }

    const error = t.throws(()=>{
      const redisSession = new RedisSession(undefined, ctx);
    });
    t.is(error.message, '.cookie required');
    
    resolve();
  });
});