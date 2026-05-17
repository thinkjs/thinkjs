import test from 'ava';
import mock from 'mock-require';

function mockAssert(assertParams = []) {
  mock('assert', (condition, errmsg) => {
    if (!condition) {
      assertParams.push(condition, errmsg);
      throw new Error('this is an assert failed signal');
    }
  });
}
function getSession() {
  return mock.reRequire('../lib/session');
}

test.serial('instantiate Session', t => {
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
  const cookieConfig = {
    encrypt: true,
    name: 'cookieName',
    autoUpdate: true
  };
  const ctx = {
    config(key) {
      switch (key) {
        case 'session':
          return sessionConfig;
        case 'cookie':
          return cookieConfig;
      }
    }
  };
  const options = {
    type: 'file'
  };
  var assertParams = [];
  mockAssert(assertParams);
  const Session = getSession();
  let session;
  t.throws(() => {
    new Session(ctx, options);
  }, Error);
  t.deepEqual(assertParams, [
    false, 'session.handle must be a function'
  ]);
});

test.serial('`getSessionInstance` when handle.onlyCookie is true', t => {
  function mockHandler(onlyCookie) {
    // eg. think-session-cookie
    class cookieSession {
      constructor(options, ctx) {
        t.deepEqual(options, {
          name: 'thinkjs',
          autoUpdateRate: 0.5,
          path: '/',
          maxAge: 86400000,
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
  const cookieConfig = {
    config1: 'config1',
    encrypt: true
  };
  const ctx = {
    config(key) {
      switch (key) {
        case 'session':
          return sessionConfig;
        case 'cookie':
          return cookieConfig;
      }
    }
  };
  const options = {
    type: 'cookie'
  };

  const Session = getSession();
  const session = new Session(ctx, options);

  const instance = session.getSessionInstance();
});

test.serial('`getSessionInstance` when ctx.cookie(name) is undefined', t => {
  function mockHelper() {
    var helper = require('think-helper');
    helper.uuid = () => {
      return 'cookie666';
    };
    helper.ms = (ss) => {
      return ss;
    };
  }
  let cookieData = {};
  function cookie(key, value, options) {
    if (key && value === undefined) return cookieData[key];
    if (key === null) {
      cookieData = {};
      return;
    }
    if (key && value) {
      cookieData[key] = value;
      return value;
    }
  }
  function mockHandler(onlyCookie) {
    // eg. think-session-cookie
    class cookieSession {
      constructor(options, ctx) {
        t.deepEqual(options, {
          prop1: 'prop1',
          handle,
          fresh: true,
          cookie: 'cookie666',
          maxAge: 'maxAge',
          type: 'cookie'
        });
      }
    }
    cookieSession.onlyCookie = onlyCookie;
    return cookieSession;
  }
  const handle = mockHandler(false);
  const sessionConfig = {
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
  const cookieConfig = {
    encrypt: true,
    name: 'cookieName',
    autoUpdateRate: 0.5
  };
  const ctx = {
    config(key) {
      switch (key) {
        case 'session':
          return sessionConfig;
        case 'cookie':
          return cookieConfig;
      }
    },
    cookie
  };
  const options = {
    type: 'cookie'
  };

  mockHelper();
  const Session = getSession();
  const session = new Session(ctx, options);

  session.getSessionInstance();
  t.deepEqual(cookieData, {
    'cookieName': 'cookie666'
  });
});

test.serial('`getSessionInstance` when ctx.cookie(name) and have maxAge setting', t => {
  let cookieData = {
    cookieName: '1111'
  };
  function cookie(key, value, options) {
    t.is(options.maxAge, 7 * 3600 * 24000);
    if (key && value === undefined) return cookieData[key];
    if (key === null) {
      cookieData = {};
      return;
    }
    if (key && value) {
      cookieData[key] = value;
      return value;
    }
  }

  const sessionConfig = {
    type: 'file',
    cookie: {
      maxAge: 'maxAge',
      prop1: 'prop1',
      handle: class cookieSession {
      }
    },
    file: {
      prop2: 'prop2',
      handle: class fileSession {
      }
    }
  };
  const cookieConfig = {
    encrypt: true,
    name: 'cookieName',
    autoUpdateRate: 0.5
  };
  const ctx = {
    config(key) {
      switch (key) {
        case 'session':
          return sessionConfig;
        case 'cookie':
          return cookieConfig;
      }
    },
    cookie
  };
  const options = {
    type: 'cookie',
    cookie: {
      maxAge: 7 * 3600 * 24000
    }
  };

  const Session = getSession();
  const session = new Session(ctx, options);

  session.getSessionInstance();
});

test.serial('`getSessionInstance` when instance is exist and have maxAge setting', t => {
  t.plan(6);

  const helper = require('think-helper');
  helper.uuid = function () {
    return 1234;
  };

  let cookieData = {
    cookieName: '1111'
  };
  let i = 0;
  function cookie(key, value, options) {
    i += 1;
    switch (i) {
      case 1:
        t.is(value, undefined);
        break;
      case 2:
        t.is(value, 1234);
        break;
      case 3:
        t.is(options.maxAge, 7 * 3600 * 24000);
        break;
    }

    if (key && value === undefined) return cookieData[key];
    if (key === null) {
      cookieData = {};
      return;
    }
    if (key && value) {
      cookieData[key] = value;
      return value;
    }
  }

  const sessionConfig = {
    type: 'file',
    file: {
      handle: class fileSession { }
    }
  };
  const ctx = {
    config(key) {
      switch (key) {
        case 'session':
          return sessionConfig;
      }
    },
    cookie
  };
  const options = {
    type: 'file',
    file: {
      maxAge: 7 * 3600 * 24000
    }
  };

  const Session = getSession();
  const session = new Session(ctx);
  const session2 = new Session(ctx, options);
  session.getSessionInstance();
  const instance = session2.getSessionInstance();
  t.deepEqual(instance.options, session2.options);
  t.deepEqual(instance.cookieOptions, session2.cookieOptions);
  t.deepEqual(instance.maxAge, session2.options.maxAge);
});

test.serial('`getSessionInstance` when `cookieOption.autoUpdate && cookieOptions.maxAge` is true', t => {
  function mockHelper() {
    var helper = require('think-helper');

    helper.ms = (ss) => {
      return ss;
    };
  }
  const cookieData = {
    'cookieName': 'cookie233'
  };
  function cookie(key, value, options) {
    if (key && value === undefined) return cookieData[key];

    if (key && value) {
      cookieData[key] = value;
      return value;
    }
  }
  function mockHandler(onlyCookie) {
    // eg. think-session-cookie
    class cookieSession {
      constructor(options, ctx) {
        t.deepEqual(options, {
          prop1: 'prop1',
          handle,
          fresh: false,
          cookie: 'cookie233',
          maxAge: 'maxAge',
          type: 'cookie'
        });
      }
    }
    cookieSession.onlyCookie = onlyCookie;
    return cookieSession;
  }
  const handle = mockHandler(false);
  const sessionConfig = {
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
  const cookieConfig = {
    encrypt: true,
    name: 'cookieName',
    autoUpdate: true,
    maxAge: '1'
  };
  const ctx = {
    config(key) {
      switch (key) {
        case 'session':
          return sessionConfig;
        case 'cookie':
          return cookieConfig;
      }
    },
    cookie
  };
  const options = {
    type: 'cookie'
  };

  mockHelper();
  const Session = getSession();
  const session = new Session(ctx, options);

  session.getSessionInstance();
  t.deepEqual(cookieData, {
    'cookieName': 'cookie233'
  });
});

test.serial('`getSessionInstance` when `cookieOption.autoUpdate && cookieOptions.maxAge` is false', t => {
  function mockHelper() {
    var helper = require('think-helper');

    helper.ms = (ss) => {
      return ss;
    };
  }
  const cookieData = {
    'cookieName': 'cookie233'
  };
  function cookie(key, value, options) {
    if (key && value === undefined) return cookieData[key];

    if (key && value) {
      cookieData[key] = value;
      return value;
    }
  }
  function mockHandler(onlyCookie) {
    // eg. think-session-cookie
    class cookieSession {
      constructor(options, ctx) {
        t.deepEqual(options, {
          prop1: 'prop1',
          handle,
          fresh: false,
          cookie: 'cookie233',
          maxAge: 'maxAge',
          type: 'cookie'
        });
      }
    }
    cookieSession.onlyCookie = onlyCookie;
    return cookieSession;
  }
  const handle = mockHandler(false);
  const sessionConfig = {
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
  const cookieConfig = {
    encrypt: true,
    name: 'cookieName',
    autoUpdate: true,
    maxAge: ''
  };
  const ctx = {
    config(key) {
      switch (key) {
        case 'session':
          return sessionConfig;
        case 'cookie':
          return cookieConfig;
      }
    },
    cookie
  };
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

test('run', t => {
  const cookieData = {};
  function cookie(key, value, options) {
    if (key && value === undefined) return cookieData[key];
    if (key && value) {
      return cookieData[key] = value;
    }
  }
  function mockHandler(onlyCookie) {
    // eg. think-session-cookie
    class cookieSession {
      constructor(options, ctx) { }
      delete() {
        return 'delete';
      }
      set(name, value) {
        return 'set';
      }
      get(name) {
        return 'get';
      }
    }
    cookieSession.onlyCookie = onlyCookie;
    return cookieSession;
  }
  const handle = mockHandler(false);
  const sessionConfig = {
    type: 'cookie',
    cookie: {
      handle
    }
  };
  const cookieConfig = {
    encrypt: true,
    name: 'cookieName',
    autoUpdate: true
  };
  const ctx = {
    config(key) {
      switch (key) {
        case 'session':
          return sessionConfig;
        case 'cookie':
          return cookieConfig;
      }
    },
    cookie
  };
  const Session = getSession();
  const session = new Session(ctx, {});

  session.run(null).then((_, res) => {
    t.is(res, 'delete');
  });
  session.run('user', 'xxx').then((_, res) => {
    t.is(res, 'set');
  });
  session.run('user', undefined).then((_, res) => {
    t.is(res, 'get');
  });

  var assertParams = [];
  mockAssert(assertParams);
  t.throws(() => {
    session.run(1, 'xxx').then((_, res) => {
      t.is(assertParams, 'session.name must be a string');
    });
  }, Error);
});
