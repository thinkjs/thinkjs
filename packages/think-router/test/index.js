/*
* @Author: lushijie
* @Date:   2017-04-20 09:22:22
* @Last Modified by:   lushijie
* @Last Modified time: 2017-04-23 11:45:26
*/

const test = require('ava');
const mockery = require('mockery');
const helper = require('think-helper');

let RESP = {};
const next = () => Promise.resolve();
let params = ['module', 'controller', 'action'];

mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
});
mockery.registerMock('debug', function() {
  return function(out) {
    RESP = {};
    let output = out && out.split(':');
    output = output[1] && output[1].split(',');
    output && output.forEach(function(e, i) {
      if(e) {
        e = e.trim().split('=');
        if(params.indexOf(e[0]) > -1) {
          RESP[e[0]] = e[1];
        }
      }
    })
  }
});

const parseRouter = require('../');

let defaultOptions = {};

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
    this.query = query;
  },
  subdomains: function() {
    return [];
  },
  status: ''
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
      match: /\/admin\/.*/,
      rules: [
        {
          match: /admin\/article\/list/,
          path: 'admin/article/list',
          method: 'get',
          query: []
        }
      ]
    }
  }
};






















/**
 * getPathname.js
 */

  test.serial.cb('options with suffix is string',  t => {
   let options = helper.extend({}, defaultOptions, {suffix: ['.html']});
   let ctx = helper.extend({}, defaultCtx, {
     path: '/admin/article/list.html'
   });
   let app = helper.extend({}, defaultApp, {});

   parseRouter(options, app)(ctx, next).then(data => {
     t.deepEqual(RESP,{
       module: 'admin',
       controller: 'article',
       action: 'list'
     });
     t.end();
   });
  });


 test.serial.cb('options with suffix is string',  t => {
   let options = helper.extend({}, defaultOptions, {suffix: []});
   let ctx = helper.extend({}, defaultCtx, {
     path: '/admin/article/list.html'
   });
   let app = helper.extend({}, defaultApp, {});

   parseRouter(options, app)(ctx, next).then(data => {
     t.deepEqual(RESP,{
       module: 'admin',
       controller: 'article',
       action: 'list'
     });
     t.end();
   });
 });


 test.serial.cb('options with suffix is regexp',  t => {
   let options = helper.extend({}, defaultOptions, {suffix: [/\.html/]});
   let ctx = helper.extend({}, defaultCtx, {
     path: '/admin/article/list.html'
   });
   let app = helper.extend({}, defaultApp, {});

   parseRouter(options, app)(ctx, next).then(data => {
     t.deepEqual(RESP,{
       module: 'admin',
       controller: 'article',
       action: 'list'
     });
     t.end();
   });
 });

 test.serial.cb('options with prefix is string',  t => {
   let options = helper.extend({}, defaultOptions, {prefix: ['/thinkjs']});
   let ctx = helper.extend({}, defaultCtx, {
     path: '/thinkjs/admin/article/list.html'
   });
   let app = helper.extend({}, defaultApp, {});

   parseRouter(options, app)(ctx, next).then(data => {
     t.deepEqual(RESP,{
       module: 'admin',
       controller: 'article',
       action: 'list'
     });
     t.end();
   });
 });

 test.serial.cb('options with prefix is regexp',  t => {
   let options = helper.extend({}, defaultOptions, {prefix: [/\/thinkjs/]});
   let ctx = helper.extend({}, defaultCtx, {
     path: '/thinkjs/admin/article/list.html'
   });
   let app = helper.extend({}, defaultApp, {});

   parseRouter(options, app)(ctx, next).then(data => {
     t.deepEqual(RESP,{
       module: 'admin',
       controller: 'article',
       action: 'list'
     });
     t.end();
   });
 });

 test.serial.cb('options with with is regexp without match',  t => {
   let options = helper.extend({}, defaultOptions, {prefix: [/home/]});
   let ctx = helper.extend({}, defaultCtx, {
     path: '/admin/article/list.html'
   });
   let app = helper.extend({}, defaultApp, {});

   parseRouter(options, app)(ctx, next).then(data => {
     t.deepEqual(RESP,{
       module: 'admin',
       controller: 'article',
       action: 'list'
     });
     t.end();
   });
 });

 test.serial.cb('options with subdomain Object',  t => {
   let options = {
     subdomain: {
       'm1': 'root'
     }
   };
   let ctx = helper.extend({}, defaultCtx, {
     path: 'admin/article/list',
     subdomains: function () {
       return ['m1'];
     }
   });
   let app = helper.extend({}, defaultApp, {
     modules: ['root', 'admin', 'home'],
     routers: {
       admin: {
         match: /root\/admin\/.*/,
         rules: [
           {
             match: /admin\/article\/list\//,
             path: 'admin/article/list/',
             method: 'get',
             query: []
           }
         ]
       }
     }
   });

   parseRouter(options, app)(ctx, next).then(data => {
     t.deepEqual(RESP,{
       module: 'root',
       controller: 'admin',
       action: 'article'
     });
     t.end();
   });
 });

 test.serial.cb('options with subdomain Array',  t => {
   let options = {
     subdomain: ['m1']
   };
   let ctx = helper.extend({}, defaultCtx, {
     path: 'admin/article/list',
     subdomains: function () {
       return ['m1'];
     }
   });
   let app = helper.extend({}, defaultApp, {
     modules: ['m1', 'admin', 'home'],
     routers: {
       admin: {
         match: /m1\/admin\/.*/,
         rules: [
           {
             match: /admin\/article\/list\//,
             path: 'admin/article/list/',
             method: 'get',
             query: []
           }
         ]
       }
     }
   });

   parseRouter(options, app)(ctx, next).then(data => {
     t.deepEqual(RESP,{
       module: 'm1',
       controller: 'admin',
       action: 'article'
     });
     t.end();
   });
 });


