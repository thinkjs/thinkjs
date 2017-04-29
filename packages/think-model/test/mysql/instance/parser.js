const ava = require('ava');
const helper = require('think-helper');
const Parser = require('../../../src/mysql/instance/parser');

ava.test('init', ('init', t => {
  t.plan(2);
  var instance = new Parser();
  var keys = Object.keys(instance.comparison).sort();
  t.deepEqual(keys, [ '<>','EGT','ELT','EQ','GT','IN','LIKE','LT','NEQ','NOTIN','NOTLIKE' ]);
  t.is(instance.selectSql, '%EXPLAIN%SELECT%DISTINCT% %FIELD% FROM %TABLE%%JOIN%%WHERE%%GROUP%%HAVING%%ORDER%%LIMIT%%UNION%%COMMENT%');
}));

ava.test('parseExplain', t => {
  var instance = new Parser();
  var data = instance.parseExplain();
  t.is(data, '');
});

ava.test('parseExplain true', t => {
  var instance = new Parser();
  var data = instance.parseExplain(true);
  t.is(data, "EXPLAIN ");
});

ava.test('parseSet', t => {
  var instance = new Parser();
  var data = instance.parseSet({
    name: 'lizheming'
  });
  t.is(data, " SET name='lizheming'");
});

ava.test('parseSet, has extra value', t => {
  var instance = new Parser();
  var data = instance.parseSet({
    name: 'lizheming',
    value: ['array']
  });
  t.is(data, " SET name='lizheming'");
});

ava.test('parseSet, empty', t => {
  var instance = new Parser();
  var data = instance.parseSet()
  t.is(data, "");
});

ava.test('parseKey is function', t => {
  var instance = new Parser();
  var key = instance.parseKey('key');
  t.is(key, 'key')
});

ava.test('parseValue, string', t => {
  var instance = new Parser();
  var key = instance.parseValue('key');
  t.is(key, "'key'")
});

ava.test('parseValue, array, exp', t => {
  var instance = new Parser();
  var key = instance.parseValue(['exp', 'lizheming']);
  t.is(key, "lizheming")
});

ava.test('parseValue, null', t => {
  var instance = new Parser();
  var key = instance.parseValue(null);
  t.is(key, "null")
});

ava.test('parseValue, boolean, true', t => {
  var instance = new Parser();
  var key = instance.parseValue(true);
  t.is(key, "1")
});

ava.test('parseValue, boolean, false', t => {
  var instance = new Parser();
  var key = instance.parseValue(false);
  t.is(key, "0")
});

ava.test('parseValue, object', t => {
  var instance = new Parser();
  var key = instance.parseValue({});
  t.deepEqual(key, {});
});

ava.test('parseField, empty', t => {
  var instance = new Parser();
  var key = instance.parseField();
  t.deepEqual(key, '*')
});

ava.test('parseField, single field', t => {
  var instance = new Parser();
  var key = instance.parseField('name');
  t.deepEqual(key, 'name')
});

ava.test('parseField, multi field', t => {
  var instance = new Parser();
  var key = instance.parseField('name,title');
  t.deepEqual(key, 'name,title')
});

ava.test('parseField, multi field', t => {
  var instance = new Parser();
  var key = instance.parseField('name, title');
  t.deepEqual(key, 'name,title')
});

ava.test('parseField, object', t => {
  var instance = new Parser();
  var key = instance.parseField({
    name: 'name',
    title1: 'title'
  });
  t.deepEqual(key, 'name AS name,title1 AS title')
});

ava.test('parseTable, empty', t => {
  var instance = new Parser();
  var key = instance.parseTable();
  t.deepEqual(key, '')
});

ava.test('parseTable, string', t => {
  var instance = new Parser();
  var key = instance.parseTable('user');
  t.deepEqual(key, 'user')
});

ava.test('parseTable, string, multi', t => {
  var instance = new Parser();
  var key = instance.parseTable('user, group');
  t.deepEqual(key, 'user,group')
});

ava.test('parseTable, object', t => {
  var instance = new Parser();
  var key = instance.parseTable({
    user: 'user1',
    group: 'group1'
  });
  t.deepEqual(key, 'user AS user1,group AS group1')
});

