const {test} = require('ava');
const Model = require('../../lib/model');
const Relation = require('../../lib/relation/many_to_many');

test('many to many get relation model name', t => {
  const relation = new Relation(
    {model: 'fake'},
    {model: {modelName: 'Option'}},
    {modelName: 'Model'}
  );
  t.is(relation.getRelationModelName(), 'model_option');
});

test('many to many get relation no relation where', async t => {
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

test('many to many get relation get modelName from rModel', async t => {
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
    name: 'user',
    rfKey: 'user_id',
    rModel: 'post_user'
  });

  relation.model = relation.options.model = new Model('user', {handle: new Function()});
  relation.options.model.select = function() {
    t.deepEqual(this.options, {'field': '*,b.post_id', 'fieldReverse': false, 'alias': 'a', 'where': {'post_id': ['IN', [3, 10]]}, 'join': [{'post_user': {'table': 'relationModel', 'as': 'b', 'join': 'inner', 'on': ['id', 'user_id']}}]});
    return [
      {name: 'lizheming', post_id: 10},
      {name: 'lizheming1', post_id: 10},
      {name: 'lizheming', post_id: 3}
    ];
  };
  t.deepEqual(await relation.getRelationData(), [{
    id: 3,
    title: 'hello1',
    content: 'world1',
    user: [{name: 'lizheming', post_id: 3}]
  }, {
    id: 10,
    title: 'hello2',
    content: 'world2',
    user: [{name: 'lizheming', post_id: 10},
      {name: 'lizheming1', post_id: 10}]
  }]);
});
