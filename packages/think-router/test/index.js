/*
* @Author: lushijie
* @Date:   2017-04-20 09:22:22
* @Last Modified by:   lushijie
* @Last Modified time: 2017-05-09 10:03:47
*/
import test from 'ava';
import mockery from 'mockery';
import helper from 'think-helper';

let RESULT = {};
const next = () => Promise.resolve();
let params = ['module', 'controller', 'action'];
mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
});
mockery.registerMock('debug', function() {
  return function(out) {
    let output = out && out.split(':');
    output = output[1] && output[1].split(',');
    output && output.forEach(function(e, i) {
      if(e) {
        e = e.trim().split('=');
        if(params.indexOf(e[0]) > -1) {
          RESULT[e[0]] = e[1];
        }
      }
    })
  }
});

// must be after mockery
const parseRouter = require('../index');

let defaultOptions = {
  defaultModule: 'home', //default module name, is enable in multi module mode
  defaultController: 'index', //default controller name
  defaultAction: 'index', //default action name
  prefix: [], // url prefix
  suffix: ['.html'], // url suffix
  enableDefaultRouter: true,
  subdomainOffset: 2,
  subdomain: {}, //subdomain
  denyModules: [] //deny module, enable in multi module mode
};
let defaultCtx = {
  path: '/admin/article/list',
  module: '',
  controller: '',
  action: '',
  method: 'get',
  redirect: function(path) {
    return Promise.resolve();
  },
  param: function(query) {
    // set query to RESULT for test
    if(Object.keys(query).length > 0) {
      RESULT.query = query;
    }
  },
  subdomains: function() {
    // default subdomains is empty
    return [];
  },
  status: 200
};
let defaultApp = {
  modules: ['admin', 'home'],
  controllers: {
    admin: {
      'article': {},
    }
  },
  routers: {
    admin: {
      match: /^\/admin/,
      rules: [
        {
          match: /^\/admin\/article\/list/,
          path: 'admin/article/list',
          method: 'get',
          query: []
        }
      ]
    }
  }
};
let defaultOutput = {
  module: 'admin',
  controller: 'article',
  action: 'list'
};

test.serial.afterEach(t => {
  RESULT = {};
});


/**
 * getPathname.js
 */
test.serial.cb('options with suffix is empty', t => {
  let options = helper.extend({}, defaultOptions, {
    suffix: []
  });
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp);

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('options with suffix is string', t => {
  let options = helper.extend({}, defaultOptions, {
    suffix: ['.html']
  });
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list.html'
  });
  let app = helper.extend({}, defaultApp);

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('options with suffix is regexp', t => {
  let options = helper.extend({}, defaultOptions, {
    suffix: [/\.html/]
  });
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list.html'
  });
  let app = helper.extend({}, defaultApp, {});

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('options with prefix is string', t => {
  let options = helper.extend({}, defaultOptions, {
    prefix: ['/thinkjs']
  });
  let ctx = helper.extend({}, defaultCtx, {
    path: '/thinkjs/admin/article/list'
  });
  let app = helper.extend({}, defaultApp);

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('options with prefix is regexp', t => {
  let options = helper.extend({}, defaultOptions, {
    prefix: [/\/thinkjs/]
  });
  let ctx = helper.extend({}, defaultCtx, {
    path: '/thinkjs/admin/article/list'
  });
  let app = helper.extend({}, defaultApp);

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('options with prefix is regexp and not match', t => {
  let options = helper.extend({}, defaultOptions, {
    prefix: [/\/thinkjs/]
  });
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list'
  });
  let app = helper.extend({}, defaultApp);

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('options without subdomainOffset', t => {
  let options = helper.extend({}, defaultOptions, {
    subdomainOffset: 0
  });
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp);

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('options with subdomain is an Object', t => {
  let options = {
    subdomain: {
      'm1,m2': 'thinkjs'
    }
  };
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list',
    subdomains: function() {
      // multiple layer subdomains
      return ['m1', 'm2'];
    }
  });
  let app = helper.extend({}, defaultApp, {
    modules: ['thinkjs', 'admin'],
    routers: {
      admin: {
        match: /^\/thinkjs/,
        rules: [{
          match: /^\/thinkjs\/admin\/article/,
          path: 'thinkjs/admin/article',
          method: 'get',
          query: []
        }]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT,{
      module: 'thinkjs',
      controller: 'admin',
      action: 'article'
    });
    t.end();
  });
});

test.serial.cb('options with subdomain is an Array', t => {
  let options = {
    subdomain: ['thinkjs'], // domain name equal module name
    prefix: ['/']
  };
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list',
    subdomains: function() {
      return ['thinkjs'];
    }
  });
  let app = helper.extend({}, defaultApp, {
    modules: ['thinkjs', 'admin'],
    routers: {
      admin: {
        match: /^thinkjs/,
        rules: [{
          match: /^thinkjs\/admin\/article/,
          path: 'thinkjs/admin/article',
          method: 'get',
          query: []
        }]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'thinkjs',
      controller: 'admin',
      action: 'article'
    });
    t.end();
  });
});

test.serial.cb('options with subdomain not match ', t => {
  let options = {
    subdomain: {
      'm2,m3': 'thinkjs'
    }
  };
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list',
    subdomains: function() {
      return ['m1', 'm2'];
    }
  });
  let app = helper.extend({}, defaultApp, {
    modules: ['admin', 'home'],
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [{
          match: /^\/admin\/article\/list/,
          path: 'admin/article/list/',
          method: 'get',
          query: []
        }]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

/**
 * getRules.js
 */
test.serial.cb('router\'s match is null & enableDefaultRouter is true', t => {
  let options = helper.extend({}, defaultOptions, {
    enableDefaultRouter: true
  });
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: null
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('router\'s match is null & enableDefaultRouter is false', t => {
  let options = helper.extend({}, defaultOptions, {
    enableDefaultRouter: false
  });
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: null
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {});
    t.end();
  });
});

test.serial.cb('router with match test failed', t => {

  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /^\/notmatch/
      }
    }
  })
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('rules is null', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /^\/admin/,
        rules: null
      }
    }
  })
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('rules is an Array and not match', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: [{
      match: /^\/admin\/article\/get\//,
      path: 'admin/article/get/',
      method: 'get',
      query: []
    }]
  })

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('rules method not equal ctx method', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, { method: 'post' });
  let app = helper.extend({}, defaultApp);

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('rules method equal rest', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [{
          match: /^\/admin\/article\/list/,
          path: 'admin/article/list/',
          method: 'rest',
          query: []
        }]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('rules match with query name is number', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/123',
  });
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [{
          match: /^\/admin\/article\/list\/(\d+)/,
          path: 'admin/article/list/:1',
          method: 'rest',
          query: [{ name: 0 }]
        }]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});