ava.test('getLogic', t => {
  var instance = new Parser();
  var key = instance.getLogic({});
  t.deepEqual(key, 'AND')
});

ava.test('getLogic, has _logic', t => {
  var instance = new Parser();
  var key = instance.getLogic({
    _logic: 'OR'
  });
  t.deepEqual(key, 'OR')
});

ava.test('getLogic, has _logic, error', t => {
  var instance = new Parser();
  var key = instance.getLogic({
    _logic: 'test'
  });
  t.deepEqual(key, 'AND')
});

ava.test('getLogic, default is OR', t => {
  var instance = new Parser();
  var key = instance.getLogic({}, 'OR');
  t.deepEqual(key, 'OR')
});

ava.test('getLogic, string', t => {
  var instance = new Parser();
  var key = instance.getLogic('AND', 'OR');
  t.deepEqual(key, 'AND')
});

ava.test('getLogic, string, lowercase', t => {
  var instance = new Parser();
  var key = instance.getLogic('and', 'OR');
  t.deepEqual(key, 'AND')
});

ava.test('escapeString is function', t => {
  var instance = new Parser();
  t.true(helper.isFunction(instance.escapeString));
});

ava.test('parseLock, empty', t => {
  var instance = new Parser();
  var data = instance.parseLock();
  t.is(data, '');
});

ava.test('parseLock, true', t => {
  var instance = new Parser();
  var data = instance.parseLock(true);
  t.is(data, ' FOR UPDATE ');
});

ava.test('parseDistinct, empty', t => {
  var instance = new Parser();
  var data = instance.parseDistinct();
  t.is(data, '');
});

ava.test('parseDistinct, true', t => {
  var instance = new Parser();
  var data = instance.parseDistinct(true);
  t.is(data, ' DISTINCT');
});

ava.test('parseComment, empty', t => {
  var instance = new Parser();
  var data = instance.parseComment();
  t.is(data, '');
});

ava.test('parseComment, lizheming test', t => {
  var instance = new Parser();
  var data = instance.parseComment('lizheming test');
  t.is(data, ' /*lizheming test*/');
});

ava.test('parseHaving, empty', t => {
  var instance = new Parser();
  var data = instance.parseHaving();
  t.is(data, '');
});

ava.test('parseHaving, SUM(area)>1000000', t => {
  var instance = new Parser();
  var data = instance.parseHaving('SUM(area)>1000000');
  t.is(data, ' HAVING SUM(area)>1000000');
});

ava.test('parseGroup, empty', t => {
  var instance = new Parser();
  var data = instance.parseGroup();
  t.is(data, '');
});

ava.test('parseGroup, name', t => {
  var instance = new Parser();
  var data = instance.parseGroup('name');
  t.is(data, ' GROUP BY `name`');
});

ava.test('parseGroup, name', t => {
  var instance = new Parser();
  var data = instance.parseGroup("date_format(create_time,'%Y-%m-%d')");
  t.is(data, " GROUP BY date_format(create_time,'%Y-%m-%d')");
});

ava.test('parseGroup, name,title', t => {
  var instance = new Parser();
  var data = instance.parseGroup('name, title');
  t.is(data, ' GROUP BY `name`,`title`');
});

ava.test('parseGroup, user.name,title', t => {
  var instance = new Parser();
  var data = instance.parseGroup(['user.name', 'title']);
  t.is(data, ' GROUP BY user.`name`,`title`');
});

ava.test('parseOrder, empty', t => {
  var instance = new Parser();
  var data = instance.parseOrder();
  t.is(data, '');
});

ava.test('parseOrder, array', t => {
  var instance = new Parser();
  var data = instance.parseOrder(['name ASC', 'title DESC']);
  t.is(data, ' ORDER BY name ASC,title DESC');
});

ava.test('parseOrder, string', t => {
  var instance = new Parser();
  var data = instance.parseOrder('name ASC,title DESC');
  t.is(data, ' ORDER BY name ASC,title DESC');
});

ava.test('parseOrder, object', t => {
  var instance = new Parser();
  var data = instance.parseOrder({name: 'ASC', 'title': 'DESC'});
  t.is(data, ' ORDER BY name ASC,title DESC');
});

ava.test('parseLimit, empty', t => {
  var instance = new Parser();
  var data = instance.parseLimit();
  t.is(data, '');
});

