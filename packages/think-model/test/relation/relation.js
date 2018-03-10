const {test} = require('ava');
const Relation = require('../../lib/relation/relation');
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
  t.plan(2);

  const relation = new Relation({model: 'fake', relation: {r: 'fake', a: 2}});
  relation.setRelation({r: 'fake2', delay: 'ka905'});
  t.deepEqual(relation.relation, {a: 2, r: 'fake2', delay: 'ka905'});
  t.true(relation.relationName);
});

test('relation set relation two parameter', t => {
  const relation = new Relation({model: 'fake',
    relation: {
      r: 'fake'
    }});

  relation.setRelation('r', 3);
  t.deepEqual(relation.relation, {r: 3});
});

test('relation set relation two parameter2', t => {
  const relation = new Relation({model: 'fake',
    relation: {
      r: 'fake'
    }});

  relation.setRelation('a', 123);
  t.deepEqual(relation.relation, {r: 'fake', a: 123});
});

test('relation set relation with boolean', t => {
  t.plan(2);

  const relation = new Relation({model: 'fake',
    relation: {
      r: 'fake'
    }});

  relation.setRelation(true);
  t.deepEqual(relation.relation, {r: 'fake'});
  t.true(relation.relationName);
});

test('relation set relation with boolean false', t => {
  t.plan(2);

  const relation = new Relation({model: 'fake',
    relation: {
      r: 'fake'
    }});

  relation.setRelation(false);
  t.deepEqual(relation.relation, {r: 'fake'});
  t.false(relation.relationName);
});

test('relation set relation with string', t => {
  const relation = new Relation({model: 'fake',
    relation: {
      r: 'fake',
      a: 'fake2'
    }});

  relation.setRelation('r,a', false);
  t.deepEqual(relation.relationName, []);
});

test('relation set relation with string true', t => {
  t.plan(2);

  const relation = new Relation({model: 'fake',
    relation: {
      r: 'fake',
      a: 'fake2'
    }});

  relation.setRelation('r,a', true);
  t.deepEqual(relation.relation, {r: 'fake', a: 'fake2', 'r,a': true});
  t.true(relation.relationName);
});

test('relation set relation with string empty arr', t => {
  t.plan(2);

  const relation = new Relation({model: 'fake',
    relation: {
      r: 'fake',
      a: 'fake2'
    }});

  relation.setRelation('r,a', []);
  t.deepEqual(relation.relation, {r: 'fake', a: 'fake2'});
  t.deepEqual(relation.relationName, ['r', 'a']);
});

test('relation get relation false', async t => {
  const relation = new Relation({model: 'fake',
    relation: {
      r: 'fake',
      a: 'fake2'
    }});

  t.false(await relation.getRelationData(false));
});

test('relation get relation relation empty', async t => {
  const relation = new Relation({model: 'fake'});

  t.is(await relation.getRelationData(123), 123);
});

test('relation get relation relationName empty', async t => {
  const relation = new Relation({model: 'fake'});
  relation.relationName = null;
  t.is(await relation.getRelationData(233), 233);
});

// test('relation get relation normal which relation has and relationName false', async t => {
//   const relation = new Relation({model: 'fake',
//     relatioin: {
//       r: 'fake',
//       a: 'fake2'
//     }});

//   t.deepEqual(await relation.getRelationData({a: 3}), {a: 3});
// });

test('relation parse item relation with relation data', t => {
  const relation = new Relation({model: 'post',
    relation: {
      user: Relation.HAS_ONE
    }});

  const postData = {
    id: 3,
    title: 'hello',
    content: 'world',
    user: {id: 1, name: 'lizheming'}
  };

  t.is(relation.parseItemRelation('user', postData), undefined);
});

test('relation parse item relation without relation data', async t => {
  const relation = new Relation({
    model: {
      db: () => {}
    },
    relation: {
      user: Relation.HAS_ONE
    }
  });
  let flag = 1;
  relation.model.db = () => {
    flag = 2;
    return 2;
  };
  relation.model.model = () => {
    const instance = new Relation({
      model: {
        db: () => {}
      }
    });
    instance.db = (data) => {
      t.is(data, 2);
      flag = 3;
    };
    return instance;
  };
  t.deepEqual(await relation.parseItemRelation('user', {
    id: 3,
    title: 'hello',
    content: 'world'
  }), {
    id: 3,
    title: 'hello',
    content: 'world'
  });
  t.is(flag, 3);
});

test('relation parse item relation belong to', async t => {
  const relation = new Relation({
    model: {
      db: () => {}
    },
    relation: {
      user: Relation.BELONG_TO
    }
  });

  let flag = 1;
  relation.model.db = () => {
    flag = 2;
    return 2;
  };
  relation.model.model = () => {
    const instance = new Relation({
      model: {
        db: () => {}
      }
    });
    instance.db = (data) => {
      t.is(data, 2);
      flag = 3;
    };
    return instance;
  };
  t.deepEqual(await relation.parseItemRelation('user', {
    id: 3,
    title: 'hello',
    content: 'world'
  }), {
    id: 3,
    title: 'hello',
    content: 'world'
  });
  t.is(flag, 3);
});

test('relation parse item relation many to many', async t => {
  const relation = new Relation({
    model: {
      db: () => {}
    },
    relation: {
      user: Relation.MANY_TO_MANY
    }
  });

  let flag = 1;
  relation.model.db = () => {
    flag = 2;
    return 2;
  };
  relation.model.model = () => {
    const instance = new Relation({
      model: {
        db: () => {}
      }
    });
    instance.db = (data) => {
      t.is(data, 2);
      flag = 3;
    };
    return instance;
  };
  t.deepEqual(await relation.parseItemRelation('user', {
    id: 3,
    title: 'hello',
    content: 'world'
  }), {
    id: 3,
    title: 'hello',
    content: 'world'
  });
  t.is(flag, 3);
});
