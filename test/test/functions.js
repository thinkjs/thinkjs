var should = require('should');
var assert = require('assert');
var muk = require('muk');
process.argv[2] = '/'; //命中命令行模式
require('../www/index.js');

describe('getThinkRequirePath', function(){
  it('getThinkRequirePath("Model")', function(){
    var path = getThinkRequirePath('Model');
    assert.equal(path.indexOf('lib/Lib/Core/Model.js') > -1, true);
  })
  it('getThinkRequirePath("notExistModule")', function(){
    var path = getThinkRequirePath('notExistModule');
    assert.equal(path, undefined);
  })
})

describe('thinkRequire', function(){
  it('thinkRequire is function', function(){
    assert.equal(isFunction(thinkRequire), true)
  })
  it('thinkRequire(function(){})', function(){
    var fn = thinkRequire(function(){});
    assert.equal(isFunction(fn), true);
  })
  it('thinkRequire("modulenotexist")', function(){
    var module = '';
    try{
      module = thinkRequire('modulenotexist');
    }catch(e){}
    assert.equal(module, '')
  })
  var list = [
    'Controller', 'App', 'Behavior', 'Cache', 'Db', 
    'Dispatcher', 'Filter', 'Http', 'Model', 
    'Session', 'Think', 'Valid', 'View', 'Cookie', 'WebSocket',
    'AdvModel', 'CheckResourceBehavior', 'CheckRouteBehavior',
    'DenyIpBehavior', 'LocationTemplateBehavior', 'ParseTemplateBehavior',
    'ReadHtmlCacheBehavior', 'WriteHtmlCacheBehavior', 'FileCache',
    'MemcacheCache', 'MysqlDb', 'DbSession', 'FileSession', 'MemcacheSocket',
    'MysqlSocket', 'EjsTemplate', 'RestController'
  ];
  list.forEach(function(item){
    it(item + ' is module', function(){
      var module = thinkRequire(item);
      assert.equal(isFunction(module) || isObject(module), true)
    })
  })
})

describe('inherits from base Class', function(){
  it('inherits from FileCache', function(){
    var fileCache = thinkRequire('FileCache');
    var cls = Cache('FileCache', function(){})
    assert.equal(cls.super_ === fileCache, true)
  })
  it('inherits from Cache', function(){
    var cache = thinkRequire('Cache');
    var cls = Cache(function(){})
    assert.equal(cls.super_ === cache, true)
  })
})


describe('B', function(){
  it('B(function(){})', function(){
    var fn = function(){
      return 'welefen';
    }
    assert.equal(B(fn), 'welefen')
  })
  it('B("DenyIpBehavior") = true', function(){
    assert.equal(B('DenyIp'), true)
  })
  it('B("DenyIpBehavior"), promise', function(){
    C('deny_ip', ['127.0.0.1']);
    var result = B('DenyIp', {
      ip: function(){
        return '127.0.0.1';
      },
      res: {
        end: function(){}
      }
    });
    assert.equal(isFunction(result.then), true)
  })
})

describe('C', function(){
  it('C("db_host") = "localhost"', function(){
    var host = C('db_host');
    assert.equal(host, 'localhost');
  })
  it('C("one.two") = undefined', function(){
    assert.equal(C('one.two'), undefined)
  })
  it('C("one") = undefined', function(){
    assert.equal(C('one'), undefined);
  })
  it('C("one", "welefen")', function(){
    C('one', 'welefen');
    assert.equal(C('one'), 'welefen');
  })
  it('C("one1.two", "welefen")', function(){
    C('one1.two', 'welefen');
    assert.equal(C('one1.two'), 'welefen');
    assert.equal(JSON.stringify(C('one1')), '{"two":"welefen"}')
  })
  it('C()', function(){
    var data = C();
    assert.equal(data.db_host, 'localhost');
    assert.equal(data.db_type, 'mysql');
    assert.equal(data.port, 8360)
  })
  it('C(null)', function(){
    data = C();
    C(null);
    assert.equal(C('db_host'), undefined)
    assert.equal(C('db_type'), undefined);
    assert.equal(C('port'), undefined)
    C(data);
    assert.equal(C('db_type'), 'mysql')
  })
})