ava.test('parseLimit, 10', t => {
  var instance = new Parser();
  var data = instance.parseLimit('10');
  t.is(data, ' LIMIT 10');
});

ava.test('parseLimit, number', t => {
  var instance = new Parser();
  var data = instance.parseLimit(10);
  t.is(data, ' LIMIT 10');
});

ava.test('parseLimit, 10, 20', t => {
  var instance = new Parser();
  var data = instance.parseLimit('10, 20');
  t.is(data, ' LIMIT 10,20');
});

ava.test('parseLimit, 10, lizheming', t => {
  var instance = new Parser();
  var data = instance.parseLimit('10, lizheming');
  t.is(data, ' LIMIT 10,0');
});

ava.test('parseLimit, [20, 10]', t => {
  var instance = new Parser();
  var data = instance.parseLimit([20, 10]);
  t.is(data, ' LIMIT 20,10');
});

ava.test('parseJoin, empty', t => {
  var instance = new Parser();
  var data = instance.parseJoin();
  t.is(data, '');
});

ava.test('parseJoin, single string', t => {
  var instance = new Parser();
  var data = instance.parseJoin('meinv_cate ON meinv_group.cate_id=meinv_cate.id');
  t.is(data, ' LEFT JOIN meinv_cate ON meinv_group.cate_id=meinv_cate.id');
});

ava.test('parseJoin, multi string', t => {
  var instance = new Parser();
  var data = instance.parseJoin(['meinv_cate ON meinv_group.cate_id=meinv_cate.id', 'RIGHT JOIN meinv_tag ON meinv_group.tag_id=meinv_tag.id']);
  t.is(data, ' LEFT JOIN meinv_cate ON meinv_group.cate_id=meinv_cate.id RIGHT JOIN meinv_tag ON meinv_group.tag_id=meinv_tag.id');
});

ava.test('parseJoin, array', t => {
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseJoin([{
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
  var instance = new Parser();
  var data = instance.parseThinkWhere('', 'SELECT * FROM user');
  t.is(data, '')
});

ava.test('parseThinkWhere, _string', t => {
  var instance = new Parser();
  var data = instance.parseThinkWhere('_string', 'SELECT * FROM user');
  t.is(data, 'SELECT * FROM user')
});

ava.test('parseThinkWhere, _query', t => {
  var instance = new Parser();
  var data = instance.parseThinkWhere('_query', 'name=lizheming&name1=suredy');
  t.is(data, 'name = \'lizheming\' AND name1 = \'suredy\'')
});

ava.test('parseThinkWhere, _query, with logic', t => {
  var instance = new Parser();
  var data = instance.parseThinkWhere('_query', 'name=lizheming&name1=suredy&_logic=OR');
  t.is(data, 'name = \'lizheming\' OR name1 = \'suredy\'')
});

ava.test('parseThinkWhere, _query, object', t => {
  var instance = new Parser();
  var data = instance.parseThinkWhere('_query', {name: 'lizheming', name1: 'suredy'});
  t.is(data, 'name = \'lizheming\' AND name1 = \'suredy\'')
});

ava.test('parseWhere, empty', t => {
  var instance = new Parser();
  var data = instance.parseWhere();
  t.is(data, '')
});

ava.test('parseWhere, empty 1', t => {
  var instance = new Parser();
  var data = instance.parseWhere({_logic: 'AND'});
  t.is(data, '')
});

ava.test('parseWhere, 1=1', t => {
  var instance = new Parser();
  var data = instance.parseWhere({1: 1});
  t.is(data, ' WHERE ( 1 = 1 )')
});

ava.test('parseWhere, key is not valid', t => {
  var instance = new Parser();
  try{
    var data = instance.parseWhere({'&*&*&*': 'title'});
    t.fail('parseWhere fail without error when key is not valid');
  }catch(e){
    t.pass();
  }
});

ava.test('parseWhere, string & object', t => {
  var instance = new Parser();
  var data = instance.parseWhere({title: 'lizheming', _string: 'status=1'});
  t.is(data, ' WHERE ( title = \'lizheming\' ) AND ( status=1 )')
});

ava.test('parseWhere, null', t => {
  var instance = new Parser();
  var data = instance.parseWhere({title: null});
  t.is(data, ' WHERE ( title IS NULL )')
});

ava.test('parseWhere, null 1', t => {
  var instance = new Parser();
  var data = instance.parseWhere({title: {'=': null}});
  t.is(data, ' WHERE ( title IS NULL )')
});

ava.test('parseWhere, null 2', t => {
  var instance = new Parser();
  var data = instance.parseWhere({title: ['=', null]});
  t.is(data, ' WHERE ( title IS NULL )')
});

ava.test('parseWhere, not null', t => {
  var instance = new Parser();
  var data = instance.parseWhere({title: {'!=': null}});
  t.is(data, ' WHERE ( title IS NOT NULL )')
});

ava.test('parseWhere, not null 1', t => {
  var instance = new Parser();
  var data = instance.parseWhere({title: ['!=', null]});
  t.is(data, ' WHERE ( title IS NOT NULL )')
});

ava.test('parseWhere, object', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: 10});
  t.is(data, ' WHERE ( id = 10 )')
});

