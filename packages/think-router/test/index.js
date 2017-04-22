/*
* @Author: lushijie
* @Date:   2017-04-20 09:22:22
* @Last Modified by:   lushijie
* @Last Modified time: 2017-04-22 13:25:53
*/
const test = require('ava');
const helper = require('think-helper');
const next = () => Promise.resolve();

const mockery = require('mockery');
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
        RESP[e[0]] = e[1];
      }
    })
  }
});

let RESP = {};
const parseRouter = require('../');


test('default options', async t => {
  let options = {};

  let ctx = {
      path: '/admin/article/get/12',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a', 'b'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: { // 对象或者数组
      admin: {
        match: /\/admin\/article\/.*/,
        rules: [
          {
            match: /admin\/article\/get\/(\d+)/,
            path: 'admin/article/get/:1?title=thinkjs',
            method: 'get',
            query: [{name: 0}]
            // query: [{name: 'lushijie'}, {name: 'test'}]
          }
        ]
      }
    },
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});



test('options with routers is an Object', async t => {
  let options = {};

  let ctx = {
      path: '/admin/article/get/12',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a', 'b'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: { // 对象或者数组
      admin: {
        match: /\/admin\/article\/.*/,
        rules: [
          {
            match: /admin\/article\/get\/(\d+)/,
            path: 'admin/article/get/:1?title=thinkjs',
            method: 'get',
            query: [{name: 'lushijie'}, {name: 'test'}]
          }
        ]
      }
    },
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});


test('options with redirect', async t => {
  let options = {};

  let ctx = {
      path: '/admin/article/get/12',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a', 'b'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: { // 对象或者数组
      admin: {
        match: /\/admin\/article\/.*/,
        rules: [
          {
            match: /admin\/article\/get\/(\d+)/,
            path: 'admin/article/get/:1?title=thinkjs',
            method: 'redirect',
            query: [{name: 'lushijie'}, {name: 'test'}],
            statusCode: 302
          }
        ]
      }
    },
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});

test('options with redirect without statusCode', async t => {
  let options = {};

  let ctx = {
      path: '/admin/article/get/12',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a', 'b'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: { // 对象或者数组
      admin: {
        match: /\/admin\/article\/.*/,
        rules: [
          {
            match: /admin\/article\/get\/(\d+)/,
            path: 'admin/article/get/:1?title=thinkjs',
            method: 'redirect',
            query: [{name: 'lushijie'}, {name: 'test'}]
          }
        ]
      }
    },
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});

test('options with routers is an Array', async t => {
  let options = {};

  let ctx = {
      path: '/admin/article/get/12',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a', 'b'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: [
      {
        match: /admin\/article\/get\/(\d+)/,
        path: 'admin/article/get/:1?title=thinkjs',
        method: 'get',
        query: [{name: 0}]
      }
    ],
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});

test('options with match is empty', async t => {
  let options = {};

  let ctx = {
      path: '/admin/article/get/12',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a', 'b'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: {
      admin: {
        match: null,
        rules: [
          {
            match: /admin\/article\/get\/(\d+)/,
            path: 'admin/article/get/:1?title=thinkjs',
            method: 'get',
            query: [{name: 'lushijie'}, {name: 'test'}]
          }
        ]
      }
    },
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});

test('options with match test failed', async t => {
  let options = {};

  let ctx = {
      path: '/admin/article/get/12',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a', 'b'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: {
      admin: {
        match: /failed/,
        rules: [
          {
            match: /admin\/article\/get\/(\d+)/,
            path: 'admin/article/get/:1?title=thinkjs',
            method: 'get',
            query: [{name: 'lushijie'}, {name: 'test'}]
          }
        ]
      }
    },
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});

test('options with match test failed', async t => {
  let options = {};

  let ctx = {
      path: '/admin/article/get/12',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a', 'b'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: {
      admin: {
        match: /admin\/article\/get\/(\d+)/,
        rules: null
      }
    },
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});

test('options with subdomain is an Array', async t => {
  let options = {
    subdomain: ['m1,admin', 'user']
  };

  let ctx = {
      path: '/admin/article/get/12',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['m1', 'admin'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: [
      {
        match: /admin\/article\/get\/(\d+)/,
        path: 'admin/article/get/:1?title=thinkjs',
        method: 'get',
        query: [{name: 0}]
      }
    ],
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});


test('options with subdomain is an Object', async t => {
  let options = {
    subdomain: {'a1,admin': 'admin', user: 'user'}
  };

  let ctx = {
      path: 'admin/article/get/12',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a1', 'admin'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: [
      {
        match: /admin\/article\/get\/(\d+)/,
        path: 'admin/article/get/:1?title=thinkjs',
        method: 'get',
        query: [{name: 0}]
      }
    ],
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});


test('options with subdomainOffset', async t => {
  let options = {
    subdomainOffset: 0
  };

  let ctx = {
      path: '/admin/article/get/12',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a', 'b'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: [
      {
        match: /admin\/article\/get\/(\d+)/,
        path: 'admin/article/get/:1?title=thinkjs',
        method: 'get',
        query: [{name: 0}]
      }
    ],
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});


test('options with prefix&suffix is string', async t => {
  let options = {
    prefix: ['/thinkjs'],
    suffix: ['.html']
  };

  let ctx = {
      path: '/thinkjs/admin/article/get/12.html',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a', 'b'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: [
      {
        match: /admin\/article\/get\/(\d+)/,
        path: 'admin/article/get/:1?title=thinkjs',
        method: 'get',
        query: [{name: 0}]
      }
    ],
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});


test('options with prefix&suffix is regexp', async t => {
  let options = {
    prefix: [/thinkjs/],
    suffix: [/\.html/]
  };

  let ctx = {
      path: '/thinkjs/admin/article/get/12.html',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a', 'b'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: [
      {
        match: /admin\/article\/get\/(\d+)/,
        path: 'admin/article/get/:1?title=thinkjs',
        method: 'get',
        query: [{name: 0}]
      }
    ],
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});


test('options with suffix is empty', async t => {
  let options = {
    suffix: []
  };

  let ctx = {
      path: '/thinkjs/admin/article/get/12.html',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a', 'b'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: [
      {
        match: /admin\/article\/get\/(\d+)/,
        path: 'admin/article/get/:1?title=thinkjs',
        method: 'get',
        query: [{name: 0}]
      }
    ],
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});

test('default options', async t => {
  let options = {
    defaultController: 'admin',
    defaultAction: 'article'
  };

  let ctx = {
      path: '/admin/article/get/12',
      module: '',
      controller: '',
      action: '',
      method: 'GET',
      redirect: function(path) {
        return Promise.resolve();
      },
      param: function(query) {
        this.query = query;
      },
      subdomains: function() {
        return ['a', 'b'];
      },
      status: ''
  };

  let app = {
    modules: ['home', 'admin'], // Array
    controllers: {
      admin: {
        'article/get': {},
      }
    },
    routers: {},
    subdomainOffset: ''
  };

  parseRouter(options, app)(ctx, next).then(data => {
    console.log(RESP);
    console.log(ctx.query);
    t.pass();
  });
});


