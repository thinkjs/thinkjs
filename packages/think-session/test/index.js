import test from 'ava';
import mock from 'mock-require';

function mockAssert(assertParams = []) {
  mock('assert', (condition, errmsg) => {
    if(!condition){
      assertParams.push(condition, errmsg);
      throw new Error("this is an assert failed signal");
    }
  });
}
function getSession() {
  return mock.reRequire('../lib/session');
}
// 1
test.serial('1. instantiate Session', t => {
  const sessionConfig = {
    type: 'cookie',
    cookie: {
      prop1: 'prop1',
      handle: 'cookie'
    },
    file: {
      prop2: 'prop2',
      handle: 'file'
    }
  };
  const ctx = {
    config(key){
      switch(key) {
        case 'session': 
          return sessionConfig;
        case 'cookie': 
          return cookieConfig;
      }
    }
  }
  const options = {
    type: 'file'
  };
  var assertParams = [];
  mockAssert(assertParams);
  const Session = getSession();
  let session;
  t.throws(() => {
    session = new Session(ctx, options);
  }, Error);
  t.deepEqual(assertParams, [
    false, 'session.handle must be a function'
  ]);
});

// 2
test.serial('2. `getSessionInstance` when handle.onlyCookie is true', t => {
  function mockHandler(onlyCookie) {
    //eg. think-session-cookie
    class cookieSession {
      constructor(options, ctx) {
        t.deepEqual(options, {
          name: 'thinkjs',
          autoUpdate: false,
          path: '/',
          httpOnly: true,
          sameSite: false,
          signed: false,
          overwrite: false,
          encrypt: true,
          config1: 'config1'
        });
      }
    }
    cookieSession.onlyCookie = onlyCookie;
    return cookieSession;
  } 
  const handle = mockHandler(true);
  const sessionConfig = {
    type: 'cookie',
    cookie: {
      prop1: 'prop1',
      handle
    }
  };
  let cookieConfig = {
    config1: 'config1',
    encrypt: true
  };
  const ctx = {
    config(key){
      switch(key) {
        case 'session': 
          return sessionConfig;
        case 'cookie': 
          return cookieConfig;
      }
    }
  }
  const options = {
    type: 'cookie'
  };
  
  const Session = getSession();
  const session = new Session(ctx, options);
  
  const instance = session.getSessionInstance();
});

// 3
test.serial('`3. getSessionInstance` when ctx.cookie(name) is undefined', t => {
  function mockHelper() {
    var helper = require('think-helper');
    helper.uuid =  ()=>{
      return 'cookie666'
    };
    helper.ms = (ss) => {
      return ss;
    }
  }
  let cookieData = {};
  function cookie(key, value, options) {
    if(key && value === undefined) return cookieData[key];
    if(key === null) {
      cookieData = {};
      return;
    }
    if(key && value) {
      return cookieData[key] = value;
    }
  }
  function mockHandler(onlyCookie) {
    //eg. think-session-cookie
    class cookieSession {
      constructor(options, ctx) {
        t.deepEqual(options, {
          prop1: 'prop1',
          handle,
          fresh: true,
          cookie: 'cookie666',
          maxAge: 'maxAge',
          type: "cookie",
        });
      }
    }
    cookieSession.onlyCookie = onlyCookie;
    return cookieSession;
  } 
  const handle = mockHandler(false);
  let sessionConfig = {
    type: 'cookie',
    cookie: {
      maxAge: 'maxAge',
      prop1: 'prop1',
      handle
    },
    file: {
      prop2: 'prop2',
      handle: 'file'
    }
  };
  let cookieConfig = {
    encrypt: true,
    name: 'cookieName',
    autoUpdate: true
  };
  const ctx = {
    config(key){
      switch(key) {
        case 'session': 
          return sessionConfig;
        case 'cookie': 
          return cookieConfig;
      }
    },
    cookie
  }
  const options = {
    type: 'cookie'
  };
  
  mockHelper();
  const Session = getSession();
  const session = new Session(ctx, options);
  
  const instance = session.getSessionInstance();
  t.deepEqual(cookieData, {
    'cookieName': 'cookie666'
  });
});