ava.test('parseWhere, object IN number', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: {IN: [1,2,3]}});
  t.is(data, ' WHERE ( id IN (1, 2, 3) )')
});

ava.test('parseWhere, IN number string', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: [1,2,3]});
  t.is(data, ' WHERE ( id IN ( 1, 2, 3 ) )')
});

ava.test('parseWhere, object 1', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: [1, 10, 'string']});
  t.is(data, ' WHERE ( (id = 1) AND (id = 10) AND (id = \'string\') )')
});

ava.test('parseWhere, IN number string', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: ['1','2','3']});
  t.is(data, ' WHERE ( id IN ( 1, 2, 3 ) )')
});

ava.test('parseWhere, object IN number string', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: {IN: ['1','2','3']}});
  t.is(data, ' WHERE ( id IN (\'1\', \'2\', \'3\') )')
});

ava.test('parseWhere, object 1', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: ['!=', 10]});
  t.is(data, ' WHERE ( id != 10 )')
});

ava.test('parseWhere, string', t => {
  var instance = new Parser();
  var data = instance.parseWhere('id = 10 OR id < 2');
  t.is(data, ' WHERE id = 10 OR id < 2')
});

ava.test('parseWhere, EXP', t => {
  var instance = new Parser();
  var data = instance.parseWhere({name: ['EXP', "='name'"]});
  t.is(data, ' WHERE ( (name =\'name\') )')
});

ava.test('parseWhere, EXP 1', t => {
  var instance = new Parser();
  var data = instance.parseWhere({view_nums: ['EXP', 'view_nums+1']});
  t.is(data, ' WHERE ( (view_nums view_nums+1) )')
});

ava.test('parseWhere, LIKE', t => {
  var instance = new Parser();
  var data = instance.parseWhere({title: ['NOTLIKE', 'lizheming']});
  t.is(data, ' WHERE ( title NOT LIKE \'lizheming\' )')
});

ava.test('parseWhere, LIKE 1', t => {
  var instance = new Parser();
  var data = instance.parseWhere({title: ['like', '%lizheming%']});
  t.is(data, ' WHERE ( title LIKE \'%lizheming%\' )')
});

ava.test('parseWhere, LIKE 2', t => {
  var instance = new Parser();
  var data = instance.parseWhere({title: ['like', ['lizheming', 'suredy']]});
  t.is(data, ' WHERE ( (title LIKE \'lizheming\' OR title LIKE \'suredy\') )')
});

ava.test('parseWhere, LIKE 3', t => {
  var instance = new Parser();
  var data = instance.parseWhere({title: ['like', ['lizheming', 'suredy'], 'AND']});
  t.is(data, ' WHERE ( (title LIKE \'lizheming\' AND title LIKE \'suredy\') )')
});

ava.test('parseWhere, key has |', t => {
  var instance = new Parser();
  var data = instance.parseWhere({'title|content': ['like', '%lizheming%']});
  t.is(data, ' WHERE ( (title LIKE \'%lizheming%\') OR (content LIKE \'%lizheming%\') )')
});

ava.test('parseWhere, key has |, multi', t => {
  var instance = new Parser();
  var data = instance.parseWhere({
    'title|content': [
      ['like', '%title%'], ['=', '%content%']
    ],
    _multi: true
  });
  t.is(data, ' WHERE ( (title LIKE \'%title%\') OR (content = \'%content%\') )')
});

