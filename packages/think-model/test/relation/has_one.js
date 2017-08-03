const {test} = require('ava');
const Model = require('../../src/model');
const Relation = require('../../src/relation/has_one');

test('has one get relation no relation where', async t => {
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
    await relation.getRelation(),
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

test('has one get relation', async t => {
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
    await relation.getRelation(),
    [
      {
        id: 3,
        title: 'hello1',
        content: 'world1',
        user: {name: 'lizheming', post_id: 3}
      },
      {
        id: 10,
        title: 'hello2',
        content: 'world2',
        user: {name: 'lizheming1', post_id: 10}
      }
    ]
  );
});
