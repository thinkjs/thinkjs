const {test} = require('ava');
const Relation = require('../../src/relation/relation');
test('relation instance', t => {
  t.plan(4);

  const relation = new Relation({model: 'fake'});
  t.deepEqual(relation.model, {model: 'fake'});
  t.deepEqual(relation.relation, {});
  t.true(relation.relationName);

  t.deepEqual(
    (new Relation({relation: {r: 'fake'}})).relation,
    {r: 'fake'}
  );
});

test('relation set relation undefined', t => {
  t.plan(2);

  const relation = new Relation({model: 'fake', relation: {r: 'fake'}});
  relation.setRelation();
  t.deepEqual(relation.relation, {r: 'fake'});
  t.true(relation.relationName);
});

test('relation set relation object', t => {
  const relation = new Relation({model: 'fake', relation: {r: 'fake', a: 2}});
  relation.setRelation({r: 'fake2', delay: 'ka905'});
  t.deepEqual(relation.relation, {a: 2, r: 'fake2', delay: 'ka905'});
  t.true(relation.relationName);
});

test('relation set relatioin object')
;
