# think-model

[![npm](https://img.shields.io/npm/v/think-model.svg?style=flat-square)]()
[![Travis](https://img.shields.io/travis/thinkjs/think-model.svg?style=flat-square)]()
[![Coveralls](https://img.shields.io/coveralls/thinkjs/think-model/master.svg?style=flat-square)]()
[![David](https://img.shields.io/david/thinkjs/think-model.svg?style=flat-square)]()

ThinkJS3.x model, support mysql.

## Installation

    npm install think-model


## How To Use


### Basic 

  ```js
  const Model = require('think-model/mysql');
  const ModelConfig = {
    database: 'test',
    prefix: 'fk_',
    encoding: 'utf8',
    nums_per_page: 10,
    host: '127.0.0.1',
    port: '',
    user: 'root',
    password: 'root'
  };

  let userModel = new Model('user', ModelConfig);
  userModel
    .where({name: 'lizheming'})
    .find()
    .then(user => {
      console.log(user);
    });
  ```


### Advanced

If you want custom model, you can do like this:


  ```js
  const Model = require('think-model/mysql');
  const ModelConfig = {
    database: 'test',
    prefix: 'fk_',
    encoding: 'utf8',
    nums_per_page: 10,
    host: '127.0.0.1',
    port: '',
    user: 'root',
    password: 'root'
  };

  class UserModel extends Model {
    getUser(name) {
      return this.where({name}).find();
    }
  }

  let userModel = new UserModel('user', ModelConfig);
  userModel.getUser('lizheming').then(user => {
    console.log(user);
  });
  ```

## Adapters

### Relation

Relation model is an special model type that relate to other tables easily.

There has Four relation type:

- `HAS_ONE`: one to one model
- `BELONG_TO`: one to one belong to
- `HAS_MANY`: one to many
- `MANY_TO_MANY`: many to many

  ```js
  const RelationModel = require('think-model/mysql/relation');
  const ModelConfig = {
    database: 'test',
    prefix: 'fk_',
    encoding: 'utf8',
    nums_per_page: 10,
    host: '127.0.0.1',
    port: '',
    user: 'root',
    password: 'root'
  };

  class PostModel extends RelationModel {
    relation = {
      user: {
        type: RelationModel.BELONG_TO, //relation type
        model: "", //model name
        name: "user", //data name
        key: "id", 
        fKey: "user_id", //forign key
        field: "id,name",
        where: "name=xx",
        order: "",
        limit: "",
        rModel: "",
        rfKey: ""
      },
      comment: RelationModel.HAS_MANY,
    }
  }

  let postModel = new PostModel('post', ModelConfig);
  postModel.select().then(posts => {
    console.log(posts);
  });
  ```

#### Relation type configuration

| key    | comment                                                                        |
|--------|--------------------------------------------------------------------------------|
| type   | type of relation                                                               |
| model  | model name of relation table, default is relation variable object `key`        |
| key    | related key of current model                                                   |
| fkey   | related key of related table                                                   |
| field  | field used to query related table, fKey must be included if you set this field |
| where  | where condition used to query related table                                    |
| order  | order used to query related table                                              |
| limit  | limit used to query related table                                              |
| page   | page used to query related table                                               |
| rModel | related model name in many to many type                                        |
| rKey   | key in related table in many to many type                                      |
## Contributing

Contributions welcome!

## License

[MIT](https://github.com/thinkjs/think-model/blob/master/LICENSE)