const {test} = require('ava');
const Model = require('../../lib/model');
const Relation = require('../../lib/relation/has_many');

test('has many get relation no relation where', async t => {
  const relation = new Relation([{
    id: 3,
    title: 'hello1',
    content: 'world1'
  }, {
    id: '',
    title: 'hello2',
    content: 'world2'
  }], {
    key: 'id',
    fKey: 'post_id',
    name: 'user'
  });

  relation.parseRelationWhere = () => false;
  t.deepEqual(
    await relation.getRelationData(),
    [{
      id: 3,
      title: 'hello1',
      content: 'world1'
    }, {
      id: '',
      title: 'hello2',
      content: 'world2'
    }]
  );
});

test('has many get relation', async t => {
  t.plan(2);

  const relation = new Relation([{
    id: 3,
    title: 'hello1',
    content: 'world1'
  }, {
    id: 10,
    title: 'hello2',
    content: 'world2'
  }], {
    key: 'id',
    fKey: 'post_id',
    name: 'user'
  });

  relation.parseRelationWhere = () => ({post_id: ['IN', [3, 10]]});
  relation.options.model = new Model('user', {handle: new Function()});
  relation.options.model.select = function() {
    t.deepEqual(this.options.where, {post_id: ['IN', [3, 10]]});
    return [
      {name: 'lizheming', post_id: 10},
      {name: 'lizheming1', post_id: 10},
      {name: 'lizheming', post_id: 3}
    ];
  };

  t.deepEqual(
    await relation.getRelationData(),
    [
      {
        id: 3,
        title: 'hello1',
        content: 'world1',
        user: [{name: 'lizheming', post_id: 3}]
      },
      {
        id: 10,
        title: 'hello2',
        content: 'world2',
        user: [
          {name: 'lizheming', post_id: 10},
          {name: 'lizheming1', post_id: 10}
        ]
      }
    ]
  );
});

test('has one data with relation', async t => {
  t.plan(6);

  const relation = new Relation({
    id: 3,
    post: {
      title: 'hello1',
      content: 'world1'
    }
  }, {
    key: 'id',
    fKey: 'user_id',
    name: 'post',
    rModel: 'post'
  });

  relation.model = relation.options.model = new Model('user', {handle: new Function()});
  relation.model.model = function(name) {
    t.is(name, 'post');
    const model = new Model(name, {handle: new Function()});
    model.db = function() {
      return {
        where: function() {

        },
        delete: function() {
        }
      };
    };
    model.getSchema = function() {
      model.pk = 'id';
    };
    model.where = function(where) {
      t.deepEqual(where, {user_id: 3});
      return model;
    };
    model.addMany = function(data) {
      t.deepEqual(data, [{user_id: 3, title: 'hello1', content: 'world1'}]);
    };
    model.add = function(data) {
      t.deepEqual(data, {user_id: 3, title: 'hello1', content: 'world1'});
    };
    return model;
  };

  await relation.setRelationData('UPDATE');
  await relation.setRelationData('ADD');
  await relation.setRelationData('DELETE');
});