test.serial.cb('options with subdomain Array not match',  t => {
   let options = {
     subdomain: ['m1']
   };
   let ctx = helper.extend({}, defaultCtx, {
     path: 'admin/article/list',
     subdomains: function () {
       return ['m1'];
     }
   });
   let app = helper.extend({}, defaultApp, {
     modules: ['user', 'admin', 'home'],
     routers: {
       admin: {
         match: /m1\/admin\/.*/,
         rules: [
           {
             match: /admin\/article\/list\//,
             path: 'admin/article/list/',
             method: 'get',
             query: []
           }
         ]
       }
     }
   });

   parseRouter(options, app)(ctx, next).then(data => {
     t.deepEqual(RESP,{
       module: 'home',
       controller: 'm1',
       action: 'admin'
     });
     t.end();
   });
 });

 test.serial.cb('options with subdomain and path not begin with /',  t => {
   let options = {
     subdomain: {
       'm1': 'root'
     }
   };
   let ctx = helper.extend({}, defaultCtx, {
     path: '/admin/article/list',
     subdomains: function () {
       return ['m1'];
     }
   });
   let app = helper.extend({}, defaultApp, {
     modules: ['root', 'admin', 'home'],
     routers: {
       admin: {
         match: /root\/admin\/.*/,
         rules: [
           {
             match: /admin\/article\/list\//,
             path: 'admin/article/list/',
             method: 'get',
             query: []
           }
         ]
       }
     }
   });

   parseRouter(options, app)(ctx, next).then(data => {
     t.deepEqual(RESP,{
       module: 'root',
       controller: 'admin',
       action: 'article'
     });
     t.end();
   });
 });


 test.serial.cb('options with subdomain null',  t => {
   let options = {
     subdomain: {
       'm2': 'root'
     }
   };
   let ctx = helper.extend({}, defaultCtx, {
     path: '/admin/article/list',
     subdomains: function () {
       return ['m1'];
     }
   });
   let app = helper.extend({}, defaultApp, {
     modules: ['root', 'admin', 'home'],
     routers: {
       admin: {
         match: /root\/admin\/.*/,
         rules: [
           {
             match: /admin\/article\/list\//,
             path: 'admin/article/list/',
             method: 'get',
             query: []
           }
         ]
       }
     }
   });

   parseRouter(options, app)(ctx, next).then(data => {
     t.deepEqual(RESP,{
       module: 'admin',
       controller: 'article',
       action: 'list'
     });
     t.end();
   });
 });

















/**
 * getRules.js
 */
test.serial.cb('default options',  t => {
  let options = helper.extend({}, defaultOptions, {});
  let ctx = helper.extend({}, defaultCtx, {});
  let app = helper.extend({}, defaultApp, {});

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP,{
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('options with routers don\'t have match',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: null
      }
    }
  })
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP,{
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('options with match test failed',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /\/home\/.*/
      }
    }
  })
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP,{
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('options without rules for module',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /\/admin\/article\/.*/,
        rules: null
      }
    }
  })
  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP,{
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('options with routers is an Array',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: [
      {
        match: /admin\/article\/get\//,
        path: 'admin/article/get/',
        method: 'get',
        query: []
      }
    ]
  })

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP,{
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});




