// 4
test.serial('4. `getSessionInstance` when `cookieOption.autoUpdate && cookieOptions.maxAge` is true', t => {
  function mockHelper() {
    var helper = require('think-helper');
    
    helper.ms = (ss) => {
      return ss;
    }
  }
  let cookieData = {
    'cookieName': 'cookie233'
  };
  function cookie(key, value, options) {
    if(key && value === undefined) return cookieData[key];
   
    if(key && value) {
      return cookieData[key] = value;
    }
  }
  function mockHandler(onlyCookie) {
    //eg. think-session-cookie
    class cookieSession {
      constructor(options, ctx) {
        t.deepEqual(options, {
          prop1: 'prop1',
          handle,
          fresh: false,
          cookie: 'cookie233',
          maxAge: 'maxAge',
          type: "cookie",
        });
      }
    }
    cookieSession.onlyCookie = onlyCookie;
    return cookieSession;
  } 
  const handle = mockHandler(false);
  let sessionConfig = {
    type: 'cookie',
    cookie: {
      maxAge: 'maxAge',
      prop1: 'prop1',
      handle
    },
    file: {
      prop2: 'prop2',
      handle: 'file'
    }
  };
  let cookieConfig = {
    encrypt: true,
    name: 'cookieName',
    autoUpdate: true,
    maxAge: '1'
  };
  const ctx = {
    config(key){
      switch(key) {
        case 'session': 
          return sessionConfig;
        case 'cookie': 
          return cookieConfig;
      }
    },
    cookie
  }
  const options = {
    type: 'cookie'
  };
  
  mockHelper();
  const Session = getSession();
  const session = new Session(ctx, options);
  
  const instance = session.getSessionInstance();
  t.deepEqual(cookieData, {
    'cookieName': 'cookie233'
  });

  
});

test.serial('5. `getSessionInstance` when `cookieOption.autoUpdate && cookieOptions.maxAge` is false', t => {
  function mockHelper() {
    var helper = require('think-helper');
    
    helper.ms = (ss) => {
      return ss;
    }
  }
  let cookieData = {
    'cookieName': 'cookie233'
  };
  function cookie(key, value, options) {
    if(key && value === undefined) return cookieData[key];
   
    if(key && value) {
      return cookieData[key] = value;
    }
  }
  function mockHandler(onlyCookie) {
    //eg. think-session-cookie
    class cookieSession {
      constructor(options, ctx) {
        t.deepEqual(options, {
          prop1: 'prop1',
          handle,
          fresh: false,
          cookie: 'cookie233',
          maxAge: 'maxAge',
          type: "cookie",
        });
      }
    }
    cookieSession.onlyCookie = onlyCookie;
    return cookieSession;
  } 
  const handle = mockHandler(false);
  let sessionConfig = {
    type: 'cookie',
    cookie: {
      maxAge: 'maxAge',
      prop1: 'prop1',
      handle
    },
    file: {
      prop2: 'prop2',
      handle: 'file'
    }
  };
  let cookieConfig = {
    encrypt: true,
    name: 'cookieName',
    autoUpdate: true,
    maxAge: ''
  };
  const ctx = {
    config(key){
      switch(key) {
        case 'session': 
          return sessionConfig;
        case 'cookie': 
          return cookieConfig;
      }
    },
    cookie
  }
  const options = {
    type: 'cookie'
  };
  
  mockHelper();
  const Session = getSession();
  const session = new Session(ctx, options);
  
  const instance = session.getSessionInstance();
  t.deepEqual(cookieData, {
    'cookieName': 'cookie233'
  });

  
});

test('6. run', t => {
  let cookieData = {};
  function cookie(key, value, options) {
    if(key && value === undefined) return cookieData[key];
    if(key && value) {
      return cookieData[key] = value;
    }
  }
  function mockHandler(onlyCookie) {
    //eg. think-session-cookie
    class cookieSession {
      constructor(options, ctx) {}
      delete() {
        return 'delete'
      }
      set(name, value) {
        return 'set'
      }
      get(name) {
        return 'get'
      }
    }
    cookieSession.onlyCookie = onlyCookie;
    return cookieSession;
  } 
  const handle = mockHandler(false);
  let sessionConfig = {
    type: 'cookie',
    cookie: {
      handle
    }
  };
  let cookieConfig = {
    encrypt: true,
    name: 'cookieName',
    autoUpdate: true
  };
  const ctx = {
    config(key){
      switch(key) {
        case 'session': 
          return sessionConfig;
        case 'cookie': 
          return cookieConfig;
      }
    },
    cookie
  }
  const Session = getSession();
  const session = new Session(ctx, {});
  
  session.run(null).then((error, res) => {
    t.is(res, 'delete');
  });
  session.run('user', 'xxx').then((error, res) => {
    t.is(res, 'set');
  });
  session.run('user', undefined).then((error, res) => {
    t.is(res, 'get');
  });

  var assertParams = [];
  mockAssert(assertParams);
  t.throws(() => {
    session.run(1, 'xxx').then((error, res) => {
      t.is(assertParams, 'session.name must be a string');
    });
  }, Error); 
});