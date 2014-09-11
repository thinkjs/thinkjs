var should = require('should');
var assert = require('assert');
var muk = require('muk');
var path = require('path');
var fs = require('fs');

global.APP_PATH = path.normalize(__dirname + '/../App');
process.execArgv.push('--no-app');
require(path.normalize(__dirname + '/../../index.js'));

describe('getThinkRequirePath', function(){
  it('getThinkRequirePath("AdvModel") with APP_DEBUG', function(done){
    global.APP_DEBUG = true;
    var path = getThinkRequirePath('AdvModel');
    assert.equal(path.indexOf('AdvModel.js') > -1, true);
    global.APP_DEBUG = false;
    done();
  })
  it('getThinkRequirePath("Model")', function(){
    var path = getThinkRequirePath('Model');
    assert.equal(path.indexOf('lib/Lib/Core/Model.js') > -1, true);
  })
  it('getThinkRequirePath("notExistModule") with APP_DEBUG', function(){
    global.APP_DEBUG = true;
    var path = getThinkRequirePath('notExistModule');
    //console.log(path)
    assert.equal(path, '');
    global.APP_DEBUG = false;
  })
  it('getThinkRequirePath("notExistModule")', function(){
    var path = getThinkRequirePath('notExistModule');
    assert.equal(path, '');
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
  it('thinkRequire("/fasdf")', function(){
    var filePath = getThinkRequirePath('Controller');
    var controller = thinkRequire(filePath);
    assert.equal(isFunction(controller), true)
  })
  var list = [
    'Controller', 'App', 'Behavior', 'Cache', 'Db', 
    'Dispatcher', 'Filter', 'Http', 'Model', 
    'Session', 'Think', 'Valid', 'View', 'Cookie', 'WebSocket',
    'AdvModel', 'CheckResourceBehavior', 'CheckRouteBehavior',
    'DenyIpBehavior', 'LocateTemplateBehavior', 'ParseTemplateBehavior',
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

describe('aliasImport', function(){
  it('aliasImport string', function(){
    aliasImport('test', 'path/to/test');
    assert.equal(getThinkRequirePath('test'), 'path/to/test');
  })
  it('aliasImport obj', function(){
    aliasImport({test: 'path/to/test1'});
    assert.equal(getThinkRequirePath('test'), 'path/to/test1')
  })
})

describe('B', function(){
  it('B()', function(){
    assert.equal(B(), undefined)
  })
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
    assert.equal(host, '127.0.0.1');
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
    assert.equal(data.db_host, '127.0.0.1');
    assert.equal(data.db_type, 'mysql');
    assert.equal(data.port, 8360)
  })
  it('C(null)', function(){
    var data = C();
    C(null);
    assert.equal(C('db_host'), undefined)
    assert.equal(C('db_type'), undefined);
    assert.equal(C('port'), undefined)
    C(data);
    assert.equal(C('db_type'), 'mysql')
  })
})

describe('F', function(){
  it('F("not exist")', function(){
    var value = F('not exist');
    assert.equal(value, false)
  })
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
    F('welefen', 'suredy', DATA_PATH + '/xxx/other');
    var value = F('welefen', undefined, DATA_PATH + '/xxx/other');
    assert.equal(value, 'suredy')
  })
  it('F() file no content', function(){
    var filePath = path.normalize(__dirname + '/../App/Runtime/Data/a.json');
    mkdir(path.dirname(filePath));
    fs.writeFileSync(filePath, '');
    var value = F('a');
    assert.equal(value, false)
  })
})

describe('tag', function(){
  var http = thinkRequire('Http').getDefaultHttp('/index/index');
  http = thinkRequire('Http')(http.req, http.res).run();
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
  it('tag return value', function(done){
    C('tag.testtag', [function(){
      return 'testtag'
    }]);
    http.then(function(http){
      return tag('testtag', http)
    }).then(function(data){
      assert.equal(data, 'testtag');
      done();
    })
  })
})


describe('A', function(){
  var http = thinkRequire('Http').getDefaultHttp('/index/index');
  http = thinkRequire('Http')(http.req, http.res).run();

  it('A("home:index:test")', function(done){
    var filepath = path.normalize(__dirname + '/../App/Lib/Controller/Home/IndexController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({testAction: function(){return "welefen"}})')

    var ret = A('home:index:test', http);
    ret.then(function(value){
      assert.equal(value, 'welefen')
      done();
    })
  })
  it('A("home:test:test")', function(done){
    var filepath = path.normalize(__dirname + '/../App/Lib/Controller/Home/TestController.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Controller({testAction: function(){return "test:test"},otherAction: function(){return {"name":"welefen"}}})')
    
    var ret = A('home:test:test', http);
    ret.then(function(value){
      assert.equal(value, 'test:test')
      done();
    })
  })
  it('A("home:test:other")', function(done){
    var ret = A('home:test:other', http, 'welefen');
    ret.then(function(value){
      assert.deepEqual(value, {"name":"welefen"})
      done();
    })
  })
  it('A("home:test1:other")', function(done){
    var ret = A('home:test1:other', http, 'welefen');
    ret.catch(function(err){
      assert.equal(isError(err), true)
      done()
    })
  })
  it('A("home:test")', function(done){
    var ret = A('home:test', http, 'welefen');
    assert.equal(isFunction(ret.otherAction), true)
    done();
  })
})

describe('D', function(){
  it('D()', function(){
    var model = D();
    var Model = thinkRequire('Model');
    assert.equal(model instanceof Model, true)
  })
  it('D("User").hasFile = function', function(){
    var filepath = path.normalize(__dirname + '/../App/Lib/Model/UserModel.js');
    mkdir(path.dirname(filepath))
    fs.writeFileSync(filepath, 'module.exports = Model({testName: "welefen", hasFile: function(){return true;}})')
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
  it('D("User", "AdvModel")', function(){
    var model = D('User', 'AdvModel');
    assert.equal(isFunction(model.setRelation), false)
  })
  it('D("Xxx", "AdvModel")', function(){
    var model = D('Xxx', 'AdvModel');
    assert.equal(isFunction(model.setRelation), true)
  })
  it('D("Xxx/Bbbb")', function(){
    var model = D('Xxx/Bbbb');
    assert.equal(isFunction(model.setRelation), false)
  })
  it('D("Xxx/Bbbb", "AdvModel")', function(){
    var model = D('Xxx/Bbbb', 'AdvModel');
    assert.equal(isFunction(model.setRelation), true)
  })
  it('D("Xxx/Ccc")', function(){
    var filepath = path.normalize(__dirname + '/../App/Lib/Model/Xxx/CccModel.js');
    mkdir(path.dirname(filepath));
    fs.writeFileSync(filepath, 'module.exports = Model({testName: "welefen", hasFile: function(){return true;}})')
    var model = D('Xxx/Ccc', 'think_');
    assert.equal(model.name, 'XxxCcc');
    assert.equal(model.getTableName(), 'think_xxx_ccc');
    assert.equal(isFunction(model.hasFile), true)
    assert.equal(model.testName, 'welefen')
  })
})

describe('M', function(){
  it('M()', function(){
    var model = M();
    var Model = thinkRequire('Model');
    assert.equal(model instanceof Model, true)
  })
  it('M("User").hasFile = undefined', function(){
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
  it('M("User", "AdvModel")', function(){
    var model = M('User', 'AdvModel');
    assert.equal(isFunction(model.setRelation), true)
  })
  it('M("Xxx", "AdvModel")', function(){
    var model = M('Xxx', 'AdvModel');
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
    it('file cache, promise', function(done){
      S('wwwwwwwwfasdfasdw', function(){
        return 'welefen';
      }, -100).then(function(data){
        assert.equal(data, 'welefen');
        return S('wwwwwwwwfasdfasdw', null)
      }).then(function(){
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
    it('Node.js mem, cache function', function(done){
      S('name', 'welefen', true).then(function(){
        return S('name', function(){
          return 'welefen cache'
        });
      }).then(function(value){
        assert.equal(value, 'welefen');
        done();
      })
    })
    it('Node.js mem, cache function 1', function(done){
      S('name', 'welefen', true).then(function(){
        return S('name1', function(){
          return 'welefen cache'
        });
      }).then(function(value){
        assert.equal(value, 'welefen cache');
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



//删除缓存文件
//异步删除，不能在after里操作
describe('rm tmp files', function(){
  it('rm tmp files', function(done){
    rmdir(path.normalize(__dirname + '/../App')).then(done)
  })
})