/**
 * getMatchedRule.js
 */
test.serial.cb('rules method not match ctx method',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {method: 'post'});
  let app = helper.extend({}, defaultApp);

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP,{
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('rules method equal rest',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /\/admin\/.*/,
        rules: [
          {
            match: /admin\/article\/list/,
            path: 'admin/article/list/',
            method: 'rest',
            query: []
          }
        ]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP,{
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('rules match not match the path',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /\/admin\/.*/,
        rules: [
          {
            match: /home\/article\/list/,
            path: 'admin/article/list/',
            method: 'rest',
            query: []
          }
        ]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});


// query
test.serial.cb('rules match with query name is number',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/123',
  });
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /\/admin\/.*/,
        rules: [
          {
            match: /admin\/article\/list\/(\d+)/,
            path: 'admin/article/list/:1',
            method: 'rest',
            query: [{name: 0}]
          }
        ]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});


test.serial.cb('rules match with query name is number',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/123',
  });
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /\/admin\/.*/,
        rules: [
          {
            match: /admin\/article\/list\/(\d+)/,
            path: 'admin/article/list',
            method: 'rest',
            query: [{name: 'title'}]
          }
        ]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});





















/**
 * parseRule.js
 */

test.serial.cb('rules method equal redirect',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /\/admin\/.*/,
        rules: [
          {
            match: /admin\/article\/list/,
            path: 'admin/article/list/',
            method: 'redirect',
            query: [],
            statusCode: 302
          }
        ]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('rules method equal redirect and without statusCode',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /\/admin\/.*/,
        rules: [
          {
            match: /admin\/article\/list/,
            path: 'admin/article/list/',
            method: 'redirect',
            query: []
          }
        ]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});

test.serial.cb('rules path with query',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /\/admin\/.*/,
        rules: [
          {
            match: /admin\/article\/list/,
            path: 'admin/article/list?page=1',
            method: 'get',
            query: []
          }
        ]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});


test.serial.cb('rules path with query empty',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp, {
    routers: {
      admin: {
        match: /\/admin\/.*/,
        rules: [
          {
            match: /admin\/article\/list/,
            path: 'admin/article/list?page',
            method: 'get',
            query: []
          }
        ]
      }
    }
  });

  parseRouter(options, app)(ctx, next).then(data => {
     t.deepEqual(RESP, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});


test.serial.cb('ctx path is not beigin with /',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: 'admin'
  });
  let app = helper.extend({}, defaultApp);

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP, {
      module: 'admin',
      controller: 'index',
      action: 'index'
    });
    t.end();
  });
});


























test.serial.cb('controller with /',  t => {
  let options = helper.extend({}, defaultOptions);
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/paper'
  });

  let app = {
    modules: ['home', 'admin'],
    controllers: {
      admin: {
        'article/page': {},
      }
    },
    routers: [
      {
        match: /admin\/article\/list(\.*)/,
        path: 'admin/article/page',
        method: 'get',
        query: [{name: 0}]
      }
    ]
  };

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP, {
      module: 'admin',
      controller: 'article/page',
      action: 'index'
    });
    t.end();
  });
});



test.serial.cb('options with enableDefaultRouter',  t => {
  let options = helper.extend({}, defaultOptions, {enableDefaultRouter: false});
  let ctx = helper.extend({}, defaultCtx, {
    path: '/admin/article/list/paper'
  });

  let app = {
    modules: ['home', 'admin'],
    controllers: {
      admin: {
        'article': {},
      }
    },
    routers: [
      {
        match: /home\/article\/list(\.*)/,
        path: 'admin/article/page',
        method: 'get',
        query: []
      }
    ]
  };

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP, {
      module: 'admin',
      controller: 'article/page',
      action: 'index'
    });
    t.end();
  });
});




test.serial.cb('options without subdomainOffset',  t => {
  let options = helper.extend({}, defaultOptions, {
    subdomainOffset: 0
  });
  let ctx = helper.extend({}, defaultCtx);
  let app = helper.extend({}, defaultApp);

  parseRouter(options, app)(ctx, next).then(data => {
    t.deepEqual(RESP, {
      module: 'admin',
      controller: 'article',
      action: 'list'
    });
    t.end();
  });
});



