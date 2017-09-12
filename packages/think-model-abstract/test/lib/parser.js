const ava = require('ava');
const helper = require('think-helper');
const Parser = require('../../lib/parser');

const getParserInstance = config => {
  const instance = new Parser(config);
  instance.parseKey = function parseKey(key = '') {
    key = key.trim();
    if (helper.isEmpty(key)) return '';
    if (helper.isNumberString(key)) return key;
    if (!(/[,'"*()`.\s]/.test(key))) {
      key = '`' + key + '`';
    }
    return key;
  };
  return instance;
};

ava.test('init', ('init', t => {
  t.plan(2);
  const instance = getParserInstance();
  // const keys = Object.keys(instance.comparison).sort();
  // t.deepEqual(keys, [ '<>', 'EGT', 'ELT', 'EQ', 'GT', 'ILIKE', 'IN', 'LIKE', 'LT', 'NEQ', 'NOTILIKE', 'NOTIN', 'NOTLIKE' ]);
  t.is(instance.selectSql, undefined);
  t.is(instance.comparison, undefined);
}));

ava.test('parseExplain', t => {
  const instance = getParserInstance();
  const data = instance.parseExplain();
  t.is(data, '');
});

ava.test('parseExplain true', t => {
  const instance = getParserInstance();
  const data = instance.parseExplain(true);
  t.is(data, 'EXPLAIN ');
});

ava.test('parseSet', t => {
  const instance = getParserInstance();
  const data = instance.parseSet({
    name: 'lizheming'
  });
  t.is(data, " SET `name`='lizheming'");
});

ava.test('parseSet, has extra value', t => {
  const instance = getParserInstance();
  const data = instance.parseSet({
    name: 'lizheming',
    value: ['array']
  });
  t.is(data, " SET `name`='lizheming'");
});

ava.test('parseSet, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseSet();
  t.is(data, '');
});

ava.test('parseKey is function', t => {
  const instance = getParserInstance();
  const key = instance.parseKey('key');
  t.is(key, '`key`');
});

ava.test('parseKey is function 2', t => {
  const instance = getParserInstance();
  const key = instance.parseKey('key()');
  t.is(key, 'key()');
});

ava.test('parseValue, string', t => {
  const instance = getParserInstance();
  const key = instance.parseValue('key');
  t.is(key, "'key'");
});

ava.test('parseValue, array, exp', t => {
  const instance = getParserInstance();
  const key = instance.parseValue(['exp', 'lizheming']);
  t.is(key, 'lizheming');
});

ava.test('parseValue, array, exp', t => {
  const instance = getParserInstance();
  const key = instance.parseValue(['exp', 'lizhemi()ng']);
  t.is(key, 'lizhemi()ng');
});

ava.test('parseValue, null', t => {
  const instance = getParserInstance();
  const key = instance.parseValue(null);
  t.is(key, 'null');
});

ava.test('parseValue, boolean, true', t => {
  const instance = getParserInstance();
  const key = instance.parseValue(true);
  t.is(key, '1');
});

ava.test('parseValue, boolean, false', t => {
  const instance = getParserInstance();
  const key = instance.parseValue(false);
  t.is(key, '0');
});

ava.test('parseValue, object', t => {
  const instance = getParserInstance();
  const key = instance.parseValue({});
  t.deepEqual(key, {});
});

ava.test('parseField, empty', t => {
  const instance = getParserInstance();
  const key = instance.parseField();
  t.deepEqual(key, '*');
});

ava.test('parseField, single field', t => {
  const instance = getParserInstance();
  const key = instance.parseField('name');
  t.deepEqual(key, '`name`');
});

ava.test('parseField, multi field', t => {
  const instance = getParserInstance();
  const key = instance.parseField('name,title');
  t.deepEqual(key, '`name`,`title`');
});

ava.test('parseField, multi field', t => {
  const instance = getParserInstance();
  const key = instance.parseField('name, title');
  t.deepEqual(key, '`name`,`title`');
});

ava.test('parseField, object', t => {
  const instance = getParserInstance();
  const key = instance.parseField({
    name: 'name',
    title1: 'title'
  });
  t.deepEqual(key, '`name` AS `name`,`title1` AS `title`');
});

ava.test('parseTable, empty', t => {
  const instance = getParserInstance();
  const key = instance.parseTable();
  t.deepEqual(key, '');
});

ava.test('parseTable, string', t => {
  const instance = getParserInstance();
  const key = instance.parseTable('user');
  t.deepEqual(key, '`user`');
});

ava.test('parseTable, string, multi', t => {
  const instance = getParserInstance();
  const key = instance.parseTable('user, group');
  t.deepEqual(key, '`user`,`group`');
});

ava.test('parseTable, object', t => {
  const instance = getParserInstance();
  const key = instance.parseTable({
    user: 'user1',
    group: 'group1'
  });
  t.deepEqual(key, '`user` AS `user1`,`group` AS `group1`');
});

ava.test('getLogic', t => {
  const instance = getParserInstance();
  const key = instance.getLogic({});
  t.deepEqual(key, 'AND');
});

ava.test('getLogic, has _logic', t => {
  const instance = getParserInstance();
  const key = instance.getLogic({
    _logic: 'OR'
  });
  t.deepEqual(key, 'OR');
});

ava.test('getLogic, has _logic, error', t => {
  const instance = getParserInstance();
  const key = instance.getLogic({
    _logic: 'test'
  });
  t.deepEqual(key, 'AND');
});

ava.test('getLogic, default is OR', t => {
  const instance = getParserInstance();
  const key = instance.getLogic({}, 'OR');
  t.deepEqual(key, 'OR');
});

ava.test('getLogic, string', t => {
  const instance = getParserInstance();
  const key = instance.getLogic('AND', 'OR');
  t.deepEqual(key, 'AND');
});

ava.test('getLogic, string, lowercase', t => {
  const instance = getParserInstance();
  const key = instance.getLogic('and', 'OR');
  t.deepEqual(key, 'AND');
});

ava.test('escapeString is function', t => {
  const instance = getParserInstance();
  t.true(helper.isFunction(instance.escapeString));
});

ava.test('parseLock, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseLock();
  t.is(data, '');
});

