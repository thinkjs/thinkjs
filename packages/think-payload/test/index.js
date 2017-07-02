const path = require('path');
const test = require('ava');
const request = require('supertest');
const payload = require('../index.js');
const Koa = require('koa');
const app = new Koa();
app.use(payload({
  extendTypes: {
    json: ['application/json-patch+json']
  }
}));
app.use((ctx) => {
  ctx.body = ctx.request.body;
});

test.cb('should skip middleware', t => {
  request(app.callback())
  .post('/')
  .set('Content-Type', 'text/plain')
  .expect(200)
  .end((err, res) => {
    if (err) throw err;
    t.is(res.text, '');
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
    t.is(res.body.post.name, 'Berwin');
    t.end();
  });
});

test.cb('should support extend types requests', t => {
  request(app.callback())
  .post('/')
  .set('Content-Type', 'application/json-patch+json')
  .send({name: 'Berwin'})
  .expect('Content-Type', /json/)
  .expect(200)
  .end((err, res) => {
    if (err) throw err;
    t.is(res.body.post.name, 'Berwin');
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
    t.is(res.body.post.name, 'Berwin');
    t.end();
  });
});

test.cb('should be able to receive text type requests', t => {
  request(app.callback())
  .post('/')
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

test.cb('should be able to receive multi file', t => {
  request(app.callback())
  .post('/')
  .attach('a', path.join(__dirname, '../index.js'))
  .attach('b', path.join(__dirname, '../package.json'))
  .expect(200)
  .end((err, res) => {
    if (err) throw err;
    t.is(res.body.file.a.type, 'application/javascript');
    t.is(res.body.file.b.type, 'application/json');
    t.end();
  });
});

test.cb('should be able to receive both file and text', t => {
  request(app.callback())
  .post('/')
  .attach('xxfile', path.join(__dirname, '../index.js'))
  .field('text', 'test text')
  .expect(200)
  .end((err, res) => {
    if (err) throw err;
    t.is(res.body.post.text, 'test text');
    t.is(res.body.file.xxfile.name, 'index.js');
    t.is(res.body.file.xxfile.type, 'application/javascript');
    t.end();
  });
});

test.cb('should be able to receive xml type requests', t => {
  request(app.callback())
  .post('/')
  .set('Content-Type', 'text/xml')
  .send("<root>Hello Berwin!</root>")
  .expect(200)
  .end((err, res) => {
    if (err) throw err;
    t.is(res.body.post.root, 'Hello Berwin!');
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