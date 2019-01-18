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
  const params = ['module', 'controller', 'action'];
  return function(out) {
    let output = out && out.split(':');
    output = output[1] && output[1].split(',');
    output && output.forEach(function(e, i) {
      if (e) {
        e = e.trim().split('=');
        if (params.indexOf(e[0]) > -1) {
          RESULT[e[0]] = e[1];
        }
      }
    });
  };
});

// must be after mockery
const parseRouter = require('../index');

const defaultOptions = {
  defaultModule: 'defaultModule', // default module name, is enable in multi module mode
  defaultController: 'defaultController', // default controller name
  defaultAction: 'defaultAction', // default action name
  prefix: [], // url prefix
  suffix: ['.html'], // url suffix
  enableDefaultRouter: true,
  subdomainOffset: 2,
  subdomain: {}, // subdomain
  denyModules: [] // deny module, enable in multi module mode
};

const defaultApp = {
  once: function(event, cb) {
    cb();
  },
  on: function(event, cb) {
    // cb();
  }
};

const defaultCtx = {
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
    if (Object.keys(query).length > 0) {
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin0: {

      },
      admin: {
        articleAction() {}
      },
      admin2: {

      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'get']
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      {
        match: /^\/admin\/article\/list/,
        rules: ['^/admin/article/list', 'admin/article/list', 'get']
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      {
        match: /^\/admin\/article\/list123/,
        rules: ['^/admin/article/list', 'admin/article/list', 'get']
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
  const options = helper.extend({}, defaultOptions, {
    suffix: []
  });
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'get']
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
  const options = helper.extend({}, defaultOptions, {
    suffix: ['.html']
  });
  const ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list.html'
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'get']
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
  const options = helper.extend({}, defaultOptions, {
    suffix: [/\.html/]
  });
  const ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list.html'
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'get']
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
  const options = helper.extend({}, defaultOptions, {
    prefix: ['/thinkjs']
  });
  const ctx = helper.extend({}, defaultCtx, {
    path: '/thinkjs/admin/article/list'
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'get']
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

test.serial.cb('options with prefix is regexp', t => {
  const options = helper.extend({}, defaultOptions, {
    prefix: [/\/thinkjs/]
  });
  const ctx = helper.extend({}, defaultCtx, {
    path: '/thinkjs/admin/article/list'
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'get']
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

test.serial.cb('options with prefix is regexp and not match', t => {
  const options = helper.extend({}, defaultOptions, {
    prefix: [/\/thinkjs/]
  });
  const ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list'
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'get']
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
  const options = helper.extend({}, defaultOptions, {
    subdomainOffset: 0
  });
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'get']
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
  const options = {
    subdomain: {
      'm1,m2': 'admin'
    }
  };
  const ctx = helper.extend({}, defaultCtx, {
    path: '/article/list',
    get subdomains() {
      return ['m1', 'm2']; // multiple layer subdomains
    }
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'get']
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
  const options = {
    subdomain: ['admin'], // domain name equal module name
    prefix: ['/']
  };
  const ctx = helper.extend({}, defaultCtx, {
    path: '/article/list',
    get subdomains() {
      return ['admin'];
    }
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'get']
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
  const options = {
    subdomain: {
      'm2,m3': 'thinkjs'
    }
  };
  const ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list',
    get subdomains() {
      return ['m1', 'm2'];
    }
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'get']
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

test.serial.cb('router\'s match is null & enableDefaultRouter is false', t => {
  const options = helper.extend({}, defaultOptions, {
    enableDefaultRouter: false
  });
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: []
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {});
    t.end();
  });
});

test.serial.cb('method not equal ctxMethod', t => {
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    method: 'CLI'
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'GET']
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {
        articleAction() {}
      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'REDIRECT']
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {
      admin: {
        article: {
          listAction() {}
        }
      }
    },
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list/,
          'admin/article/list?page=1',
          'GET', // method
          {}, // options
          [] // query
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

test.serial.cb('multiple modules', t => {
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {
      admin: {
        article: {
          listAction() {}
        }
      }
    },
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list/,
          'admin/article/list?q=&q=',
          'GET', // method
          {}, // options
          [] // query
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

test.serial.cb('multiple modules, but rules is an Array', t => {
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {
      admin: {
        article: {
          listAction() {}
        }
      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'get']
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {
      admin: {
        article: {
          listAction() {}
        }
      }
    },
    routers: {
      admin: {
        match: /^\/usr/,
        rules: [[
          /^\/admin\/article\/list/,
          'admin/article/list?page=1',
          'GET', // method
          {}, // options
          [] // query
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {
      admin: {
        article: {
          listAction() {}
        }
      }
    },
    routers: {
      admin: {
        match: null,
        rules: [[
          /^\/admin\/article\/list/,
          'admin/article/list',
          'GET', // method
          {}, // options
          [] // query
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/'
  });
  const app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {
      admin: {
        article: {
          listAction() {}
        }
      }
    },
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list\//,
          'admin/article/list/',
          'REDIRECT', // method
          { statusCode: 302 }, // options
          [] // query
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/'
  });
  const app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {},
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list\//,
          'admin/article/list/',
          'REDIRECT', // method
          {}, // options
          [] // query
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/123456'
  });
  const app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {
      admin: {
        article: {
          listAction() {}
        }
      }
    },
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          '/admin/article/list/:id/',
          'admin/article/list/:id',
          'GET', // method
          {}, // options
          [] // query
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/123456/'
  });
  const app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {
      admin: {
        article: {
          listAction() {}
        }
      }
    },
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list\/(\w+)\/(\w?)/,
          'admin/article/list/:1/:2',
          'GET', // method
          {}, // options
          {} // query
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/ '
  });
  const app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {
      admin: {
        article: {
          listAction() {}
        }
      }
    },
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          '/admin/article/list/:id/',
          'admin/article/list/:id',
          'GET', // method
          {}, // options
          [] // query
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {
      admin: {
        article: {
          listAction() {}
        }
      }
    },
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list/,
          'admin',
          'GET', // method
          {}, // options
          [] // query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'defaultController',
      action: 'defaultAction'
    });
    t.end();
  });
});

test.serial.cb('use defaultAction', t => {
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    path: '/admin'
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      admin: {

      }
    },
    routers: []
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin',
      action: 'defaultAction'
    });
    t.end();
  });
});