ava.test('parseLock, true', t => {
  const instance = getParserInstance();
  const data = instance.parseLock(true);
  t.is(data, ' FOR UPDATE ');
});

ava.test('parseDistinct, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseDistinct();
  t.is(data, '');
});

ava.test('parseDistinct, true', t => {
  const instance = getParserInstance();
  const data = instance.parseDistinct(true);
  t.is(data, ' DISTINCT');
});

ava.test('parseComment, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseComment();
  t.is(data, '');
});

ava.test('parseComment, lizheming test', t => {
  const instance = getParserInstance();
  const data = instance.parseComment('lizheming test');
  t.is(data, ' /*lizheming test*/');
});

ava.test('parseHaving, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseHaving();
  t.is(data, '');
});

ava.test('parseHaving, SUM(area)>1000000', t => {
  const instance = getParserInstance();
  const data = instance.parseHaving('SUM(area)>1000000');
  t.is(data, ' HAVING SUM(area)>1000000');
});

ava.test('parseGroup, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseGroup();
  t.is(data, '');
});

ava.test('parseGroup, name', t => {
  const instance = getParserInstance();
  const data = instance.parseGroup('name');
  t.is(data, ' GROUP BY `name`');
});

ava.test('parseGroup, name', t => {
  const instance = getParserInstance();
  const data = instance.parseGroup("date_format(create_time,'%Y-%m-%d')");
  t.is(data, " GROUP BY date_format(create_time,'%Y-%m-%d')");
});

ava.test('parseGroup, name,title', t => {
  const instance = getParserInstance();
  const data = instance.parseGroup('name, title');
  t.is(data, ' GROUP BY `name`,`title`');
});

ava.test('parseGroup, user.name,title', t => {
  const instance = getParserInstance();
  const data = instance.parseGroup(['user.name', 'title']);
  t.is(data, ' GROUP BY user.`name`,`title`');
});

ava.test('parseOrder, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseOrder();
  t.is(data, '');
});

ava.test('parseOrder, array', t => {
  const instance = getParserInstance();
  const data = instance.parseOrder(['name ASC', 'title DESC']);
  t.is(data, ' ORDER BY name ASC,title DESC');
});

ava.test('parseOrder, string', t => {
  const instance = getParserInstance();
  const data = instance.parseOrder('name ASC,title DESC');
  t.is(data, ' ORDER BY name ASC,title DESC');
});

ava.test('parseOrder, object', t => {
  const instance = getParserInstance();
  const data = instance.parseOrder({name: 'ASC', 'title': 'DESC'});
  t.is(data, ' ORDER BY `name` ASC,`title` DESC');
});

