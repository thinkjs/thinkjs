# think-mongoose

[![npm](https://img.shields.io/npm/v/think-mongoose.svg?style=flat-square)]()
[![Travis](https://img.shields.io/travis/thinkjs/think-mongoose.svg?style=flat-square)]()
[![Coveralls](https://img.shields.io/coveralls/thinkjs/think-mongoose/master.svg?style=flat-square)]()
[![David](https://img.shields.io/david/thinkjs/think-mongoose.svg?style=flat-square)]()

Wrap mongoose for ThinkJS 3.x

## Install

```sh
npm install think-mongoose --save
```

## How to use

### Config extend

Change file `src/config/extend.js` (in multi module project, file is `src/common/config/extend.js`), add config:

```js
const mongoose = require('think-mongoose');

module.exports = [
  mongoose(think.app)
]
```

When add mongoose extend, it will add some below methods:

* `think.Mongoose` {Class} Base class(it's extends from mongoose model), model class must be extends this class.

  * `think.Mongoose.mongoose` mongoose object
  * `think.Mongoose.Schema` mongoose Schema class
  * `think.Mongoose.Mixed` mongoose Schema Mixed type
  * `think.Mongoose.ObjectId` mongoose Schema ObjectId type

* `think.mongoose` {Function} get mongoose instance
* `ctx.mongoose` {Function} get mongoose instance, it's wrapped from think.mongoose
* `controller.mongoose` {Function} get mongoose instance, it's wrapped from think.mongoose
* `service.mongoose` {Function} get mongoose instance, it's wrapped from think.mongoose

### Config adapter

Change file `src/config/adapter.js` (in multi module project, file is `src/common/config/adapter.js`), add config:

```js
exports.model = {
  type: 'mongoose',
  mongoose: {
    host: '127.0.0.1',
    user: '',
    password: '',
    database: 'test',
    useCollectionPlural: false,
    options: {}
  }
}
```

By default mongoose pluralizes the model name, if you don't want the default action, set `useCollectionPlural: false`.

or config connection string:

```js
exports.model = {
  type: 'mongoose',
  mongoose: {
    connectionString: 'mongodb://user:pass@localhost:port/database',
    options: {
      config: {
        autoIndex: false
      }
    }
  }
}
```

### Create model class

Create model class extends from `think.Mongoose`, like:

```js
// src/model/user.js

module.exports = class extends think.Mongoose {
  get schema() {
    return {
      name:    String,
      binary:  Buffer,
      living:  Boolean,
      updated: { type: Date, default: Date.now },
      age:     { type: Number, min: 18, max: 65 },
      mixed:   Schema.Types.Mixed,
      _someId: Schema.Types.ObjectId,
      array:      [],
      ofMixed:    [think.Mongoose.Mixed],
      ofObjectId: [think.Mongoose.ObjectId],
      ofArrays:   [[]],
      ofArrayOfNumbers: [[Number]],
      nested: {
        stuff: { type: String, lowercase: true, trim: true }
      }
    }
  }
}
```

Sometime, you want to add some methods to schema, then you can get schema instance by yourself and return instance:

```js
module.exports = class extends think.Mongoose {
  get schema() {
    const schema = new think.Mongoose.Schema({ name: String, type: String });
    schema.methods.findSimilarTypes = function(cb) {
      return this.model('think_Animal').find({ type: this.type }, cb); // model name `think_Animal` must have table prefix
    };
    return schema;
  }
}
```

### Get model instance

You can get mongoose class instance by `think.mongoose`, `ctx.mongoose`, `service.mongoose` or `controller.mongoose`.

```js
module.exports = class extends think.Controller {
  async indexAction() {
    const user = this.mongoose('user');
    const data = await user.find();
  }
}
```
If method is defined in schema, then you must be get class instance by yourself

```js
module.exports = class extends think.Controller {
  async indexAction() {
    const Cls = this.mongoose('user');
    const instance = new Cls();
    const data = await user.findSimilarTypes(); // findSimilarTypes method is defined in schema.methods.findSimilarTypes
  }
}
```


If default model adapter type is not `mongoose`, must be set second argument when get instance by `think.mongoose`, such as:

```js
module.exports = class extends think.Controller {
  async indexAction() {
    const user = this.mongoose('user', 'mongoose'); // use `mongoose` adapter type
    const data = await user.find();
  }
}
```

### CRUD

You can use all of mongoose model methods (except `new model & save`) to query or execute documents. Read documents <http://mongoosejs.com/docs/guide.html> get more information.