test.serial.cb('rules match with query name is string', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/test',
  });
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [{
          match: /^\/admin\/article\/list\/(.*)/,
          path: 'admin/article/list',
          method: 'rest',
          query: [{ name: 'title' }]
        }]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, helper.extend({}, defaultOutput, {
      query: {
        title: 'test'
      }
    }));
    t.end();
  });
});

test.serial.cb('rules method equal redirect', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [{
          match: /^\/admin\/article\/list/,
          path: 'admin/article/list/',
          method: 'redirect',
          query: [],
          statusCode: 302
        }]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {});
    t.end();
  });
});

test.serial.cb('rules method equal redirect and without statusCode', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [{
          match: /^\/admin\/article\/list/,
          path: 'admin/article/list/',
          method: 'redirect',
          query: []
        }]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {});
    t.end();
  });
});

test.serial.cb('rules path with query', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [{
          match: /^\/admin\/article\/list/,
          path: 'admin/article/list?page=1',
          method: 'get',
          query: []
        }]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, helper.extend({}, defaultOutput, {
      query: {
        page: '1'
      }
    }));
    t.end();
  });
});

test.serial.cb('rules path with query empty', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [{
          match: /^\/admin\/article\/list/,
          path: 'admin/article/list?page',
          method: 'get',
          query: []
        }]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, defaultOutput);
    t.end();
  });
});


test.serial.cb('controller with / and match', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/paper'
  });

  let app = {
    modules: ['admin', 'home'],
    controllers: {
      admin: {
        'article/page': {},
      }
    },
    routers: [{
      match: /^\/admin\/article\/list(\.*)/,
      path: 'admin/article/page',
      method: 'get',
      query: [{ name: 0 }]
    }]
  };
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'article/page',
      action: 'index'
    });
    t.end();
  });
});

test.serial.cb('controller with / and not match', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/paper'
  });

  let app = {
    modules: ['admin', 'home'],
    controllers: {
      admin: {
        'article/page': {},
      }
    },
    routers: [{
      match: /^\/admin\/article\/notmatch/,
      path: 'admin/article/notmatch',
      method: 'get',
      query: []
    }]
  };

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('ctx path is not beigin with /', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: 'admin'
  });
  let app = helper.extend({}, defaultApp);

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'index',
      action: 'index'
    });
    t.end();
  });
});

test.serial.cb('the modules not in app.modules', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: ['home']
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'home',
      controller: 'admin',
      action: 'article'
    });
    t.end();
  });
});

test.serial.cb('app modules not match', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: []
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'home',
      controller: 'admin',
      action: 'article'
    });
    t.end();
  });
});