ava.test('parseWhere, key has |, multi', t => {
  var instance = new Parser();
  var data = instance.parseWhere({
    'title|content': [
      ['like', '%title%'], ['=', '%content%']
    ],
    _multi: true
  });
  t.is(data, ' WHERE ( (title LIKE \'%title%\') OR (content = \'%content%\') )')
});

ava.test('parseWhere, key has &', t => {
  var instance = new Parser();
  var data = instance.parseWhere({'title&content': ['like', '%lizheming%']});
  t.is(data, ' WHERE ( (title LIKE \'%lizheming%\') AND (content LIKE \'%lizheming%\') )')
});

ava.test('parseWhere, key has &, multi', t => {
  var instance = new Parser();
  var data = instance.parseWhere({
    'title&content': [
      ['like', '%lizheming%'],
      ['!=', '%content%'],
    ],
    _multi: true
  });
  t.is(data, ' WHERE ( (title LIKE \'%lizheming%\') AND (content != \'%content%\') )')
});

ava.test('parseWhere, IN', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: ['IN', '10,20']});
  t.is(data, ' WHERE ( id IN (\'10\',\'20\') )')
});

ava.test('parseWhere, IN 1', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: ['IN', [10, 20]]});
  t.is(data, ' WHERE ( id IN (10,20) )')
});

ava.test('parseWhere, IN 2', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: ['NOTIN', [10, 20]]});
  t.is(data, ' WHERE ( id NOT IN (10,20) )')
});

ava.test('parseWhere, NOT IN, only one', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: ['NOTIN', 10]});
  t.is(data, ' WHERE ( id != 10 )')
});

ava.test('parseWhere, IN, only one', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: ['IN', 10]});
  t.is(data, ' WHERE ( id = 10 )')
});

ava.test('parseWhere, IN, object', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: {IN: [1, 2, 3]}});
  t.is(data, ' WHERE ( id IN (1, 2, 3) )')
});

ava.test('parseWhere, IN, has exp', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: ['NOTIN', '(10,20,30)', 'exp']});
  t.is(data, ' WHERE ( id NOT IN (10,20,30) )')
});

ava.test('parseWhere, multi fields', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: 10, title: "www"});
  t.is(data, ' WHERE ( id = 10 ) AND ( title = \'www\' )')
});

ava.test('parseWhere, multi fields 1', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: 10, title: "www", _logic: 'OR'});
  t.is(data, ' WHERE ( id = 10 ) OR ( title = \'www\' )')
});

ava.test('parseWhere, multi fields 2', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: 10, title: "www", _logic: 'XOR'});
  t.is(data, ' WHERE ( id = 10 ) XOR ( title = \'www\' )')
});

ava.test('parseWhere, BETWEEN', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: ['BETWEEN', 1, 2]});
  t.is(data, ' WHERE (  (id BETWEEN 1 AND 2) )')
});

ava.test('parseWhere, BETWEEN', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: ['BETWEEN', '2017-04-13 00:00:00', '2017-04-19 00:00:00']});
  t.is(data, ' WHERE (  (id BETWEEN \'2017-04-13 00:00:00\' AND \'2017-04-19 00:00:00\') )')
});

ava.test('parseWhere, BETWEEN', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: ['between', '1,2']});
  t.is(data, ' WHERE (  (id BETWEEN \'1\' AND \'2\') )')
});

ava.test('parseWhere, complex', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: {
    '>': 10,
    '<': 20
  }});
  t.is(data, ' WHERE ( id > 10 AND id < 20 )')
});

ava.test('parseWhere, complex 1', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: {
    '>': 10,
    '<': 20,
    _logic: 'OR'
  }});
  t.is(data, ' WHERE ( id > 10 OR id < 20 )')
});

ava.test('parseWhere, complex 2', t => {
  var instance = new Parser();
  var data = instance.parseWhere({id: {
    '>=': 10,
    '<=': 20
  }, 'title': ['like', '%lizheming%'], date: ['>', '2014-08-12'], _logic: 'OR'});
  t.is(data, ' WHERE ( id >= 10 AND id <= 20 ) OR ( title LIKE \'%lizheming%\' ) OR ( date > \'2014-08-12\' )')
});