ava.test('parseLimit, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseLimit();
  t.is(data, '');
});

ava.test('parseLimit, 10', t => {
  const instance = getParserInstance();
  const data = instance.parseLimit('10');
  t.is(data, ' LIMIT 10');
});

ava.test('parseLimit, number', t => {
  const instance = getParserInstance();
  const data = instance.parseLimit(10);
  t.is(data, ' LIMIT 10');
});

ava.test('parseLimit, 10, 20', t => {
  const instance = getParserInstance();
  const data = instance.parseLimit('10, 20');
  t.is(data, ' LIMIT 10,20');
});

ava.test('parseLimit, 10, lizheming', t => {
  const instance = getParserInstance();
  const data = instance.parseLimit('10, lizheming');
  t.is(data, ' LIMIT 10,0');
});

ava.test('parseLimit, [20, 10]', t => {
  const instance = getParserInstance();
  const data = instance.parseLimit([20, 10]);
  t.is(data, ' LIMIT 20,10');
});

ava.test('parseJoin, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin();
  t.is(data, '');
});

ava.test('parseJoin, single string', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin('meinv_cate ON meinv_group.cate_id=meinv_cate.id');
  t.is(data, ' LEFT JOIN meinv_cate ON meinv_group.cate_id=meinv_cate.id');
});

ava.test('parseJoin, multi string', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin(['meinv_cate ON meinv_group.cate_id=meinv_cate.id', 'RIGHT JOIN meinv_tag ON meinv_group.tag_id=meinv_tag.id']);
  t.is(data, ' LEFT JOIN meinv_cate ON meinv_group.cate_id=meinv_cate.id RIGHT JOIN meinv_tag ON meinv_group.tag_id=meinv_tag.id');
});

ava.test('parseJoin, array', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'cate',
    join: 'inner',
    as: 'c',
    on: ['cate_id', 'id']
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.is(data, ' INNER JOIN `cate` AS `c` ON `user`.`cate_id` = `c`.`id`');
});

ava.test('parseJoin, array, no on', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'cate',
    join: 'inner',
    as: 'c'
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.is(data, ' INNER JOIN `cate` AS `c`');
});

ava.test('parseJoin, array, ignore not object', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'cate',
    join: 'inner',
    as: 'c'
  }, true], {
    tablePrefix: '',
    table: 'user'
  });
  t.is(data, ' INNER JOIN `cate` AS `c`');
});

ava.test('parseJoin, array, multi', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'cate',
    join: 'left',
    as: 'c',
    on: ['cate_id', 'id']
  }, {
    table: 'group_tag',
    join: 'left',
    as: 'd',
    on: ['id', 'group_id']
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.is(data, ' LEFT JOIN `cate` AS `c` ON `user`.`cate_id` = `c`.`id` LEFT JOIN `group_tag` AS `d` ON `user`.`id` = `d`.`group_id`');
});

ava.test('parseJoin, array, multi 1', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    cate: {
      join: 'left',
      as: 'c',
      on: ['id', 'id']
    },
    group_tag: {
      join: 'left',
      as: 'd',
      on: ['id', 'group_id']
    }
  }], {
    tablePrefix: '',
    table: 'user'
  });

  t.is(data, ' LEFT JOIN `cate` AS `c` ON `user`.`id` = `c`.`id` LEFT JOIN `group_tag` AS `d` ON `user`.`id` = `d`.`group_id`');
});

ava.test('parseJoin, array, multi 2', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    cate: {
      on: ['id', 'id']
    },
    group_tag: {
      on: ['id', 'group_id']
    }
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.is(data, ' LEFT JOIN `cate` ON `user`.`id` = `cate`.`id` LEFT JOIN `group_tag` ON `user`.`id` = `group_tag`.`group_id`');
});

ava.test('parseJoin, array, multi 3', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    cate: {
      on: 'id, id'
    },
    group_tag: {
      on: ['id', 'group_id']
    },
    tag: {
      on: {
        id: 'id',
        title: 'name'
      }
    }
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.is(data, ' LEFT JOIN `cate` ON `user`.`id` = `cate`.`id` LEFT JOIN `group_tag` ON `user`.`id` = `group_tag`.`group_id` LEFT JOIN `tag` ON (`user`.`id`=`tag`.`id` AND `user`.`title`=`tag`.`name`)');
});

