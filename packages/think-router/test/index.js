/*
* @Author: lushijie
* @Date:   2017-04-20 09:22:22
* @Last Modified by:   lushijie
* @Last Modified time: 2017-09-14 14:27:49
*/
import test from 'ava';
import mockery from 'mockery';
import helper from 'think-helper';
const next = () => Promise.resolve();

let RESULT = {};
mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
});
mockery.registerMock('debug', function() {
  let params = ['module', 'controller', 'action'];
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

let defaultApp = {
  once: function(event, cb){
    cb();
  },
  on: function(event, cb) {
    //cb();
  }
};

let defaultCtx = {
  path: '/admin/article/list',
  module: '', // think-router set
  controller: '', // think-router set
  action: '', // think-router set
  method: 'get',
  redirect: function(path) {
    return Promise.resolve();
  },
  param: function(query) {
    // set query to RESULT just for test
    if(Object.keys(query).length > 0) {
      RESULT.query = query;
    }
  },
  get subdomains() {
    return []; // default subdomains is empty
  },
  status: 200
};


test.serial.beforeEach(t => {
  RESULT = {};
});

test.serial.cb('default options', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'get']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'article'
    });
    t.end();
  });
});

test.serial.cb('default options 2', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      {
        match: /^\/admin\/article\/list/,
        rules: ['^\/admin\/article\/list', 'admin/article/list', 'get']
      }
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'article'
    });
    t.end();
  });
});

test.serial.cb('default options 3', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      {
        match: /^\/admin\/article\/list123/,
        rules: ['^\/admin\/article\/list', 'admin/article/list', 'get']
      }
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'article'
    });
    t.end();
  });
});


test.serial.cb('options with suffix is empty', t => {
  let options = helper.extend({}, defaultOptions, {
    suffix: []
  });
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'get']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'article'
    });
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
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'get']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'article'
    });
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
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'get']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'article'
    });
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
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'get']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT,  {
      module: '',
      controller: 'admin',
      action: 'article'
    });
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
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'get']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT,  {
      module: '',
      controller: 'admin',
      action: 'article'
    });
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
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'get']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'article'
    });
    t.end();
  });
});

test.serial.cb('options without subdomainOffset', t => {
  let options = helper.extend({}, defaultOptions, {
    subdomainOffset: 0
  });
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'get']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'article'
    });
    t.end();
  });
});

test.serial.cb('options with subdomain is an Object', t => {
  let options = {
    subdomain: {
      'm1,m2': 'admin'
    }
  };
  let ctx = helper.extend({}, defaultCtx, {
    path: '/article/list',
    get subdomains() {
      return ['m1', 'm2']; // multiple layer subdomains
    }
  });
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'get']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'article'
    });
    t.end();
  });
});

test.serial.cb('options with subdomain is an Array', t => {
  let options = {
    subdomain: ['admin'], // domain name equal module name
    prefix: ['/']
  };
  let ctx = helper.extend({}, defaultCtx, {
    path: '/article/list',
    get subdomains() {
      return ['admin'];
    }
  });
  let app = helper.extend({}, defaultApp,{
    modules: [],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'get']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
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
    get subdomains() {
      return ['m1', 'm2'];
    }
  });
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'get']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT,  {
      module: '',
      controller: 'admin',
      action: 'article'
    });
    t.end();
  });
});

test.serial.cb('router\'s match is null & enableDefaultRouter is false', t => {
  let options = helper.extend({}, defaultOptions, {
    enableDefaultRouter: false
  });
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: []
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {});
    t.end();
  });
});

test.serial.cb('method not equal ctxMethod', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    method: 'CLI'
  });
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'GET']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'article'
    });
    t.end();
  });
});

test.serial.cb('rules with specialMethods', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'REDIRECT']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'article'
    });
    t.end();
  });
});

test.serial.cb('multiple modules', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {},
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list/,
          'admin/article/list?page=1',
          'GET', // method
          {}, //options
          [], //query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'article',
      action: 'list',
      query: {
        page: '1'
      }
    });
    t.end();
  });
});

