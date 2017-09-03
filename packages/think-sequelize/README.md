# think-sequelize

[![npm](https://img.shields.io/npm/v/think-sequelize.svg?style=flat-square)]()
[![Travis](https://img.shields.io/travis/thinkjs/think-sequelize.svg?style=flat-square)]()
[![Coveralls](https://img.shields.io/coveralls/thinkjs/think-sequelize/master.svg?style=flat-square)]()

Wrap sequelize for ThinkJS 3.x

Sequelize is a promise-based ORM for Node.js v4 and up. It supports the dialects PostgreSQL, MySQL, SQLite and MSSQL and features solid transaction support, relations, read replication and more.

## Install

```sh
npm install think-sequelize --save
```

## How to Use

### Config Extend

Change file `src/config/extend.js` (in multi module project, file is `src/common/config/extend.js`), add config:

```js
const sequelize = require('think-sequelize');

module.exports = [
  sequelize(think.app)
]
```

When add sequelize extend, it will add methods below:

* `think.Sequel` {Class} Base class(it's extends from sequelize model), model class should extends this class.

  * `think.Sequel.Sequel` sequelize object (equal require('sequelize'))
  * `think.Sequel.Relation` sequelize relation type

* `think.sequel` {Function} get sequel instance
* `ctx.sequel` {Function} get sequel instance
* `controller.sequel` {Function} get sequel instance
* `service.sequel` {Function} get sequel instance

### Config Adapter

Change file `src/config/adapter.js` (in multi module project, file is `src/common/config/adapter.js`), add config:

```js
exports.model = {
  type: 'sequel',
  sequel: {
    prefix: 'think_',
    logConnect: false,
    database: 'think-demo',
    user: 'root',
    password: 'root',
    options: {
      host: '127.0.0.1',
      dialect: 'mysql',
      logging: false
    },
    schema: {
      timestamps: false
    }
  },
}
```

or config connectionString:

```js
exports.model = {
  type: 'sequel',
  sequel: {
    connectionString: 'mysql://root:root@127.0.0.1/think-demo',
    prefix: 'think_',
    logConnect: false,
    options: {
      logging: false
    },
    schema: {
      timestamps: false
    }
  }
}
```

### Create Model Class

Create model class extends from `think.Sequel`:

```js
// src/model/player.js
module.exports = class extends think.Sequel {
  get schema() {
    return {
      attributes: {
        id: {
          type: think.Sequel.Sequel.BIGINT,
          primaryKey: true
        },
        teamId: think.Sequel.Sequel.BIGINT,
        name: think.Sequel.Sequel.STRING(255),
      },
      options: { // will merge with schema config of sequel in src/config/adapter.js
        timestamps: false,
        freezeTableName: true,
        tableName: 'think_player',
      }
    }
  }
}
```

// schema's attributes and options will be passed to sequelize's define method
```js
sequelize.define('name', {attributes}, {options})
```

The schema's `options` will merge with `schema` in `src/config/adapter.js`.

If you want every model's `timestamps: false`, you can write in sequel's `schema` config of `src/config/adapter.js`.

And you can rewrite common schema config in every model's schema.


### Get Model Instance

You can get sequel class instance by `think.sequel`, `ctx.sequel`, `service.sequel` or `controller.sequel`.

```js
module.exports = class extends think.Controller {
  async indexAction() {
    const player = this.sequel('player');
    const data = await player.findAll();
  }
}
```

If default model adapter type is not `sequel`, the second argument must be set, such as:

```js
// in src/config/adapter.js (in multi module project, file is `src/common/config/adapter.js`)
exports.model = {
  type: 'mysql',
  common: {
    // ...
  },
  sequel: {
    // ...
  },
  mysql: {
    // ...
  }
}
```

With the config above, you should use sequelize like this:

```js
module.exports = class extends think.Controller {
  async indexAction() {
    const player = this.sequel('player', 'sequel'); // use `sequel` adapter type
    const data = await player.findAll();
  }
}
```

### Relation

Sequelize support `hasOne`,`belongsTo`,`hasMany`,`belongsToMany` model relation type.
`think.Sequel.Relation` wrap the relation types, it has the following values：

```js
think.Sequel.Relation = {
  HAS_ONE: 'hasOne',
  BELONG_TO: 'belongsTo',
  HAS_MANY: 'hasMany',
  MANY_TO_MANY: 'belongsToMany'
};
```

For a better understanding, we give an example：

  * one `player` has one `partner`
  * one `player` belongs to one `team`
  * one `player` has owned many `trophy`
  * one `player` has many `teacher`, and one `teacher` has many `player`

```js
// src/model/player.js
module.exports = class extends think.Sequel {
  constructor(...props) {
    super(...props);
  }

  get schema() {
    return {
      attributes: {
        id: {
          type: think.Sequel.Sequel.BIGINT,
          primaryKey: true
        },
        teamId: think.Sequel.Sequel.BIGINT,
        name: think.Sequel.Sequel.STRING(255),
      },
      options: {
        timestamps: false,
        freezeTableName: true,
        tableName: 'think_player',
      },
      relations: [
        { 'team': think.Sequel.Relation.BELONG_TO },
        { 'partner': think.Sequel.Relation.HAS_ONE },
        { 'trophy': think.Sequel.Relation.HAS_MANY },
        {
          'sequel/teacher': think.Sequel.Relation.MANY_TO_MANY,
          options: {
            through: think.sequel('teacher_player', 'sequel') // do not use this.sequel in schema
          }
        },
      ]
    }
  }
}
```

NOTE: If you want use sequelize model in `schema`, you should use `think.sequel` method instead of `this.sequel`, because `this.sequel` has't been initialized at this time.

Default `tableName` equal `db prefix` + '_' + `model name`, If you want custom `tableName`:

```js
get schema () {
  return {
    // ...
    options: {
      freezeTableName: true,     // set true
      tableName: 'think_player', // custom tableName here
    }
  }
}

```

One player has one partner:

```js
// src/model/partner.js
module.exports = class extends think.Sequel {
  constructor(...props) {
    super(...props);
  }

  get schema() {
    return {
      attributes: {
        id: {
          type: think.Sequel.Sequel.BIGINT,
          primaryKey: true
        },
        playerId: think.Sequel.Sequel.BIGINT,
        name: think.Sequel.Sequel.STRING(255),
      }
    }
  }
}
```

Then you can use like this:

```js
module.exports = class extends think.Controller {
  constructor(...props) {
    super(...props);
  }
  indexAction() {
    let player = this.sequel('player', 'sequel');
    let partner = this.sequel('partner', 'sequel');
    return this.json(await player.findAll({
      include: [
        {
          model: partner,
        }
      ]
    }));
  }
}
```

Or you can use it in another way:

```js
// src/controller/index.js
module.exports = class extends think.Controller {
  constructor(...props) {
    super(...props);
  }
  async indexAction() {
    let player = this.sequel('player', 'sequel');
    return this.json(await player.getAllPlayer());
  }
}

// src/model/player.js
module.exports = class extends think.Sequel {
  // get schema and other ...
  getAllPlayer() {
    let partner = this.sequel('partner', 'sequel');
    return this.findAll({
      include: [
        { model: partner }
      ]
    });
  }
}
```

One player belongs to one team:

```js
// src/model/team.js
module.exports = class extends think.Sequel {
  constructor(...props) {
    super(...props);
  }

  get schema() {
    return {
      attributes: {
        id: {
          type: think.Sequel.Sequel.BIGINT,
          primaryKey: true
        },
        name: think.Sequel.Sequel.STRING(255),
      }
    }
  }
}
```

One player owned many trophies:

```js
// src/model/trophy.js
module.exports = class extends think.Sequel {
  constructor(...props) {
    super(...props);
  }

  get schema() {
    return {
      attributes: {
        id: {
          type: think.Sequel.Sequel.BIGINT,
          primaryKey: true
        },
        playerId: think.Sequel.Sequel.BIGINT,
        name: think.Sequel.Sequel.STRING(255),
      }
    }
  }
}
```

One player has many teachers, and one teacher has many players:

```js
// src/model/teacher.js
module.exports = class extends think.Sequel {
  constructor(...props) {
    super(...props);
  }

  get schema() {
    return {
      attributes: {
        id: {
          type: think.Sequel.Sequel.BIGINT,
          primaryKey: true
        },
        name: think.Sequel.Sequel.STRING(255),
      }
    }
  }
}
```

```js
// src/model/teacher_player.js
module.exports = class extends think.Sequel {
  constructor(...props) {
    super(...props);
  }

  get schema() {
    return {
      attributes: {
        id: {
          type: think.Sequel.Sequel.BIGINT,
          primaryKey: true
        },
        playerId: think.Sequel.Sequel.BIGINT,
        teacherId: think.Sequel.Sequel.BIGINT,
      }
    }
  }
}
```

### CURD

You can use sequelize's model methods to execute ORM. Read documents [http://docs.sequelizejs.com/](http://docs.sequelizejs.com/) to get more information.