ava.test('parseJoin, array, multi 4, on has table name', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    cate: {
      on: 'id, id'
    },
    group_tag: {
      on: ['id', 'group_id']
    },
    tag: {
      on: {
        id: 'id',
        title: 'tag.name'
      }
    }
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.is(data, ' LEFT JOIN `cate` ON `user`.`id` = `cate`.`id` LEFT JOIN `group_tag` ON `user`.`id` = `group_tag`.`group_id` LEFT JOIN `tag` ON (`user`.`id`=`tag`.`id` AND `user`.`title`=tag.name)');
});

ava.test('parseJoin, array, multi 4, on has table name 1', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    cate: {
      on: 'id, id'
    },
    group_tag: {
      on: ['id', 'group_id']
    },
    tag: {
      on: {
        id: 'id',
        title: '`tag`.`name`'
      }
    }
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.is(data, ' LEFT JOIN `cate` ON `user`.`id` = `cate`.`id` LEFT JOIN `group_tag` ON `user`.`id` = `group_tag`.`group_id` LEFT JOIN `tag` ON (`user`.`id`=`tag`.`id` AND `user`.`title`=`tag`.`name`)');
});

ava.test('parseJoin, array, multi 4', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    cate: {
      on: 'id, id'
    },
    group_tag: {
      on: ['id', 'group_id']
    },
    tag: {
      on: {
        id: 'id',
        'u1.title': 'tag.name'
      }
    }
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.is(data, ' LEFT JOIN `cate` ON `user`.`id` = `cate`.`id` LEFT JOIN `group_tag` ON `user`.`id` = `group_tag`.`group_id` LEFT JOIN `tag` ON (`user`.`id`=`tag`.`id` AND u1.title=tag.name)');
});

ava.test('parseJoin, array, table is sql', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'SELECT * FROM test WHERE 1=1',
    join: 'left',
    as: 'temp',
    on: ['id', 'temp.team_id']
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.is(data, ' LEFT JOIN (SELECT * FROM test WHERE 1=1) AS `temp` ON `user`.`id` = temp.team_id');
});

ava.test('parseJoin, array, table is sql 1', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'SELECT * FROM test WHERE 1=1',
    join: 'left',
    as: 'temp',
    on: ['u.id', 'temp.team_id']
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.is(data, ' LEFT JOIN (SELECT * FROM test WHERE 1=1) AS `temp` ON u.id = temp.team_id');
});

ava.test('parseJoin, array, table is sql 2', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: 'SELECT * FROM test WHERE 1=1',
    join: 'left',
    as: 'temp',
    on: ['id', 'team_id']
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.is(data, ' LEFT JOIN (SELECT * FROM test WHERE 1=1) AS `temp` ON `user`.`id` = `temp`.`team_id`');
});

ava.test('parseJoin, array, table is sql 3', t => {
  const instance = getParserInstance();
  const data = instance.parseJoin([{
    table: '(SELECT * FROM test WHERE 1=1)',
    join: 'left',
    as: 'temp',
    on: ['id', 'team_id']
  }], {
    tablePrefix: '',
    table: 'user'
  });
  t.is(data, ' LEFT JOIN (SELECT * FROM test WHERE 1=1) AS `temp` ON `user`.`id` = `temp`.`team_id`');
});

ava.test('parseThinkWhere, key is empty, ignore valud', t => {
  const instance = getParserInstance();
  const data = instance.parseThinkWhere('', 'SELECT * FROM user');
  t.is(data, '');
});

ava.test('parseThinkWhere, _string', t => {
  const instance = getParserInstance();
  const data = instance.parseThinkWhere('_string', 'SELECT * FROM user');
  t.is(data, 'SELECT * FROM user');
});

ava.test('parseThinkWhere, _query', t => {
  const instance = getParserInstance();
  const data = instance.parseThinkWhere('_query', 'name=lizheming&name1=suredy');
  t.is(data, '`name` = \'lizheming\' AND `name1` = \'suredy\'');
});

ava.test('parseThinkWhere, _query, with logic', t => {
  const instance = getParserInstance();
  const data = instance.parseThinkWhere('_query', 'name=lizheming&name1=suredy&_logic=OR');
  t.is(data, '`name` = \'lizheming\' OR `name1` = \'suredy\'');
});

