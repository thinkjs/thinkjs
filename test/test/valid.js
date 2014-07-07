var should = require('should');
var assert = require('assert');
var muk = require('muk');
process.argv[2] = '/'; //命中命令行模式
require('../www/index.js');

var Valid = thinkRequire('Valid');

describe('Valid', function(){
  it('Valid is function', function(){
    assert.equal(isFunction(Valid), true);
  })
  it('Valid required', function(){
    var data = {
      name: 'welefen',
      value: 'www',
      valid: 'required'
    }
    var ret = Valid(data);
    assert.equal(isEmpty(ret), true)
  })
  it('Valid required 1', function(){
    var data = {
      name: 'welefen',
      value: '',
      valid: 'required'
    }
    var ret = Valid(data);
    assert.equal(JSON.stringify(ret), '{"welefen":""}')
  })
  it('Valid required 2', function(){
    var data = {
      name: 'welefen',
      value: '',
      valid: 'required',
      msg: "required"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'required')
  })
  it('Valid required 3', function(){
    var data = {
      name: 'welefen',
      value: '',
      valid: 'required',
      msg: "required {name}"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'required welefen')
  })
  it('Valid required 4', function(){
    var data = {
      name: 'welefen',
      value: '',
      valid: 'required',
      msg: "required {name} {value}w"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'required welefen w')
  })

  it('Valid length', function(){
    var data = {
      name: 'welefen',
      value: '11',
      valid: 'length',
      length_args: 11,
      msg: "length min {value}"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'length min 11')
  })
  it('Valid length 1', function(){
    var data = {
      name: 'welefen',
      value: '11333',
      valid: 'length',
      length_args: [1, 3],
      msg: "length 1-3"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'length 1-3')
  })
  it('Valid length 2', function(){
    var data = {
      name: 'welefen',
      value: '22',
      valid: 'length',
      length_args: [1, 3],
      msg: "length 1-3"
    }
    var ret = Valid(data);
    assert.equal(isEmpty(ret), true)
  })
  it('Valid length 3', function(){
    var data = {
      name: 'welefen',
      value: '22',
      valid: 'length',
      msg: "length 1-3"
    }
    var ret = Valid(data);
    assert.equal(isEmpty(ret), true)
  })
  it('Valid email', function(){
    var data = {
      name: 'welefen',
      value: 'welefen@gmail.com',
      valid: 'email',
      msg: "email is not valid"
    }
    var ret = Valid(data);
    assert.equal(isEmpty(ret), true)
  })
  it('Valid email 1', function(){
    var data = {
      name: 'welefen',
      value: 'welefen@163.com',
      valid: 'email',
      msg: "email is not valid"
    }
    var ret = Valid(data);
    assert.equal(isEmpty(ret), true)
  })
  it('Valid email 2', function(){
    var data = {
      name: 'welefen',
      value: 'welefen@163',
      valid: 'email',
      msg: "email is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'email is not valid')
  })
  it('Valid email 3', function(){
    var data = {
      name: 'welefen',
      value: 'welefen@163',
      valid: 'email',
      msg: "email `{value}` is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'email `welefen@163` is not valid')
  })

  it('Valid time ', function(){
    var data = {
      name: 'welefen',
      value: '1404485778788',
      valid: 'time',
      msg: "time is not valid"
    }
    var ret = Valid(data);
    assert.equal(isEmpty(ret), true)
  })
  it('Valid time 1', function(){
    var data = {
      name: 'welefen',
      value: '140448577878',
      valid: 'time',
      msg: "time is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'time is not valid')
  })

  it('Valid cnname', function(){
    var data = {
      name: 'welefen',
      value: '...',
      valid: 'cnname',
      msg: "cnname is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'cnname is not valid')
  })
  it('Valid cnname', function(){
    var data = {
      name: 'welefen',
      value: '李成银',
      valid: 'cnname',
      msg: "cnname is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
  it('Valid cnname', function(){
    var data = {
      name: 'welefen',
      value: '李成银a',
      valid: 'cnname',
      msg: "cnname is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'cnname is not valid')
  })

  it('Valid idnumber', function(){
    var data = {
      name: 'welefen',
      value: 'werwer',
      valid: 'idnumber',
      msg: "idnumber is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'idnumber is not valid')
  })
  it('Valid idnumber', function(){
    var data = {
      name: 'welefen',
      value: '110101199601014212',
      valid: 'idnumber',
      msg: "idnumber is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
  it('Valid idnumber 15', function(){
    var data = {
      name: 'welefen',
      value: '110101199601014',
      valid: 'idnumber',
      msg: "idnumber is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })


  it('Valid mobile', function(){
    var data = {
      name: 'welefen',
      value: '15811300240',
      valid: 'mobile',
      msg: "mobile is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
  it('Valid mobile', function(){
    var data = {
      name: 'welefen',
      value: 'sadfas',
      valid: 'mobile',
      msg: "mobile is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'mobile is not valid')
  })
  it('Valid zipcode', function(){
    var data = {
      name: 'welefen',
      value: 'sadfas',
      valid: 'zipcode',
      msg: "zipcode is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'zipcode is not valid')
  })

  it('Valid zipcode', function(){
    var data = {
      name: 'welefen',
      value: '859711',
      valid: 'zipcode',
      msg: "zipcode is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
  it('Valid confirm', function(){
    var data = {
      name: 'welefen',
      value: '859711',
      valid: 'confirm',
      confirm_args: ['859711'],
      msg: "confirm is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
  it('Valid confirm', function(){
    var data = {
      name: 'welefen',
      value: '859711',
      valid: 'confirm',
      confirm_args: ['85971221'],
      msg: "confirm is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'confirm is not valid')
  })
  it('Valid url', function(){
    var data = {
      name: 'welefen',
      value: '859711',
      valid: 'url',
      msg: "url is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'url is not valid')
  })
  it('Valid url', function(){
    var data = {
      name: 'welefen',
      value: 'http://www.baidu.com',
      valid: 'url',
      msg: "url is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
  it('Valid int', function(){
    var data = {
      name: 'welefen',
      value: '123123',
      valid: 'int',
      msg: "int is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
  it('Valid int', function(){
    var data = {
      name: 'welefen',
      value: '13W',
      valid: 'int',
      msg: "int is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'int is not valid')
  })
  it('Valid int', function(){
    var data = {
      name: 'welefen',
      value: 'WWW',
      valid: 'int',
      msg: "int is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'int is not valid')
  })


  it('Valid float', function(){
    var data = {
      name: 'welefen',
      value: '13W',
      valid: 'float',
      msg: "float is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'float is not valid')
  })
  it('Valid float', function(){
    var data = {
      name: 'welefen',
      value: '234234',
      valid: 'float',
      msg: "float is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
  it('Valid range', function(){
    var data = {
      name: 'welefen',
      value: 123,
      valid: 'range',
      range_args: 10,
      msg: "range is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
  it('Valid range', function(){
    var data = {
      name: 'welefen',
      value: 123,
      valid: 'range',
      range_args: 1220,
      msg: "range is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'range is not valid')
  })
  it('Valid range', function(){
    var data = {
      name: 'welefen',
      value: 2222,
      valid: 'range',
      range_args: [1220, 3330],
      msg: "range is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
  it('Valid range', function(){
    var data = {
      name: 'welefen',
      value: 22202,
      valid: 'range',
      range_args: [1220, 3330],
      msg: "range is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'range is not valid')
  })
  it('Valid ip4', function(){
    var data = {
      name: 'welefen',
      value: '192.168.1.1333',
      valid: 'ip4',
      msg: "ip4 is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'ip4 is not valid')
  })
  it('Valid ip4', function(){
    var data = {
      name: 'welefen',
      value: '192.168.1.133',
      valid: 'ip4',
      msg: "ip4 is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
    it('Valid ip6', function(){
    var data = {
      name: 'welefen',
      value: '192.168.1.13323dd',
      valid: 'ip6',
      msg: "ip6 is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'ip6 is not valid')
  })
  it('Valid ip', function(){
    var data = {
      name: 'welefen',
      value: '192.168.1.133',
      valid: 'ip',
      msg: "ip is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
  it('Valid date', function(){
    var data = {
      name: 'welefen',
      value: '1986-12-11',
      valid: 'date',
      msg: "date is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
  it('Valid date', function(){
    var data = {
      name: 'welefen',
      value: '1986-132-11',
      valid: 'date',
      msg: "date is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'date is not valid')
  })
  it('Valid in', function(){
    var data = {
      name: 'welefen',
      value: 111,
      valid: 'in',
      in_args: [[1,2]],
      msg: "in is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'in is not valid')
  })
  it('Valid function', function(){
    var data = {
      name: 'welefen',
      value: 111,
      valid: function(){
        return true;
      },
      in_args: [[1,2]],
      msg: "in is not valid"
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, undefined)
  })
  it('Valid function', function(){
    var data = {
      name: 'welefen',
      value: 111,
      valid: function(){
        return 'data is not valid';
      }
    }
    var ret = Valid(data);
    assert.equal(ret.welefen, 'data is not valid')
  })
  it('Valid empty data', function(){
    var ret = Valid();
    assert.equal(ret, true)
  })
  it('Valid error type', function(){
    var data = {
      name: 'welefen',
      value: 111,
      valid: 'xxxx'
    }
    try{
      var ret = Valid(data);
      assert.equal(1, 2);
    }catch(e){
      assert.equal(e.message, 'xxxx is not valid')
    }
  })
  it('Valid function', function(){
    var data = [{
      name: 'welefen',
      value: 111,
      valid: function(){
        return 'data is not valid';
      }
    },{
      name: 'suredy',
      value: 111,
      valid: function(){
        return 'data is not valid';
      }
    }]
    var ret = Valid(data);
    //console.log(JSON.stringify(ret));
    assert.equal(JSON.stringify(ret), '{"welefen":"data is not valid","suredy":"data is not valid"}')
  })
  it('Valid mix', function(){
    var data = [{
      name: 'welefen',
      value: '',
      valid: ['required', 'length'],
      msg: 'required'
    },{
      name: 'suredy',
      value: 'w',
      valid: ['required', 'length'],
      length_args: [2, 10],
      msg: 'length is 2-10'
    }];
    var ret = Valid(data);
    //console.log(JSON.stringify(ret));
    assert.deepEqual(ret, {"welefen":"required","suredy":"length is 2-10"});
  })
  it('Valid mix 1', function(){
    var data = [{
      name: 'welefen',
      value: '',
      valid: ['required', 'length'],
      msg: 'required'
    },{
      name: 'suredy',
      valid: ['required', 'length'],
      length_args: [2, 10],
      msg: 'length is 2-10'
    }];
    var ret = Valid(data);
    //console.log(JSON.stringify(ret));
    assert.deepEqual(ret, {"welefen":"required","suredy":"length is 2-10"});
  })


})