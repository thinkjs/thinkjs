import test from 'ava';
import thinkViewEjs from '../index.js';
import ejs from 'ejs';


test.beforeEach(t => {
  ejs.___renderFile = ejs.renderFile;
});


function callEjsView(file, viewData, config) {
  const instance = new thinkViewEjs(file, viewData, config);
  return Promise.resolve(instance.render());
}
test('ejs render with beforeRender', (t) => {
  const filename = '/file/path/../x.ejs';
  const tpl = '<%= name %>';
  const result = 'huangxiaolu';
  const viewData = {
    name: 'huangxiaolu'
  };
  const config = {
    beforeRender: function(ejs, conf) {
      
    }
  };
  function mockRenderFile() {
    ejs.renderFile = function(filename, data, config, cb) {
      const err = null;
      const str = result;
      cb(err, str);
    }
  }
  
  mockRenderFile();
  callEjsView(filename, viewData, config).then((str) => {
    t.is(str, result)
  });
});
test('ejs render without beforeRender', (t) => {
  const filename = '/file/path/../x.ejs';
  const tpl = '<%= name %>';
  const result = 'huangxiaolu';
  const viewData = {
    name: 'huangxiaolu'
  };
  const config = {};
  function mockRenderFile() {
    ejs.renderFile = function(filename, data, config, cb) {
      const err = null;
      const str = result;
      cb(err, str);
    }
  }
  
  mockRenderFile();
  callEjsView(filename, viewData, config).then((str) => {
    t.is(str, result)
  });
});
test('ejs render error', (t) => {
  const filename = '/file/path/../x.ejs';
  const tpl = '<%= name %>';
  const result = 'huangxiaolu';
  const viewData = {
    name: 'huangxiaolu'
  };
  const errmsg = "file not exist";
  const config = {};
  function mockRenderFile() {
    ejs.renderFile = function(filename, data, config, cb) {
      const err = errmsg;
      const str = result;
      cb(err, str);
    }
  }
  
  mockRenderFile();
  callEjsView(filename, viewData, config).then(str => {
   
  }).catch(err => {
    t.is(err, errmsg);
  });
});
test.afterEach.always(t => {
  ejs.renderFile = ejs.___renderFile;
});