test.serial.cb('use defaultModule', t => {
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    denyModules: []
  });
  const app = helper.extend({}, defaultApp, {
    modules: ['user'],
    controllers: {
      defaultModule: {
        admin: {}
      }
    },
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list/,
          'admin',
          'GET', // method
          {}, // options
          [] // query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'defaultModule',
      controller: 'admin',
      action: 'defaultAction'
    });
    t.end();
  });
});

test.serial.cb('multiple controllers', t => {
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    denyModules: []
  });
  const app = helper.extend({}, defaultApp, {
    modules: ['admin'],
    controllers: {
      admin: {
        'article/list': {}
      }
    },
    routers: {
      admin: {
        match: /^\/admin/,
        rules: [[
          /^\/admin\/article\/list/,
          'admin/article/list',
          'GET', // method
          {}, // options
          [] // query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'article/list',
      action: 'defaultAction'
    });
    t.end();
  });
});

test.serial.cb('single controllers', t => {
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    denyModules: []
  });
  const app = helper.extend({}, defaultApp, {
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
          {}, // options
          [] // query
        ]]
      }
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'admin',
      controller: 'defaultController',
      action: 'defaultAction'
    });
    t.end();
  });
});

test.serial.cb('single controllers2', t => {
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    denyModules: []
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      'article/list': {}
    },
    routers: [[
      /^\/admin\/article\/list/,
      'article/list',
      'GET', // method
      {}, // options
      [] // query
    ]]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'article/list',
      action: 'defaultAction'
    });
    t.end();
  });
});

test.serial.cb('single controllers REST 1', t => {
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    denyModules: []
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      'article/list': {
        getAction() {}
      }
    },
    routers: [[
      /^\/admin\/article\/list/,
      'article/list',
      'REST', // method
      {}, // options
      [] // query
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    denyModules: []
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      'admin/article': {
        getAction() {}
      }
    },
    routers: [[
      /^\/admin\/article\/list/,
      'admin/article/list',
      'REST', // method
      {}, // options
      [] // query
    ]]
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'admin/article',
      action: 'get'
    });
    t.end();
  });
});

test.serial.cb('single controllers REST 3', t => {
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    denyModules: [],
    path: 'restful/api'
  });
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      'restful/api': {
        getAction() {}
      }
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
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    path: ''
  });
  const app = helper.extend({}, defaultApp, {
    modules: []
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: '',
      controller: 'defaultController',
      action: 'defaultAction'
    });
    t.end();
  });
});

test.serial.cb('enableDefaultRouter2', t => {
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    path: ''
  });
  const app = helper.extend({}, defaultApp, {
    modules: ['admin', 'home']
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'defaultModule',
      controller: 'defaultController',
      action: 'defaultAction'
    });
    t.end();
  });
});

test.serial.cb('routerChange', t => {
  const options = helper.extend({}, defaultOptions);
  const ctx = helper.extend({}, defaultCtx, {
    path: ''
  });
  const app = helper.extend({}, defaultApp, {
    modules: ['admin', 'home'],
    on: function(event, cb) {
      // eslint-disable-next-line
      cb(['^/admin/article/list', 'admin/article/list', 'get']);
    }
  });

  ctx.app = app;
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESULT, {
      module: 'defaultModule',
      controller: 'defaultController',
      action: 'defaultAction'
    });
    t.end();
  });
});

test.serial.cb('emptycontroller', t => {
  const options = helper.extend({}, defaultOptions, {
    defaultController: ''
  });
  const ctx = helper.extend({}, defaultCtx);
  const app = helper.extend({}, defaultApp, {
    modules: [],
    controllers: {
      'admin/article/list2/': {
        // articleAction() {}
      },
      admin: {

      },
      admin2: {

      }
    },
    routers: [
      ['^/admin/article/list', 'admin/article/list', 'get']
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
