var assert = require('assert');

var _http = require('../_http.js');

function execMiddleware(middleware, mockHttp, returnHttp) {
  var req = think.extend({}, _http.req);
  var res = think.extend({}, _http.res);
  return think.http(req, res).then(function(http) {
    if (mockHttp) {
      mockHttp(http);
    }
    return returnHttp ? think.middleware(middleware, http).then(function() {
      return Promise.resolve(http);
    }) : think.middleware(middleware, http);
  });
}


describe('middleware/check_csrf', function() {
  before(function() {
    var Index = require('../../lib/index.js');
    var instance = new Index();
    instance.load();
  });
  // it('csrf off', function(done) {
  //   execMiddleware('check_csrf').then(function() {
  //     done();
  //   });
  // });
  it('csrf on', function(done) {
    think.config('csrf.on', true);
    var uuid = think.uuid;
    think.uuid = function() {
      return '12345678901234567890123456789000';
    };
    execMiddleware('check_csrf', null, true).then(function(http) {
      assert.equal(http.view().tVar[think.config('csrf.session_name')], '12345678901234567890123456789000');
      think.uuid = uuid;
      done();
    });
  });
  it('csrf on, check session', function(done) {
    think.config('csrf.on', true);
    execMiddleware('check_csrf', function(http) {
      think.session(http);
      http._session.get = function() {
        return '12345678901234567890123456789000';
      };
      http.post(think.config('csrf.form_name'), '12345678901234567890123456789000');
    }).then(function() {
      done();
    });
  });
  it('csrf on, ajax', function(done) {
    think.config('csrf.on', true);
    execMiddleware('check_csrf', function(http) {
      think.session(http);
      http._session.get = function() {
        return '12345678901234567890123456789000';
      };
      http.isGet = function() {
        return true;
      };
      http.isPost = function() {
        return false;
      };
      http.isAjax = function() {
        return true;
      };
      http.post(think.config('csrf.form_name'), '12345678901234567890123456789000');
    }).then(function() {
      done();
    });
  });
  it('csrf on, jsonp', function(done) {
    think.config('csrf.on', true);
    execMiddleware('check_csrf', function(http) {
      think.session(http);
      http._session.get = function() {
        return '12345678901234567890123456789000';
      };
      http.isGet = function() {
        return true;
      };
      http.isPost = function() {
        return false;
      };
      http.isJsonp = function() {
        return true;
      };
      http.post(think.config('csrf.form_name'), '12345678901234567890123456789000');
    }).then(function() {
      done();
    });
  });
  it('csrf on, session is empty', function(done) {
    think.config('csrf.on', true);
    think.config('csrf.errno', 400);
    think.config('csrf.errmsg', 'token error');
    execMiddleware('check_csrf', function(http) {
      think.session(http);
      http._session.get = function() {
        return '12345678901234567890123456789000';
      };
      http.isGet = function() {
        return false;
      };
      http.isPost = function() {
        return true;
      };
      http.fail = function(errno, errmsg) {
        assert.equal(errno, 400);
        assert.equal(errmsg, 'token error');
      };
    }).then(function() {
      done();
    });
  });
   it('csrf on, other method', function(done) {
    think.config('csrf.on', true);
    think.config('csrf.errno', 400);
    think.config('csrf.errmsg', 'token error');
    execMiddleware('check_csrf', function(http) {
      think.session(http);
      http._session.get = function() {
        return '12345678901234567890123456789000';
      };
      http.isGet = function() {
        return false;
      };
      http.isPost = function() {
        return false;
      };
      http.fail = function(errno, errmsg) {
        assert.equal(errno, 400);
        assert.equal(errmsg, 'token error');
      };
    }).then(function() {
      done();
    });
  });
  after(function() {
    think.config('csrf.on', false);
  });
});