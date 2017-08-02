const {test} = require('ava');
const Relation = require('../../src/relation/base');
test('instance normal', t => {
  t.plan(3);

  const relation = new Relation(1, 2, 3);
  t.is(relation.data, 1);
  t.is(relation.options, 2);
  t.is(relation.model, 3);
});

test('relation where parse data object empty key', t => {
  const relation = new Relation({
    title: 'hello1',
    content: 'world1'
  }, {
    key: 'id',
    fkey: 'post_id'
  }, []);
  t.false(relation.parseRelationWhere());
});

test('relation where parse data object', t => {
  const relation = new Relation({
    id: 3,
    title: 'hello1',
    content: 'world1'
  }, {
    key: 'id',
    fKey: 'post_id'
  }, []);
  t.deepEqual(relation.parseRelationWhere(), {post_id: 3});
});

test('relation where parse data arr', t => {
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
    fKey: 'post_id'
  }, []);
  t.deepEqual(relation.parseRelationWhere(), {post_id: ['IN', [3]]});
});

test('relation where parse data arr empty', t => {
  const relation = new Relation([{
    id: false,
    title: 'hello1',
    content: 'world1'
  }, {
    id: '',
    title: 'hello2',
    content: 'world2'
  }], {
    key: 'id',
    fKey: 'post_id'
  }, []);
  t.false(relation.parseRelationWhere());
});

test('relation data object', t => {
  t.plan(3);

  const relation = new Relation({
    title: 'hello1',
    content: 'world1'
  }, {
    name: 'user'
  }, []);

  t.deepEqual(
    relation.parseRelationData([{name: 'lizheming'}], true),
    {
      title: 'hello1',
      content: 'world1',
      user: [{name: 'lizheming'}]
    }
  );
  t.deepEqual(
    relation.parseRelationData([{name: 'lizheming'}], false),
    {
      title: 'hello1',
      content: 'world1',
      user: {name: 'lizheming'}
    }
  );
  t.deepEqual(
    relation.parseRelationData({name: 'lizheming'}, false),
    {
      title: 'hello1',
      content: 'world1',
      user: {}
    }
  );
});

test('relation data arr', t => {
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
  }, []);

  t.deepEqual(relation.parseRelationData([
    {name: 'lizheming', post_id: 10},
    {name: 'lizheming1', post_id: 10},
    {name: 'lizheming', post_id: 3}
  ], true), [
    {
      id: 3,
      title: 'hello1',
      content: 'world1',
      user: [
        {name: 'lizheming', post_id: 3}
      ]
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
  ]);

  t.deepEqual(relation.parseRelationData([
    {name: 'lizheming', post_id: 10},
    {name: 'lizheming1', post_id: 10},
    {name: 'lizheming', post_id: 3}
  ], false), [
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
  ]);
});
