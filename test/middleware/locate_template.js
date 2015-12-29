var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var _http = require('../_http.js');

function execMiddleware(middleware, config, options, data){
  think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';
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


describe('middleware/locate_template', function(){
  before(function(){
    var Index = require('../../lib/index.js');
    var instance = new Index();
    instance.load();
  })
  it('mode_normal, file_depr: /', function(done){
    think.mode = think.mode_normal;
    execMiddleware('locate_template', {
      view: {
        file_depr: '/',
        file_ext: '.html'
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }).then(function(data){
      assert.equal(data, think.APP_PATH + think.sep + 'view' + think.sep + 'group' + think.sep + 'detail.html');
      done();
    }).catch(function(err){
      console.log(err.stack)
    })
  })
  it('mode_normal, file_ext: .txt', function(done){
    think.mode = think.mode_normal;
    execMiddleware('locate_template', {
      view: {
        file_depr: '/',
        file_ext: '.txt'
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }).then(function(data){
      assert.equal(data, think.APP_PATH + think.sep + 'view' + think.sep + 'group' + think.sep + 'detail.txt');
      done();
    })
  })
  it('mode_normal', function(done){
    think.mode = think.mode_normal;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.html'
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }).then(function(data){
      assert.equal(data, think.APP_PATH + think.sep + 'view' + think.sep + 'group_detail.html');
      done();
    })
  })
  it('mode_normal 2', function(done){
    think.mode = think.mode_normal;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.html'
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }).then(function(data){
      assert.equal(data, think.APP_PATH + think.sep + 'view' + think.sep + 'group_detail.html');
      done();
    })
  })
  it('mode_module', function(done){
    think.mode = think.mode_module;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.html'
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }).then(function(data){
      assert.equal(data, think.APP_PATH + think.sep + 'home' + think.sep + 'view' + think.sep + 'group_detail.html');
      done();
    })
  })
  it('mode_module, with theme', function(done){
    think.mode = think.mode_module;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.html',
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _theme: 'color'
    }).then(function(data){
      assert.equal(data, think.APP_PATH + think.sep + 'color' + think.sep + 'home' + think.sep + 'view' + think.sep + 'group_detail.html');
      done();
    })
  })
  it('mode_module, with theme, has templateFile', function(done){
    think.mode = think.mode_module;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.html',
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _theme: 'color'
    }, __filename).then(function(data){
      assert.equal(data, __filename);
      done();
    })
  })
  it('mode_module, with theme, has templateFile 2', function(done){
    think.mode = think.mode_module;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.html',
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _theme: 'color'
    }, {
      templateFile: __filename
    }).then(function(data){
      assert.equal(data, __filename);
      done();
    })
  })
  it('mode normal, with lang', function(done){
    think.mode = think.mode_normal;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.html',
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      //_theme: 'color',
      _langAsViewPath: true,
      lang: function(){
        return 'zh-CN'
      }
    }).then(function(data){
      assert.equal(data, think.APP_PATH + think.sep + 'zh-CN' + think.sep + 'view'  + think.sep + 'group_detail.html');
      done();
    })
  })
  it('mode normal, with theme', function(done){
    think.mode = think.mode_normal;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.html',
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _theme: 'color'
    }).then(function(data){
      assert.equal(data, think.APP_PATH + think.sep + 'color' + think.sep + 'view' + think.sep + 'group_detail.html');
      done();
    })
  })
  it('mode_normal, with theme', function(done){
    think.mode = think.mode_normal;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.html',
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail',
      _theme: 'color'
    }).then(function(data){
      assert.equal(data, think.APP_PATH + think.sep + 'color' + think.sep + 'view' + think.sep + 'group_detail.html');
      done();
    })
  })
  it('mode normal, with rootPath', function(done){
    think.mode = think.mode_normal;
    var rootPath = __dirname + think.sep + 'rootPath';
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.txt',
        root_path: rootPath
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }).then(function(data){
      assert.equal(data, rootPath + think.sep + 'group_detail.txt');
      done();
    })
  })
  it('mode normal, with rootPath 2', function(done){
    think.mode = think.mode_normal;
    var rootPath = __dirname + think.sep + 'rootPath';
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.txt',
        root_path: rootPath
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }).then(function(data){
      assert.equal(data, rootPath + think.sep  + 'group_detail.txt');
      done();
    })
  })
  it('mode module, with rootPath', function(done){
    think.mode = think.mode_module;
    var rootPath = __dirname + think.sep + 'rootPath';
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.txt',
        root_path: rootPath
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }).then(function(data){
      assert.equal(data, rootPath + think.sep + 'home' + think.sep + 'group_detail.txt');
      done();
    })
  })
  it('mode module, xxx', function(done){
    think.mode = think.mode_module;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.txt',
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }, 'xxx').then(function(data){
      assert.equal(data, think.APP_PATH + think.sep + 'home' + think.sep + 'view' + think.sep + 'group_xxx.txt');
      done();
    })
  })
  it('mode module, xxx/yyy', function(done){
    think.mode = think.mode_module;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.txt',
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }, 'xxx/yyy').then(function(data){
      assert.equal(data, think.APP_PATH + think.sep + 'home' + think.sep + 'view' + think.sep + 'xxx_yyy.txt');
      done();
    })
  })
  it('mode module, xxx/yyy/zzz', function(done){
    think.mode = think.mode_module;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.txt',
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }, 'xxx/yyy/zzz').then(function(data){
      assert.equal(data, think.APP_PATH + think.sep + 'home'  + think.sep + 'view' +think.sep + 'xxx' + think.sep + 'yyy_zzz.txt');
      done();
    })
  })
  it('mode module, xxx/yyy/zzz.hhh', function(done){
    think.mode = think.mode_module;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.txt',
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }, 'xxx/yyy/zzz.hhh').then(function(data){
      assert.equal(data, think.APP_PATH + think.sep  + 'home'  + think.sep + 'view'+ think.sep + 'xxx' + think.sep + 'yyy_zzz.hhh');
      done();
    })
  })
  it('mode module, xxx:yyy:zzz.hhh', function(done){
    think.mode = think.mode_module;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.txt',
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }, 'xxx:yyy:zzz.hhh').then(function(data){
      assert.equal(data, think.APP_PATH + think.sep + 'home'  + think.sep + 'view' + think.sep + 'xxx'  + think.sep + 'yyy_zzz.hhh');
      done();
    })
  })
  it('mode module, absolute file path', function(done){
    think.mode = think.mode_module;
    execMiddleware('locate_template', {
      view: {
        file_depr: '_',
        file_ext: '.txt',
      }
    }, {
      module: 'home',
      controller: 'group',
      action: 'detail'
    }, '/xxx/yyy/zzz.hhh').then(function(data){
      assert.equal(data, '/xxx/yyy/zzz.hhh');
      done();
    })
  })
})