ava.test('parseThinkWhere, _query, object', t => {
  const instance = getParserInstance();
  const data = instance.parseThinkWhere('_query', {name: 'lizheming', name1: 'suredy'});
  t.is(data, '`name` = \'lizheming\' AND `name1` = \'suredy\'');
});

ava.test('parseWhere, empty', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere();
  t.is(data, '');
});

ava.test('parseWhere, empty 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({_logic: 'AND'});
  t.is(data, '');
});

ava.test('parseWhere, 1=1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({1: 1});
  t.is(data, ' WHERE ( 1 = 1 )');
});

ava.test('parseWhere, key is not valid', t => {
  const instance = getParserInstance();
  try {
    instance.parseWhere({'&*&*&*': 'title'});
    t.fail('parseWhere fail without error when key is not valid');
  } catch (e) {
    t.pass();
  }
});

ava.test('parseWhere, string & object', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({title: 'lizheming', _string: 'status=1'});
  t.is(data, ' WHERE ( `title` = \'lizheming\' ) AND ( status=1 )');
});

ava.test('parseWhere, null', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({title: null});
  t.is(data, ' WHERE ( `title` IS NULL )');
});

ava.test('parseWhere, null 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({title: {'=': null}});
  t.is(data, ' WHERE ( `title` IS NULL )');
});

ava.test('parseWhere, null 2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({title: ['=', null]});
  t.is(data, ' WHERE ( `title` IS NULL )');
});

ava.test('parseWhere, not null', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({title: {'!=': null}});
  t.is(data, ' WHERE ( `title` IS NOT NULL )');
});

ava.test('parseWhere, not null 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({title: ['!=', null]});
  t.is(data, ' WHERE ( `title` IS NOT NULL )');
});

ava.test('parseWhere, object', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: 10});
  t.is(data, ' WHERE ( `id` = 10 )');
});

ava.test('parseWhere, object IN number', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: {IN: [1, 2, 3]}});
  t.is(data, ' WHERE ( `id` IN (1, 2, 3) )');
});

ava.test('parseWhere, IN number string', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: [1, 2, 3]});
  t.is(data, ' WHERE ( `id` IN ( 1, 2, 3 ) )');
});

ava.test('parseWhere, object 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: [1, 10, 'string']});
  t.is(data, ' WHERE ( (`id` = 1) AND (`id` = 10) AND (`id` = \'string\') )');
});

ava.test('parseWhere, IN number string', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: ['1', '2', '3']});
  t.is(data, ' WHERE ( `id` IN ( 1, 2, 3 ) )');
});

ava.test('parseWhere, object IN number string', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: {IN: ['1', '2', '3']}});
  t.is(data, ' WHERE ( `id` IN (\'1\', \'2\', \'3\') )');
});

ava.test('parseWhere, object 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: ['!=', 10]});
  t.is(data, ' WHERE ( `id` != 10 )');
});

ava.test('parseWhere, string', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere('id = 10 OR id < 2');
  t.is(data, ' WHERE id = 10 OR id < 2');
});

ava.test('parseWhere, EXP', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({name: ['EXP', "='name'"]});
  t.is(data, ' WHERE ( (`name` =\'name\') )');
});

ava.test('parseWhere, EXP 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({view_nums: ['EXP', '=view_nums+1']});
  t.is(data, ' WHERE ( (`view_nums` =view_nums+1) )');
});

ava.test('parseWhere, LIKE', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({title: ['NOTLIKE', 'lizheming']});
  t.is(data, ' WHERE ( `title` NOT LIKE \'lizheming\' )');
});

ava.test('parseWhere, LIKE 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({title: ['like', '%lizheming%']});
  t.is(data, ' WHERE ( `title` LIKE \'%lizheming%\' )');
});

ava.test('parseWhere, LIKE 2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({title: ['like', ['lizheming', 'suredy']]});
  t.is(data, ' WHERE ( (`title` LIKE \'lizheming\' OR `title` LIKE \'suredy\') )');
});

ava.test('parseWhere, LIKE 3', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({title: ['like', ['lizheming', 'suredy'], 'AND']});
  t.is(data, ' WHERE ( (`title` LIKE \'lizheming\' AND `title` LIKE \'suredy\') )');
});

ava.test('parseWhere, key has |', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({'title|content': ['like', '%lizheming%']});
  t.is(data, ' WHERE ( (`title` LIKE \'%lizheming%\') OR (`content` LIKE \'%lizheming%\') )');
});