ava.test('parseWhere, complex 3', t => {
  var instance = new Parser();
  var data = instance.parseWhere({
    title: 'test',
    _complex: {
      id: ['IN', [1, 2, 3]],
      content: 'www',
      _logic: 'or'
    }
  });
  t.is(data, ' WHERE ( title = \'test\' ) AND (  ( id IN (1,2,3) ) OR ( content = \'www\' ) )')
});

ava.test('parseWhere, other', t => {
  var instance = new Parser();
  try{
    var data = instance.parseWhere({
      title: ['OTHER', 'dd']
    });
    t.fail('parseWhere fail without error when other data');
  }catch(e){
    t.pass();
  }
});

ava.test('parseWhere, array', t => {
  var instance = new Parser();
  var data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\'']
    ],
  });
  t.is(data, ' WHERE ( (title = \'lizheming\') )')
});

ava.test('parseWhere, array, multi', t => {
  var instance = new Parser();
  var data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\''],
      ['=', 'suredy']
    ],
  });
  t.is(data, ' WHERE ( (title = \'lizheming\') AND (title = \'suredy\') )')
});

ava.test('parseWhere, array, multi， or', t => {
  var instance = new Parser();
  var data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\''],
      ['=', 'suredy'],
      'OR'
    ],
  });
  t.is(data, ' WHERE ( (title = \'lizheming\') OR (title = \'suredy\') )')
});

ava.test('parseWhere, array, multi， or', t => {
  var instance = new Parser();
  var data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\''],
      ['!=', 'suredy'],
      'OR'
    ],
  });
  t.is(data, ' WHERE ( (title = \'lizheming\') OR (title != \'suredy\') )')
});

ava.test('parseWhere, array, multi， or', t => {
  var instance = new Parser();
  var data = instance.parseWhere({
    title: [
      ['exp', '= \'lizheming\''],
      'suredy',
      'OR'
    ],
  });
  t.is(data, ' WHERE ( (title = \'lizheming\') OR (title = \'suredy\') )')
});

ava.test('buildSelectSql', t => {
  var instance = new Parser();
  var data = instance.buildSelectSql({
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
  t.is(data, "SELECT DISTINCT name,title FROM user WHERE ( id = 11 ) AND ( title = 'lizheming' ) GROUP BY `name` ORDER BY name DESC LIMIT 10,20")
});

ava.test('parseSql', t => {
  var instance = new Parser({prefix: 'think_'});
  var data = instance.parseSql('SELECT * FROM __USER__ WHERE name=1');
  t.is(data, 'SELECT * FROM `think_user` WHERE name=1')
});

ava.test('parseSql 1', t => {
  var instance = new Parser({prefix: 'think_'});
  var data = instance.parseSql('SELECT * FROM __USER__ WHERE name=\'%TEST%\'');
  t.is(data, 'SELECT * FROM `think_user` WHERE name=\'%TEST%\'')
});

ava.test('parseUnion, empty', t => {
  var instance = new Parser({prefix: 'think_'});
  var data = instance.parseUnion();
  t.is(data, '')
});

ava.test('parseUnion, string', t => {
  var instance = new Parser({prefix: 'think_'});
  var data = instance.parseUnion('SELECT * FROM meinv_pic2');
  t.is(data, ' UNION (SELECT * FROM meinv_pic2)')
});

ava.test('parseUnion, object', t => {
  var instance = new Parser({prefix: 'think_'});
  var data = instance.parseUnion({table: 'meinv_pic2'});
  t.is(data, ' UNION (SELECT * FROM meinv_pic2)')
});

ava.test('parseUnion, array', t => {
  var instance = new Parser({prefix: 'think_'});
  var data = instance.parseUnion([{
    union: {table: 'meinv_pic2'},
    all: true
  }]);
  t.is(data, ' UNION ALL (SELECT * FROM meinv_pic2)')
});

ava.test('parseUnion, array', t => {
  var instance = new Parser({prefix: 'think_'});
  var data = instance.parseUnion([{
    union: 'SELECT * FROM meinv_pic2',
  }]);
  t.is(data, ' UNION (SELECT * FROM meinv_pic2)')
});