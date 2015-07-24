'use strict';

var assert = require('assert');
var thinkit = require('thinkit');
var path = require('path');


for(var filepath in require.cache){
  delete require.cache[filepath];
}
var Index = require('../../../lib/index.js');
var instance = new Index();
instance.load();

think.APP_PATH = path.dirname(__dirname) + '/testApp';

var mongoSocket = think.adapter('socket', 'mongo');

describe('adapter/socket/mongo', function(){
  it('get instance', function(){
    var instance = new mongoSocket();
    assert.deepEqual(instance.config, {host: '127.0.0.1', port: 27017});
  })
  it('get connection', function(done){
    var npm = think.npm;
    think.npm = function(){
      return {
        MongoClient: {
          connect: function(url, config, callback){
            assert.equal(url, 'mongodb://127.0.0.1:27017/test');
            assert.deepEqual(config, { host: '127.0.0.1', port: 27017, name: 'test' });
            callback && callback(null);
          }
        }
      }
    }
    var instance = new mongoSocket({
      name: 'test'
    });
    instance.getConnection().then(function(connection){
      think.npm = npm;

      done();
    })
  })
  it('get connection, user', function(done){
    var npm = think.npm;
    think.npm = function(){
      return {
        MongoClient: {
          connect: function(url, config, callback){
            assert.equal(url, 'mongodb://welefen:suredy@127.0.0.1:27017/test');
            assert.deepEqual(config, { host: '127.0.0.1', port: 27017, user: 'welefen', pwd: 'suredy', name: 'test' });
            callback && callback(null);
          }
        }
      }
    }
    var instance = new mongoSocket({
      user: 'welefen',
      pwd: 'suredy',
      name: 'test'
    });
    instance.getConnection().then(function(connection){
      think.npm = npm;

      done();
    })
  })
  it('get connection, options', function(done){
    var npm = think.npm;
    think.npm = function(){
      return {
        MongoClient: {
          connect: function(url, config, callback){
            assert.equal(url, 'mongodb://welefen:suredy@127.0.0.1:27017/test?slaveOk=true');
            //assert.deepEqual(config, { host: '127.0.0.1', port: 27017, user: 'welefen', pwd: 'suredy', name: 'test' });
            callback && callback(null);
          }
        }
      }
    }
    var instance = new mongoSocket({
      user: 'welefen',
      pwd: 'suredy',
      name: 'test',
      options: {
        slaveOk: true
      }
    });
    instance.getConnection().then(function(connection){
      think.npm = npm;

      done();
    })
  })
  it('get connection, log level', function(done){
    var npm = think.npm;
    think.npm = function(){
      return {
        MongoClient: {
          connect: function(url, config, callback){
            assert.equal(url, 'mongodb://welefen:suredy@127.0.0.1:27017/test?slaveOk=true');
            callback && callback(null);
          }
        },
        Logger: {
          setLevel: function(level){
            assert.equal(level, 'welefen')
          }
        }
      }
    }
    var instance = new mongoSocket({
      user: 'welefen',
      pwd: 'suredy',
      name: 'test',
      log_level: 'welefen',
      options: {
        slaveOk: true
      }
    });
    instance.getConnection().then(function(connection){
      think.npm = npm;

      done();
    })
  })
  it('get connection, error', function(done){
    var npm = think.npm;
    var reject = think.reject;
    think.npm = function(){
      return {
        MongoClient: {
          connect: function(url, config, callback){
            assert.equal(url, 'mongodb://welefen:suredy@127.0.0.1:27017/test?slaveOk=true');
            callback && callback(new Error('welefen'));
          }
        }
      }
    };
    think.reject = function(err){
      return Promise.reject(err);
    };
    var instance = new mongoSocket({
      user: 'welefen',
      pwd: 'suredy',
      name: 'test',
      log_level: 'welefen',
      options: {
        slaveOk: true
      }
    });
    instance.getConnection().catch(function(err){
      assert.equal(err.message, 'welefen')
      think.npm = npm;
      think.reject = reject;
      done();
    })
  })
  it('get connection, error 2', function(done){
    var npm = think.npm;
    var reject = think.reject;
    think.npm = function(){
      return {
        MongoClient: {
          connect: function(url, config, callback){
            assert.equal(url, 'mongodb://welefen:suredy@127.0.0.1:27017/test?slaveOk=true');
            callback && callback(new Error('EADDRNOTAVAIL'));
          }
        }
      }
    };
    think.reject = function(err){
      return Promise.reject(err);
    };
    var instance = new mongoSocket({
      user: 'welefen',
      pwd: 'suredy',
      name: 'test',
      log_level: 'welefen',
      options: {
        slaveOk: true
      }
    });
    instance.getConnection().catch(function(err){
      assert.equal(err.message, 'Address not available, mongodb://welefen:suredy@127.0.0.1:27017. http://www.thinkjs.org/doc/error.html#EADDRNOTAVAIL')
      think.npm = npm;
      think.reject = reject;
      done();
    })
  })
  it('get connection, exist', function(done){
    var npm = think.npm;
    think.npm = function(){
      return {
        MongoClient: {
          connect: function(url, config, callback){
            assert.equal(url, 'mongodb://welefen:suredy@127.0.0.1:27017/test?slaveOk=true');
            callback && callback(null, {});
          }
        }
      }
    }
    var instance = new mongoSocket({
      user: 'welefen',
      pwd: 'suredy',
      name: 'test',
      options: {
        slaveOk: true
      }
    });
    instance.getConnection().then(function(connection){
      return instance.getConnection();
    }).then(function(connection){
      assert.deepEqual(connection, {})
      think.npm = npm;
      done();
    })
  })
  it('close, connection not exist', function(done){
    var instance = new mongoSocket({
      user: 'welefen',
      pwd: 'suredy',
      name: 'test',
      options: {
        slaveOk: true
      }
    });
    instance.close();
    done();
  })
  it('get connection, exist', function(done){
    var npm = think.npm;
    think.npm = function(){
      return {
        MongoClient: {
          connect: function(url, config, callback){
            assert.equal(url, 'mongodb://welefen:suredy@127.0.0.1:27017/test?slaveOk=true');
            callback && callback(null, {
              close: function(){

              }
            });
          }
        }
      }
    }
    var instance = new mongoSocket({
      user: 'welefen',
      pwd: 'suredy',
      name: 'test',
      options: {
        slaveOk: true
      }
    });
    instance.getConnection().then(function(connection){
      instance.close();
      think.npm = npm;
      done();
    })
  })
})