ava.test('parseWhere, key has |, multi', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    'title|content': [
      ['like', '%title%'], ['=', '%content%']
    ],
    _multi: true
  });
  t.is(data, ' WHERE ( (`title` LIKE \'%title%\') OR (`content` = \'%content%\') )');
});

ava.test('parseWhere, key has |, multi', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    'title|content': [
      ['like', '%title%'], ['=', '%content%']
    ],
    _multi: true
  });
  t.is(data, ' WHERE ( (`title` LIKE \'%title%\') OR (`content` = \'%content%\') )');
});

ava.test('parseWhere, key has &', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({'title&content': ['like', '%lizheming%']});
  t.is(data, ' WHERE ( (`title` LIKE \'%lizheming%\') AND (`content` LIKE \'%lizheming%\') )');
});

ava.test('parseWhere, key has &, multi', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    'title&content': [
      ['like', '%lizheming%'],
      ['!=', '%content%']
    ],
    _multi: true
  });
  t.is(data, ' WHERE ( (`title` LIKE \'%lizheming%\') AND (`content` != \'%content%\') )');
});

ava.test('parseWhere, IN', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: ['IN', '10,20']});
  t.is(data, ' WHERE ( `id` IN (\'10\',\'20\') )');
});

ava.test('parseWhere, IN 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: ['IN', [10, 20]]});
  t.is(data, ' WHERE ( `id` IN (10,20) )');
});

ava.test('parseWhere, IN 2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: ['NOTIN', [10, 20]]});
  t.is(data, ' WHERE ( `id` NOT IN (10,20) )');
});

ava.test('parseWhere, NOT IN, only one', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: ['NOTIN', 10]});
  t.is(data, ' WHERE ( `id` != 10 )');
});

ava.test('parseWhere, IN, only one', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: ['IN', 10]});
  t.is(data, ' WHERE ( `id` = 10 )');
});

ava.test('parseWhere, IN, object', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: {IN: [1, 2, 3]}});
  t.is(data, ' WHERE ( `id` IN (1, 2, 3) )');
});

ava.test('parseWhere, IN, has exp', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: ['NOTIN', '(10,20,30)', 'exp']});
  t.is(data, ' WHERE ( `id` NOT IN (10,20,30) )');
});

ava.test('parseWhere, multi fields', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: 10, title: 'www'});
  t.is(data, ' WHERE ( `id` = 10 ) AND ( `title` = \'www\' )');
});

ava.test('parseWhere, multi fields 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: 10, title: 'www', _logic: 'OR'});
  t.is(data, ' WHERE ( `id` = 10 ) OR ( `title` = \'www\' )');
});

ava.test('parseWhere, multi fields 2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: 10, title: 'www', _logic: 'XOR'});
  t.is(data, ' WHERE ( `id` = 10 ) XOR ( `title` = \'www\' )');
});

ava.test('parseWhere, BETWEEN', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: ['BETWEEN', 1, 2]});
  t.is(data, ' WHERE (  (`id` BETWEEN 1 AND 2) )');
});

ava.test('parseWhere, BETWEEN', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: ['BETWEEN', '2017-04-13 00:00:00', '2017-04-19 00:00:00']});
  t.is(data, ' WHERE (  (`id` BETWEEN \'2017-04-13 00:00:00\' AND \'2017-04-19 00:00:00\') )');
});

ava.test('parseWhere, BETWEEN', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: ['between', '1,2']});
  t.is(data, ' WHERE (  (`id` BETWEEN \'1\' AND \'2\') )');
});

ava.test('parseWhere, complex', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: {
    '>': 10,
    '<': 20
  }});
  t.is(data, ' WHERE ( `id` > 10 AND `id` < 20 )');
});

ava.test('parseWhere, complex 1', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: {
    '>': 10,
    '<': 20,
    _logic: 'OR'
  }});
  t.is(data, ' WHERE ( `id` > 10 OR `id` < 20 )');
});

ava.test('parseWhere, complex 2', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({id: {
    '>=': 10,
    '<=': 20
  },
  'title': ['like', '%lizheming%'],
  date: ['>', '2014-08-12'],
  _logic: 'OR'});
  t.is(data, ' WHERE ( `id` >= 10 AND `id` <= 20 ) OR ( `title` LIKE \'%lizheming%\' ) OR ( `date` > \'2014-08-12\' )');
});