test.serial.cb('multiple modules, but rules is an Array', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {},
    routers: [
      ['^\/admin\/article\/list', 'admin/article/list', 'get']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('multiple modules, not match', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {},
    routers: {
      admin: {
        match: /^\/usr/,
        rules: [[
          /^\/admin\/article\/list/,
          'admin/article/list?page=1',
          'GET', // method
          {}, //options
          [], //query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('multiple modules, match and rules = null', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {},
    routers: {
      admin: {
        match: /^\/admin/,
        rules: null
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('multiple modules, without match', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {},
    routers: {
      admin: {
        match: null,
        rules: [[
          /^\/admin\/article\/list/,
          'admin/article/list',
          'GET', // method
          {}, //options
          [], //query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('REDIRECT with statusCode', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/'
  });
  let app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {},
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list\//,
          'admin/article/list/',
          'REDIRECT', // method
          {statusCode: 302}, //options
          [], //query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {});
    t.end();
  });
});

test.serial.cb('REDIRECT without statusCode', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/'
  });
  let app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {},
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list\//,
          'admin/article/list/',
          'REDIRECT', // method
          {}, //options
          [], //query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {});
    t.end();
  });
});

test.serial.cb('pathToRegexp with name is String', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/123456'
  });
  let app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {},
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          '/admin/article/list/:id/',
          'admin/article/list/:id',
          'GET', // method
          {}, //options
          [], //query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'article',
      action: 'list',
      query: {
        id: '123456'
      }
    });
    t.end();
  });
});

test.serial.cb('pathToRegexp with name is Number', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/123456/'
  });
  let app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {},
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list\/(\w+)\/(\w?)/,
          'admin/article/list/:1/:2',
          'GET', // method
          {}, //options
          [], //query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});




test.serial.cb('pathToRegexp with query empty', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/ '
  });
  let app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {},
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          '/admin/article/list/:id/',
          'admin/article/list/:id',
          'GET', // method
          {}, //options
          [], //query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('multiple modules, pathname without /', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {},
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list/,
          'admin',
          'GET', // method
          {}, //options
          [], //query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'index',
      action: 'index'
    });
    t.end();
  });
});

test.serial.cb('use defaultAction', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin'
  });
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {},
    routers: []
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'index'
    });
    t.end();
  });
});

test.serial.cb('use defaultModule', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    denyModules: []
  });
  let app = helper.extend({}, defaultApp, {
    modules: ['user'],
    controllers: {},
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list/,
          'admin',
          'GET', // method
          {}, //options
          [], //query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'home',
      controller: 'admin',
      action: 'index'
    });
    t.end();
  });
});

test.serial.cb('multiple controllers', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    denyModules: []
  });
  let app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {
      admin: {
        '/article/list': {}
      }
    },
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list/,
          'admin/article/list',
          'GET', // method
          {}, //options
          [], //query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('single controllers', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    denyModules: []
  });
  let app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {
      admin: {
        article: {}
      }
    },
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list/,
          'admin',
          'GET', // method
          {}, //options
          [], //query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'index',
      action: 'index'
    });
    t.end();
  });
});

test.serial.cb('single controllers2', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    denyModules: []
  });
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      'article/list': {}
    },
    routers: [[
      /^\/admin\/article\/list/,
      'article/list',
      'GET', // method
      {}, //options
      [], //query
    ]]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'article/list',
      action: 'index'
    });
    t.end();
  });
});

test.serial.cb('single controllers REST 1', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    denyModules: []
  });
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      'article/list': {}
    },
    routers: [[
      /^\/admin\/article\/list/,
      'article/list',
      'REST', // method
      {}, //options
      [], //query
    ]]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'article/list',
      action: 'get'
    });
    t.end();
  });
});

test.serial.cb('single controllers REST 2', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    denyModules: []
  });
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      'article': {}
    },
    routers: [[
      /^\/admin\/article\/list/,
      'admin/article/list',
      'REST', // method
      {}, //options
      [], //query
    ]]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'get'
    });
    t.end();
  });
});

test.serial.cb('single controllers REST 3', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    denyModules: [],
    path: 'restful/api',
  });
  let app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      'restful/api': {}
    },
    routers: [
      ['restful/api', 'rest']
    ]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'restful/api',
      action: 'get'
    });
    t.end();
  });
});

test.serial.cb('enableDefaultRouter', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: ''
  });
  let app = helper.extend({}, defaultApp, {
    modules: []
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'index',
      action: 'index'
    });
    t.end();
  });
});

test.serial.cb('enableDefaultRouter2', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: ''
  });
  let app = helper.extend({}, defaultApp, {
    modules: ['admin', 'home']
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'home',
      controller: 'index',
      action: 'index'
    });
    t.end();
  });
});

test.serial.cb('routerChange', t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: ''
  });
  let app = helper.extend({}, defaultApp, {
    modules: ['admin', 'home'],
    on: function(event, cb) {
      //cb();
      cb(['^\/admin\/article\/list', 'admin/article/list', 'get']);
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'home',
      controller: 'index',
      action: 'index'
    });
    t.end();
  });
});
