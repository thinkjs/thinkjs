const http = require('http');
const test = require('ava');
const request = require('supertest');
const payload = require('../index.js');
const Koa = require('koa');
const app = new Koa();
app.use(payload());
app.use(function (ctx) {
  ctx.body = ctx.request.body;
});

test.cb('should skip middleware', t => {
  request(app.callback())
  .get('/')
  .set('Content-Type', 'text/plain')
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
    t.is(res.text, '{}');
    t.end();
  });
});

test.cb('should be able to receive json type requests', t => {
  request(app.callback())
  .post('/')
  .set('Content-Type', 'application/json')
  .send({name: 'Berwin'})
  .expect('Content-Type', /json/)
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
    t.is(res.body.name, 'Berwin');
    t.end();
  });
});

test.cb('should be able to receive form type requests', t => {
  request(app.callback())
  .post('/')
  .set('Content-Type', 'application/x-www-form-urlencoded')
  .send({name: 'Berwin'})
  .expect('Content-Type', /json/)
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
    t.is(res.body.name, 'Berwin');
    t.end();
  });
});

test.cb('should be able to receive text type requests', t => {
  request(app.callback())
  .get('/')
  .set('Content-Type', 'text/plain')
  .send('Berwin')
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
    t.is(res.text, 'Berwin')
    t.end();
  });
});