const path = require('path');
const {default: test} = require('ava');
const request = require('supertest');
const payload = require('../index.js');
const Koa = require('koa');
const app = new Koa();
app.use(payload({
  extendTypes: {
    json: ['application/json-patch+json']
  },
  explicitArray: false,
  uploadDir: path.join(__dirname, '../tmpdir')
}));
app.use((ctx) => {
  ctx.body = ctx.request.body;
});

test('should skip middleware', async t => {
  const testPromise = new Promise((resolve, reject) => {
    request(app.callback())
      .post('/')
      .set('Content-Type', 'text/plain')
      .expect(200)
      .end((err, res) => {
        err ? reject(err) : resolve(res);
      });
  });

  const res = await testPromise;
  t.is(res.text, '');
});

test('should be able to receive json type requests', async t => {
  const testPromise = new Promise((resolve, reject) => {
    request(app.callback())
      .post('/')
      .set('Content-Type', 'application/json')
      .send({name: 'Berwin'})
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        err ? reject(err) : resolve(res);
      });
  });

  const res = await testPromise;
  t.is(res.body.post.name, 'Berwin');
});


test('should be thrown 400 errors, Because the parameter format is not json', async t => {
  const testPromise = new Promise((resolve, reject) => {
    request(app.callback())
      .post('/')
      .set('Content-Type', 'application/json')
      .send('Berwin')
      .expect(400)
      .end((err, res) => {
        err ? reject(err) : resolve(res);
      });
  });

  const res = await testPromise;
  t.is(res.text, 'Incorrect parameter format');
});

test('should support extend types requests', async t => {
  const testPromise = new Promise((resolve, reject) => {

    request(app.callback())
      .post('/')

      .set('Content-Type', 'application/json-patch+json')
      .send({name: 'Berwin'})
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        err ? reject(err) : resolve(res);
      });
    });

  const res = await testPromise;
  t.is(res.body.post.name, 'Berwin');
});

test('should be able to receive form type requests', async t => {
  const testPromise = new Promise((resolve, reject) => {
    request(app.callback())
      .post('/')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({name: 'Berwin'})
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        err ? reject(err) : resolve(res);
      });
    });

  const res = await testPromise;
  t.is(res.body.post.name, 'Berwin');
});

test('should be able to receive text type requests', async t => {
  const testPromise = new Promise((resolve, reject) => {
    request(app.callback())
      .post('/')
      .set('Content-Type', 'text/plain')
      .send('Berwin')
      .expect(200)
      .end((err, res) => {
        err ? reject(err) : resolve(res);
      });
  });

  const res = await testPromise;
  t.is(res.text, 'Berwin');
});

test('should be able to receive multipart type requests', async t => {
  const testPromise = new Promise((resolve, reject) => {
    request(app.callback())
      .post('/')
    .attach('xxfile', path.join(__dirname, '../index.js'))
    .expect(200)
    .end((err, res) => {
      err ? reject(err) : resolve(res);
    });
  });
  
  const res = await testPromise;
  t.truthy(res.body.file.xxfile.path.indexOf(path.join(__dirname, '../tmpdir')) !== -1);
  t.is(res.body.file.xxfile.name, 'index.js');
  t.is(res.body.file.xxfile.type, 'application/javascript');
});

test('should be able to receive multi file', async t => {
  const testPromise = new Promise((resolve, reject) => {
    request(app.callback())
    .post('/')
    .attach('a', path.join(__dirname, '../index.js'))
    .attach('b', path.join(__dirname, '../package.json'))
    .expect(200)
    .end((err, res) => {
      err ? reject(err) : resolve(res);
    });
  });

  const res = await testPromise;
  t.is(res.body.file.a.type, 'application/javascript');
  t.is(res.body.file.b.type, 'application/json');
});

test('should be able to receive both file and text', async t => {
  const testPromise = new Promise((resolve, reject) => {
    request(app.callback())
    .post('/')
    .attach('xxfile', path.join(__dirname, '../index.js'))
    .field('text', 'test text')
    .expect(200)
    .end((err, res) => {
      err ? reject(err) : resolve(res);
    });
  });
  
  const res = await testPromise;
  t.is(res.body.post.text, 'test text');
  t.is(res.body.file.xxfile.name, 'index.js');
  t.is(res.body.file.xxfile.type, 'application/javascript');
});

test('should be able to receive xml type requests', async t => {
  const testPromise = new Promise((resolve, reject) => {
    request(app.callback())
    .post('/')
    .set('Content-Type', 'text/xml')
    .send("<root>Hello Berwin!</root>")
    .expect(200)
    .end((err, res) => {
      err ? reject(err) : resolve(res);
    });
  });
  
  const res = await testPromise;
  t.is(res.body.post.root, 'Hello Berwin!');
});

test('xml support parameters', async t => {
  const testPromise = new Promise((resolve, reject) => {
    request(app.callback())
    .post('/')
    .set('Content-Type', 'text/xml')
    .send("<root><name>Hello Berwin!</name></root>")
    .expect(200)
    .end((err, res) => {
      err ? reject(err) : resolve(res);
    });
  });

  const res = await testPromise;
  t.is(res.body.post.root.name, 'Hello Berwin!');
});

test('should throw error', async t => {
  const testPromise = new Promise((resolve, reject) => {

    const app2 = new Koa();

    app2.onerror = (err) => {
      reject(err);
    };

    app2.use(payload());
    app2.use((ctx) => {
      throw new Error('test throw error');
    });

    request(app2.callback())
    .post('/')
    .expect(500)
    .end((err, res) => {
      err ? reject(err) : resolve(res);
    });
  });

  try {
    await testPromise;
  } catch(e) {
    t.is(e.message, 'test throw error');
  }
});