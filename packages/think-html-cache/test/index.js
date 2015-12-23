var assert = require('assert');
var path = require('path');
var fs = require('fs');
var http = require('http');

var thinkjs = require('thinkjs');
var instance = new thinkjs();
instance.load();


var Class = require('../lib/index.js');


var getHttp = function(options){
  var req = new http.IncomingMessage();
  req.headers = { 
    'host': 'www.thinkjs.org',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit',
  };
  req.method = 'GET';
  req.httpVersion = '1.1';
  req.url = '/index/index';
  var res = new http.ServerResponse(req);
  res.write = function(){
    return true;
  }

  return think.http(req, res).then(function(http){
    if(options){
      for(var key in options){
        http[key] = options[key];
      }
    }
    return http;
  })
}

var instance;
var execMiddleware = function(options, fn){
  return getHttp(options).then(function(http){
    instance = new Class(http);
    fn && fn(instance);
    return instance.run();
  })
}
var execMiddlewareContent = function(options, fn){
  return getHttp(options).then(function(http){
    instance = new Class(http);
    fn && fn(instance);
    return instance.run('content');
  })
}


describe('think-html-cache', function(){
  it('not GET method', function(done){
    execMiddleware({
      method: 'POST'
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('html_cache not config', function(done){
    execMiddleware({
      _config: {html_cache: undefined}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('html_cache off', function(done){
    execMiddleware({
      _config: {html_cache: {on: false}}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('html_cache rules empty', function(done){
    execMiddleware({
      _config: {html_cache: {on: true, rules: {}}}
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('html_cache has rules', function(done){
    execMiddleware({
      _config: {html_cache: {on: true, rules: {
        'index/index': 'index'
      }}}
    }, function(instance){
      instance.readHtmlCache = function(){};
    }).then(function(data){
      assert.equal(instance.config.path.length > 0, true);
      assert.equal(data, undefined);
      done();
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('html_cache has rules, getMatchRule, not match', function(done){
    var readHtmlCache;
    execMiddleware({
      _config: {html_cache: {on: true, rules: {
        'index/index': 'index'
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      var rule = instance.getMatchRule();
      assert.equal(rule, false);
      done();
    })
  })
  it('html_cache has rules, getMatchRule, match', function(done){
    var readHtmlCache;
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': 'index'
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      var rule = instance.getMatchRule();
      assert.deepEqual(rule, ['index']);
      done();
    })
  })
  it('html_cache has rules, getMatchRule, match 1', function(done){
    var readHtmlCache;
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index']
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      var rule = instance.getMatchRule();
      assert.deepEqual(rule, ['index']);
      done();
    })
  })
  it('html_cache has rules, getMatchRule, match 2', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      var rule = instance.getMatchRule();
      assert.deepEqual(rule, ['index', 0, fn]);
      done();
    })
  })
  it('html_cache has rules, getCacheKey', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      var key = instance.getCacheKey(['index']);
      assert.equal(key, '6a992d5529f459a44fee58c733255e86');
      assert.equal(key, instance.http.html_cache_key);
      done();
    })
  })
  it('html_cache has rules, getCacheKey, get module value', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      var key = instance.getCacheKey(['index_{:module}', 0, function(key){return key}]);
      assert.equal(key, 'index_home');
      assert.equal(key, instance.http.html_cache_key);
      done();
    })
  })
  it('html_cache has rules, getCacheKey, get controller value', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      var key = instance.getCacheKey(['index_{:controller}', 0, function(key){return key}]);
      assert.equal(key, 'index_index');
      assert.equal(key, instance.http.html_cache_key);
      done();
    })
  })
  it('html_cache has rules, getCacheKey, get action value', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      var key = instance.getCacheKey(['index_{:action}', 0, function(key){return key}]);
      assert.equal(key, 'index_index');
      assert.equal(key, instance.http.html_cache_key);
      done();
    })
  })
  it('html_cache has rules, getCacheKey, get GET value', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _get: {name: 'xxxx'},
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      var key = instance.getCacheKey(['index_{name}', 0, function(key){return key}]);
      assert.equal(key, 'index_xxxx');
      assert.equal(key, instance.http.html_cache_key);
      done();
    })
  })
  it('html_cache has rules, getCacheKey, get GET value, empty', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _get: {name: 'xxxx'},
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      var key = instance.getCacheKey(['index_{namdddde}', 0, function(key){return key}]);
      assert.equal(key, 'index_');
      assert.equal(key, instance.http.html_cache_key);
      done();
    })
  })
  it('html_cache has rules, getCacheKey, get cookie value', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _get: {name: 'xxxx'},
      _cookie: {name: 'thinkjs'},
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      var key = instance.getCacheKey(['index_{cookie.name}', 0, function(key){return key}]);
      assert.equal(key, 'index_thinkjs');
      assert.equal(key, instance.http.html_cache_key);
      done();
    })
  })
  it('html_cache has rules, view file, not found', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      var file = instance.viewFile();
      assert.equal(file, undefined)
      done();
    })
  })
  it('html_cache has rules, view file', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      instance.http.tpl_file = __filename;
      instance.viewFile();
      delete instance.http.tpl_file;
      var file = instance.viewFile();
      //console.log(file);
      assert.equal(file, __filename)
      done();
    })
  })
  it('html_cache has rules, get cache content, empty', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.store.get = function(){};
      instance.getCacheContent('xxx').then(function(data){
        assert.equal(data, undefined);
        done();
      });
    })
  })
  it('html_cache has rules, get cache content, expire is not valid', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.store.get = function(){return 'eeeee'};
      instance.getCacheContent('xxx').then(function(data){
        assert.equal(data, undefined);
        done();
      });
    })
  })
  it('html_cache has rules, get cache content, content is empty', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.store.get = function(){return '00000000001111111111'};
      instance.getCacheContent('xxx').then(function(data){
        assert.equal(data, undefined);
        done();
      });
    })
  })
  it('html_cache has rules, get cache content, viewfile is empty', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.store.get = function(){return '00000000001111111111content'};
      instance.viewFile = function(){}
      instance.getCacheContent('xxx').then(function(data){
        assert.equal(data, undefined);
        done();
      });
    })
  })
  it('html_cache has rules, get cache content, viewfile is not exist', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.store.get = function(){return '00000000001111111111content'};
      instance.viewFile = function(){return '/thinkjs/is not exit/'}
      instance.getCacheContent('xxx').then(function(data){
        assert.equal(data, undefined);
        done();
      });
    })
  })
  it('html_cache has rules, get cache content, content is expired', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.store.get = function(){return ('000000000000'+(Date.now() - 1000000000000)).slice(-20)+ 'content'};
      instance.viewFile = function(){return __filename}
      return instance.getCacheContent('xxx', 0).then(function(data){
        assert.equal(data, undefined);
        done();
      })
    })
  })
  it('html_cache has rules, get cache content, content is expired', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.store.get = function(){return ('000000000000'+(Date.now() - 1000000000000)).slice(-20)+ 'content'};
      instance.viewFile = function(){return __filename}
      return instance.getCacheContent('xxx', 10).then(function(data){
        assert.equal(data, undefined);
        done();
      })
    })
  })
  it('html_cache has rules, get cache content, content', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.store.get = function(){return ('000000000000'+(Date.now() + 10000000)).slice(-20)+ 'content'};
      instance.viewFile = function(){return __filename}
      return instance.getCacheContent('xxx', 10).then(function(data){
        assert.equal(data, 'content');
        done();
      })
    })
  })
  it('html_cache has rules, readHtmlCache, rule not match', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      instance.getMatchRule = function(){}
      var data = instance.readHtmlCache();
      data.then(function(data){
        assert.equal(data, undefined);
        done();
      })
    })
  })
   it('html_cache has rules, readHtmlCache, content empty', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      instance.getMatchRule = function(){return ['index', 100]};
      instance.getCacheContent = function(){return}
      var data = instance.readHtmlCache();
      data.then(function(data){
        assert.equal(data, undefined);
        assert.equal(instance.http.html_cache_time, 100)
        done();
      })
    })
  })
   it('html_cache has rules, readHtmlCache, content empty 1', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      instance.getMatchRule = function(){return ['index']};
      instance.getCacheContent = function(){return}
      var data = instance.readHtmlCache();
      data.then(function(data){
        assert.equal(data, undefined);
        assert.equal(instance.http.html_cache_time, 0)
      })
      done();
    })
  })
   it('html_cache has rules, readHtmlCache, content', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      instance.getMatchRule = function(){return ['index']};
      instance.getCacheContent = function(){return 'content'}
      var prevent = think.prevent;
      think.prevent = function(){};
      instance.http.header = function(name, value){
        if(name === 'X-Cache'){
          assert.equal(value, 'HIT (6a992d5529f459a44fee58c733255e86)');
        }
      }
      instance.http.end = function(content){
        assert.equal(content, 'content');
      }
      instance.readHtmlCache();
      think.prevent = prevent;
      done();
    })
  })
  it('html_cache has rules, writeHtmlCache, content', function(done){
    var readHtmlCache, fn = function(){};
    execMiddleware({
      module: 'home',
      controller: 'index',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      readHtmlCache = instance.readHtmlCache;
      instance.readHtmlCache = function(){};
    }).then(function(data){
      instance.readHtmlCache = readHtmlCache;
      instance.http.html_cache_key = 'key';
      instance.http.html_cache_time = 0;
      instance.store.set = function(key, value){
        assert.equal(value.indexOf('content') > -1, true)
      }
      instance.writeHtmlCache('content');
      
      done();
    })
  })
  it('html_cache has rules, run, has content', function(done){
    var writeHtmlCache, fn = function(){};
    execMiddlewareContent({
      module: 'home',
      controller: 'index',
      html_cache_key: 'wwww',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      writeHtmlCache = instance.readHtmlCache;
      instance.writeHtmlCache = function(content){return content};
    }).then(function(data){
      assert.equal(data, 'content')
      done();
    })
  })
  it('html_cache has rules, run, has content, no cache key', function(done){
    var writeHtmlCache, fn = function(){};
    execMiddlewareContent({
      module: 'home',
      controller: 'index',
      //html_cache_key: 'wwww',
      action: 'index',
      _config: {html_cache: {on: true, rules: {
        'index/index': ['index', fn]
      }}}
    }, function(instance){
      writeHtmlCache = instance.readHtmlCache;
      instance.writeHtmlCache = function(content){return content};
    }).then(function(data){
      assert.equal(data, 'content')
      done();
    })
  })
  it('test async', function(done){
    Promise.resolve().then(function(){
      done();
    })
  })
})