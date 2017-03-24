const fs = require('fs');
const test = require('ava');
const Trace = require('../lib');

const filename = `${__dirname}/test.html`;

test.before('500', () => {
  try {
    fs.statSync(filename);
    fs.unlinkSync(filename);
  } catch(e) {

  } finally {
    fs.writeFileSync(filename, '{{errMsg}}{{error}}', {encoding: 'utf-8'});
  }  
});

test('500', async t => {
  t.plan(2);

  let ctx = {
    res: {
      statusCode: 200
    },
    throw(statusCode, msg) {
      let err = new Error(msg);
      err.status = statusCode;
      throw err;
    }
  };
  let next = (instance) => {
    throw new Error('normal trace test');
  };

  try {
    await Trace({
      err500Template: filename
    })(ctx, next);
  } catch(e) {
    
  }
  let result = ctx.body;
  t.true(result.includes('normal trace test'));

  try {
    await Trace({
      debug: false,
      err500Template: filename
    })(ctx, next);
  } catch(e) {

  }

  t.is(ctx.body, '[]');
});

test.after('500', () => fs.unlinkSync(filename));


test('500 not exist file', async t => {

  let ctx = {
    res: {
      statusCode: 200
    }
  };
  let next = (instance) => {
    throw new Error('normal trace test');
  };

  try {
    await Trace({
      err404Template: __dirname + 'notexist.html',
      err500Template: __dirname + 'notexist.html'
    })(ctx, next);
  } catch(e) {
    
  }
  let result = ctx.body;
  t.true(result.includes('thinkjs'));
});