describe('F', function(){
  it('F("welefen", "suredy")', function(){
    F('welefen', 'suredy');
    var value = F('welefen');
    assert.equal(value, 'suredy')
  })
  it('F("welefen", null)', function(){
    F('welefen', null);
    assert.equal(F('welefen'), null)
  })
  it('F("welefen", {})', function(){
    var data = {name: 'welefen', value: 'suredy'};
    F('welefen', data);
    assert.equal(JSON.stringify(F('welefen')), JSON.stringify(data))
  })
  it('F("welefen", "suredy", tmpPath)', function(){
    var tmp = require('os').tmpdir();
    F('welefen', 'suredy', tmp);
    var value = F('welefen', undefined, tmp);
    assert.equal(value, 'suredy')
  })
})

describe('tag', function(){
  var http = thinkRequire('Http').getDefaultHttp('/index/index');
  http = thinkRequire('Http')(http.req, http.res).run();
  it('all tags', function(done){
    var tags = C('tag');
    assert.equal(JSON.stringify(tags), '{"app_init":[],"form_parse":[null],"path_info":[],"resource_check":["CheckResource"],"route_check":["CheckRoute"],"app_begin":["ReadHtmlCache"],"action_init":[],"view_init":[],"view_template":["LocationTemplate"],"view_parse":["ParseTemplate"],"view_filter":[],"view_end":["WriteHtmlCache"],"action_end":[],"app_end":[null]}')
    done();
  })
  it('tags not found', function(done){
    tag('xxxx', http).then(function(data){
      assert.equal(data, undefined)
      done();
    })
  })
  it('tag:app_init', function(done){
    http.then(function(http){
      return tag('app_init', http)
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('tag:form_parse', function(done){
    http.then(function(http){
      return tag('form_parse', http)
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
  it('tag:path_info', function(done){
    http.then(function(http){
      return tag('path_info', http)
    }).then(function(data){
      assert.equal(data, undefined);
      done();
    })
  })
})


describe('A', function(){
  var http = thinkRequire('Http').getDefaultHttp('/index/index');
  http = thinkRequire('Http')(http.req, http.res).run();
  it('A("home:index:test")', function(done){
    var ret = A('home:index:test', http);
    ret.then(function(value){
      assert.equal(value, 'welefen')
      done();
    })
  })
  it('A("home:test:test")', function(done){
    var ret = A('home:test:test', http);
    ret.then(function(value){
      assert.equal(value, 'test:test')
      done();
    })
  })
  it('A("home:test:other")', function(done){
    var ret = A('home:test:other', http, 'welefen');
    ret.then(function(value){
      assert.equal(value, '{"name":"welefen"}')
      done();
    })
  })
  it('A("home:test:other") 1', function(done){
    var ret = A('home:test:other', http, ['welefen', 'suredy']);
    ret.then(function(value){
      assert.equal(value, '{"name":"welefen","value":"suredy"}')
      done();
    })
  })
  it('A("admin:index:test") 1', function(done){
    var ret = A('admin:index:test', http, ['welefen', 'suredy']);
    ret.then(function(value){
      assert.equal(value, 'admin:index:test')
      done();
    })
  })
  it('A("admin:index")', function(){
    var ret = A('admin:index', http, ['welefen', 'suredy']);
    assert.equal(isFunction(ret.get), true);
    assert.equal(isFunction(ret.post), true);
  })
  it('A("admin:xxxxx")', function(){
    var ret = A('admin:xxxxx', http, ['welefen', 'suredy']);
    assert.equal(ret, null);
  })
  it('A("admin:xxxxx:test")', function(){
    var ret = A('admin:xxxxx:test', http, ['welefen', 'suredy']);
    assert.equal(ret, null);
  })
})

describe('D', function(){
  it('D("User").hasFile = function', function(){
    var model = D('User');
    assert.equal(isFunction(model.hasFile), true);
  })
  it('D("User") prop', function(){
    var model = D('User');
    var testName = model.constructor.__prop.testName;
    assert.equal(testName, 'welefen')
  })
  it('D("xxx").hasFile = undefined', function(){
    var model = D('xxx');
    assert.equal(model.hasFile, undefined)
  })
  it('D("xxx").prop', function(){
    var model = D('xxx');
    assert.equal(model.constructor.__prop.testName, undefined)
  })
  it('D("User:AdvModel")', function(){
    var model = D('User:AdvModel');
    assert.equal(isFunction(model.setRelation), false)
  })
  it('D("Xxx:AdvModel")', function(){
    var model = D('Xxx:AdvModel');
    assert.equal(isFunction(model.setRelation), true)
  })
})

describe('M', function(){
  it('D("User").hasFile = undefined', function(){
    var model = M('User');
    assert.equal(model.hasFile, undefined);
  })
  it('M("User") prop', function(){
    var model = M('User');
    var testName = model.constructor.__prop.testName;
    assert.equal(testName, undefined)
  })
  it('M("XXX").hasFile = undefined', function(){
    var model = M('XXX');
    assert.equal(model.hasFile, undefined);
  })
  it('M("User:AdvModel")', function(){
    var model = M('User:AdvModel');
    assert.equal(isFunction(model.setRelation), true)
  })
  it('M("Xxx:AdvModel")', function(){
    var model = D('Xxx:AdvModel');
    assert.equal(isFunction(model.setRelation), true)
  })
})

describe('S', function(){
  describe('FileCache', function(){
    it('file cache string', function(done){
      S('name', 'welefen').then(function(){
        return S('name');
      }).then(function(value){
        assert.equal(value, 'welefen');
        done();
      })
    })
    it('file cache json', function(done){
      S('json', {name: 'welefen'}).then(function(){
        return S('json');
      }).then(function(value){
        //console.log(JSON.stringify(value))
        assert.equal(JSON.stringify(value), '{"name":"welefen"}');
        done();
      })
    })
    it('file rm cache', function(done){
      S('json', {name: 'welefen'}).then(function(){
        return S('json', null);
      }).then(function(){
        return S('json')
      }).then(function(value){
        //console.log(JSON.stringify(value))
        assert.equal(value, undefined);
        done();
      })
    })
    it('file cache timeout', function(done){
      S('json', {name: 'welefen'}, -100).then(function(){
        return S('json');
      }).then(function(value){
        //console.log(JSON.stringify(value))
        assert.equal(value, undefined);
        done();
      })
    })
    it('file cache time', function(done){
      S('json', {name: 'welefen'}, 3).then(function(){
        return S('json');
      }).then(function(value){
        //console.log(JSON.stringify(value))
        assert.equal(JSON.stringify(value), '{"name":"welefen"}');
        done();
      })
    })
    it('file cache, timeout remove', function(done){
      S('json', {name: 'welefen'}, 0.01).then(function(){
        var deferred = getDefer();
        setTimeout(function(){
          S('json').then(function(data){
            deferred.resolve(data)
          })
        }, 20)
        return deferred.promise;
      }).then(function(value){
        //console.log(JSON.stringify(value))
        assert.equal(value, undefined);
        done();
      })
    })
  })
  describe('Node.js memory', function(){
    //使用Node.js内存cache
    it('Node.js mem, cache string', function(done){
      S('name', 'welefen', true).then(function(){
        return S('name');
      }).then(function(value){
        assert.equal(value, 'welefen');
        done();
      })
    })
    it('Node.js mem, cache json', function(done){
      S('json', {name: 'welefen'}, true).then(function(){
        return S('json', undefined, true);
      }).then(function(value){
        //console.log(JSON.stringify(value))
        assert.equal(JSON.stringify(value), '{"name":"welefen"}');
        done();
      })
    })
    it('Node.js mem, rm cache', function(done){
      S('json1', {name: 'welefen'}, true).then(function(){
        return S('json1', null, true);
      }).then(function(){
        return S('json1', undefined, true)
      }).then(function(value){
        //console.log(JSON.stringify(value))
        assert.equal(value, undefined);
        done();
      })
    })
    it('Node.js mem, cache timeout', function(done){
      S('json2', {name: 'welefen'}, {type: true, timeout: -100}).then(function(){
        return S('json2', undefined, true);
      }).then(function(value){
        assert.equal(value, undefined);
        done();
      })
    })
    it('Node.js mem, cache time', function(done){
      S('json3', {name: 'welefen'}, {type: true, timeout: 3}).then(function(){
        return S('json3', undefined, true);
      }).then(function(value){
        //console.log(JSON.stringify(value))
        assert.equal(JSON.stringify(value), '{"name":"welefen"}');
        done();
      })
    })
    it('Node.js mem, cache timeout remove', function(done){
      S('json4', {name: 'welefen'}, {type: true, timeout: 0.01}).then(function(){
        var deferred = getDefer();
        setTimeout(function(){
          S('json4', undefined, true).then(function(data){
            deferred.resolve(data)
          })
        }, 20)
        return deferred.promise;
      }).then(function(value){
        //console.log(JSON.stringify(value))
        assert.equal(value, undefined);
        done();
      })
    })
  })
})



describe('L', function(){
  it('L("welefen") = welefen', function(){
    assert.equal(L('welefen'), 'welefen')
  })
  it('L() = undefined', function(){
    assert.equal(L(), undefined)
  })
})


