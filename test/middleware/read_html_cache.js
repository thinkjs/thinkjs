var assert = require('assert');
var muk = require('muk');
var path = require('path');

var _http = require('../_http.js');

function execMiddleware(middleware, config, options, data){
  think.APP_PATH = path.dirname(__dirname) + '/testApp';
  var req = think.extend({}, _http.req);
  var res = think.extend({}, _http.res);
  return think.http(req, res).then(function(http){
    if(config){
      http._config = config;
    }
    if(options){
      for(var key in options){
        http[key] = options[key];
      }
    }
    return think.middleware(middleware, http, data);
  })
}


describe('middle/read_html_cache', function(){
  it('base, off', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {}
    }, {}).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('base, empty rules', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true
      }
    }, {}).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('base, empty rules', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {}
      }
    }, {}).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('not matched', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/controller/ddd': 'test_value'
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/group/detail': 'test_value'
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched, array', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/group/detail': ['test_value']
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched, cookie', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/group/detail': ['test_value']
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched, cookie', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/group/detail': ['test_value{cookie.welefen}']
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched, cookie not found', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/group/detail': ['test_value{cookie.notfound}']
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched, cookie', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/group/detail': ['test_value{cookie.welefen}', function(key){
            //console.log(key)
            assert.equal(key, 'test_valuesuredy')
          }]
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched, cookie not found 1', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/group/detail': ['test_value{cookie.notfoud}', function(key){
            assert.equal(key, 'test_value')
          }]
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched, get', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/group/detail': ['test_value{name}', function(key){
            //console.log(key)
            assert.equal(key, 'test_valuewelefen')
          }]
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'},
      _get: {name: 'welefen'}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched, module', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/group/detail': ['test_value{:module}', function(key){
            assert.equal(key, 'test_valuehome')
          }]
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'},
      _get: {name: 'welefen'}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched, controller', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/group/detail': ['test_value{:controller}', function(key){
            assert.equal(key, 'test_valuegroup')
          }]
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'},
      _get: {name: 'welefen'}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched, controller', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/group/detail': ['test_value{:action}', function(key){
            assert.equal(key, 'test_valuedetail')
          }]
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'},
      _get: {name: 'welefen'}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched, mix', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/group/detail': ['test_value_{:module}_{:controller}_{:action}_{name}_{cookie.welefen}', function(key){
            assert.equal(key, 'test_value_home_group_detail_welefen_suredy')
          }]
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'},
      _get: {name: 'welefen'}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched, mix, 3', function(done){
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        rules: {
          'home/group/detail': ['test_value_{:module}_{:controller}_{:action}_{name}_{cookie.welefen}', 1000, function(key){
            assert.equal(key, 'test_value_home_group_detail_welefen_suredy')
          }]
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'},
      _get: {name: 'welefen'}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('matched, cache file exist', function(done){
    var cachePath = __dirname;
    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        path: cachePath,
        file_ext: '.js',
        rules: {
          'home/group/detail': ['test_value_{:module}_{:controller}_{:action}_{name}_{cookie.welefen}', Date.now(), function(key){
            assert.equal(key, 'test_value_home_group_detail_welefen_suredy');
            return 'read_html_cache';
          }]
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'},
      _get: {name: 'welefen'}
    }).catch(function(err){
      assert.equal(think.isPrevent(err), true);
      done();
    })
  })
  it('matched, template file not exist', function(done){
    var cachePath = __dirname;
    var key = 'home/group/detail';
    thinkCache(thinkCache.VIEW, key, cachePath + '/read_html_cache.jsxxx');

    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        path: cachePath,
        file_ext: '.js',
        rules: {
          'home/group/detail': ['test_value_{:module}_{:controller}_{:action}_{name}_{cookie.welefen}', 1000, function(key){
            assert.equal(key, 'test_value_home_group_detail_welefen_suredy');
            return 'read_html_cache';
          }]
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'},
      _get: {name: 'welefen'}
    }).then(function(data){
      assert.equal(data, undefined);
      thinkCache(thinkCache.VIEW, key, null);
      done();
    })
  })

  it('matched, template file exist', function(done){
    var cachePath = __dirname;
    var key = 'home/group/detail';
    thinkCache(thinkCache.VIEW, key, cachePath + '/read_html_cache.js');

    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        path: cachePath,
        file_ext: '.js',
        rules: {
          'home/group/detail': ['test_value_{:module}_{:controller}_{:action}_{name}_{cookie.welefen}', Date.now(), function(key){
            assert.equal(key, 'test_value_home_group_detail_welefen_suredy');
            return 'read_html_cache';
          }]
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'},
      _get: {name: 'welefen'}
    }).catch(function(err){
      assert.equal(think.isPrevent(err), true);
      thinkCache(thinkCache.VIEW, key, null);
      done();
    })
  })

  it('matched, template file is update', function(done){
    var cachePath = __dirname;
    var key = 'home/group/detail';
    thinkCache(thinkCache.VIEW, key, cachePath + '/read_html_cache.jsxxx');

    require('fs').writeFileSync(cachePath + '/read_html_cache.jsxxx', 'welefen');

    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        path: cachePath,
        file_ext: '.js',
        rules: {
          'home/group/detail': ['test_value_{:module}_{:controller}_{:action}_{name}_{cookie.welefen}', 1000, function(key){
            assert.equal(key, 'test_value_home_group_detail_welefen_suredy');
            return 'read_html_cache';
          }]
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'},
      _get: {name: 'welefen'}
    }).then(function(data){
      assert.equal(data, undefined);
      thinkCache(thinkCache.VIEW, key, null);
      require('fs').unlinkSync(cachePath + '/read_html_cache.jsxxx');
      done();
    })
  })
  it('matched, cache file is expired', function(done){
    var cachePath = __dirname;
    var key = 'home/group/detail';
    thinkCache(thinkCache.VIEW, key, cachePath + '/read_html_cache.js');

    execMiddleware('read_html_cache', {
      html_cache: {
        on: true,
        path: cachePath,
        file_ext: '.js',
        rules: {
          'home/group/detail': ['test_value_{:module}_{:controller}_{:action}_{name}_{cookie.welefen}', -1111000, function(key){
            assert.equal(key, 'test_value_home_group_detail_welefen_suredy');
            return 'read_html_cache';
          }]
        }
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _cookie: {welefen: 'suredy'},
      _get: {name: 'welefen'}
    }).then(function(data){
      assert.equal(data, undefined);
      thinkCache(thinkCache.VIEW, key, null);
      done();
    })
  })

  
})