ava.test('parseWhere, complex 3', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    title: 'test',
    _complex: {
      id: ['IN', [1, 2, 3]],
      content: 'www',
      _logic: 'or'
    }
  });
  t.is(data, ' WHERE ( `title` = \'test\' ) AND (  ( `id` IN (1,2,3) ) OR ( `content` = \'www\' ) )');
});

ava.test('parseWhere, other', t => {
  const instance = getParserInstance();
  try {
    instance.parseWhere({
      title: ['OTHER', 'dd']
    });
    t.fail('parseWhere fail without error when other data');
  } catch (e) {
    t.pass();
  }
});

ava.test('parseWhere, array', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\'']
    ]
  });
  t.is(data, ' WHERE ( (`title` = \'lizheming\') )');
});

ava.test('parseWhere, array, multi', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\''],
      ['=', 'suredy']
    ]
  });
  t.is(data, ' WHERE ( (`title` = \'lizheming\') AND (`title` = \'suredy\') )');
});

ava.test('parseWhere, array, multi， or', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\''],
      ['=', 'suredy'],
      'OR'
    ]
  });
  t.is(data, ' WHERE ( (`title` = \'lizheming\') OR (`title` = \'suredy\') )');
});

ava.test('parseWhere, array, multi， or', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\''],
      ['!=', 'suredy'],
      'OR'
    ]
  });
  t.is(data, ' WHERE ( (`title` = \'lizheming\') OR (`title` != \'suredy\') )');
});

ava.test('parseWhere, array, multi， or', t => {
  const instance = getParserInstance();
  const data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\''],
      'suredy',
      'OR'
    ]
  });
  t.is(data, ' WHERE ( (`title` = \'lizheming\') OR (`title` = \'suredy\') )');
});

ava.test('buildSelectSql', t => {
  const instance = getParserInstance();
  const data = instance.buildSelectSql({
    table: 'user',
    where: {
      id: 11,
      title: 'lizheming'
    },
    group: 'name',
    field: 'name,title',
    order: 'name DESC',
    limit: '10, 20',
    distinct: true
  });
  t.is(data, "SELECT DISTINCT `name`,`title` FROM `user` WHERE ( `id` = 11 ) AND ( `title` = 'lizheming' ) GROUP BY `name` ORDER BY name DESC LIMIT 10,20");
});

ava.test('parseSql', t => {
  const instance = getParserInstance({prefix: 'think_'});
  const data = instance.parseSql('SELECT * FROM __USER__ WHERE name=1');
  t.is(data, 'SELECT * FROM `think_user` WHERE name=1');
});

ava.test('parseSql 1', t => {
  const instance = getParserInstance({prefix: 'think_'});
  const data = instance.parseSql('SELECT * FROM __USER__ WHERE name=\'%TEST%\'');
  t.is(data, 'SELECT * FROM `think_user` WHERE name=\'%TEST%\'');
});

ava.test('parseUnion, empty', t => {
  const instance = getParserInstance({prefix: 'think_'});
  const data = instance.parseUnion();
  t.is(data, '');
});

ava.test('parseUnion, string', t => {
  const instance = getParserInstance({prefix: 'think_'});
  const data = instance.parseUnion('SELECT * FROM meinv_pic2');
  t.is(data, ' UNION (SELECT * FROM meinv_pic2)');
});

ava.test('parseUnion, object', t => {
  const instance = getParserInstance({prefix: 'think_'});
  const data = instance.parseUnion({table: 'meinv_pic2'});
  t.is(data, ' UNION (SELECT * FROM `meinv_pic2`)');
});

ava.test('parseUnion, object', t => {
  const instance = new Parser({prefix: 'think_'});
  const data = instance.parseUnion({table: 'meinv_pic2'});
  t.is(data, ' UNION (SELECT * FROM meinv_pic2)');
});

ava.test('parseUnion, array', t => {
  const instance = getParserInstance({prefix: 'think_'});
  const data = instance.parseUnion([{
    union: {table: 'meinv_pic2'},
    all: true
  }]);
  t.is(data, ' UNION ALL (SELECT * FROM `meinv_pic2`)');
});

ava.test('parseUnion, array', t => {
  const instance = getParserInstance({prefix: 'think_'});
  const data = instance.parseUnion([{
    union: 'SELECT * FROM meinv_pic2'
  }]);
  t.is(data, ' UNION (SELECT * FROM meinv_pic2)');
});
