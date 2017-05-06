const path = require('path');
const http = require('http');
const test = require('ava');
const request = require('supertest');
const payload = require('../index.js');
const Koa = require('koa');
const app = new Koa();
app.use(payload());
app.use((ctx) => {
  ctx.body = ctx.request.body;
});

test.cb('should skip middleware', t => {
  request(app.callback())
  .get('/')
  .set('Content-Type', 'text/plain')
  .expect(200)
  .end((err, res) => {
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
  .end((err, res) => {
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
  .end((err, res) => {
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
  .end((err, res) => {
    if (err) throw err;
    t.is(res.text, 'Berwin')
    t.end();
  });
});

test.cb('should be able to receive multipart type requests', t => {
  request(app.callback())
  .post('/')
  .attach('xxfile', path.join(__dirname, '../index.js'))
  .expect(200)
  .end((err, res) => {
    if (err) throw err;
    t.is(res.body.file.xxfile.name, 'index.js');
    t.is(res.body.file.xxfile.type, 'application/javascript');
    t.end();
  });
});

test.cb('should be able to receive xml type requests', t => {
  request(app.callback())
  .post('/')
  .set('Content-Type', 'text/xml')
  .send("<parent parent_property='bar'><child child_property='foo'></child></parent>")
  .expect(200)
  .end((err, res) => {
    if (err) throw err;
    t.is(res.body.parent.parent_property, 'bar');
    t.is(res.body.parent.child.child_property, 'foo');
    t.end();
  });
});

test.cb('should throw error', t => {
  const app2 = new Koa();

  app2.onerror = (err) => {
    t.is(err.message, 'test throw error');
  };

  app2.use(payload());
  app2.use((ctx) => {
    throw new Error('test throw error');
  });

  request(app2.callback())
  .post('/')
  .expect(500)
  .end((err, res) => {
    if (err) throw err;
    t.end();
  });
});