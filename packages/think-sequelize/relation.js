/*
* @Author: lushijie
* @Date:   2017-08-27 22:15:13
* @Last Modified by:   lushijie
* @Last Modified time: 2017-11-03 10:44:58
*/
const Sequelize = require('sequelize');
console.log(Sequelize.QueryTypes);
function getDataValues(obj) {
  Object.keys(obj).forEach(e => {
    if(obj[e] && obj[e].dataValues) {
      obj[e] = obj[e].dataValues;
      getDataValues(obj[e]);
    }
  });
  return obj;
}

let sequelize = new Sequelize('think-demo', 'root', 'root', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

let User = sequelize.define('user', {
  firstName: {
    type: Sequelize.STRING,
    field: 'first_name' // Will result in an attribute that is firstName when user facing but first_name in the database
  },
  lastName: {
    type: Sequelize.STRING
  }
}, {
  freezeTableName: true, // Model 对应的表名将与model名相同
  getterMethods: {
    fullName() {
      return this.firstName + ' ' + this.lastName
    }
  },
});

// User.sync({force: true}).then(function () {
//   // 已创建数据表
//   return User.create({
//     firstName: 'John',
//     lastName: 'Hancock'
//   });
// });
// const user = User.build({firstName: 'Shijie', lastName: 'Lu'})
// console.log( user.get('fullName') );

// (async () => {
//   let result = (await User.findOne());
//   console.log(result.fullName);
// })();


let player = sequelize.define('player',
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true
    },
    teamId: Sequelize.BIGINT, // belongsTo, 为当前模型添加外键
    name: Sequelize.STRING(255),
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'think_player',
  }
);


let team = sequelize.define('team',
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true
    },
    name: Sequelize.STRING(255),
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'think_team',
  }
);

sequelize.define('team',
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true
    },
    name: Sequelize.STRING(255),
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'think_team'
  }
);



// belongsTo -为当前模型添加外键，并以单数关系混入到源模型
// 1个player属于1个team
// player.belongsTo(team);
player.belongsTo(team, {
  as: 'team',
  foreignKey: 'teamId'
});

player.belongsTo(team, {
  as: 'team',
  foreignKey: 'teamId'
});

(async () => {
  console.log(
    getDataValues(await player.findAll({
      include: [
        // { model: team }
        { model: team, as: 'team' }
      ]
    }))
  );
})();

/*
let partner = sequelize.define('partner',
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true
    },
    playerId: Sequelize.BIGINT, // hasOne添加外键到partner
    name: Sequelize.STRING(255),
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'think_partner',
  }
);
// // hasOne - 添加外键到目标模型，并以单数关系混入到源模型,
// // 1个player拥有1个搭档
// player.hasOne(partner);
// (async () => {
//   console.log(
//     getDataValues(await player.findAll({
//       include: [
//         { model: partner }
//       ]
//     }))
//   );
// })();

let trophy = sequelize.define('trophy',
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true
    },
    playerId: Sequelize.BIGINT, // hasMany - 添加外键到目标模型
    name: Sequelize.STRING(255),
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'think_trophy',
  }
);

// // hasMany - 添加外键到目标模型，并以复数关系混入到源模型
// // 1个player拥有多个奖杯
// player.hasMany(trophy);
// (async () => {
//   console.log(
//     getDataValues(await player.findAll({
//       include: [
//         { model: trophy }
//       ]
//     }))
//   );
// })();

let teacher = sequelize.define('teacher',
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true
    },
    name: Sequelize.STRING(255),
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'think_teacher',
  }
);

let teacher_player = sequelize.define('teacher_player',
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true
    },
    playerId: Sequelize.BIGINT,
    teacherId: Sequelize.BIGINT,
  }, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'think_teacher_player',
  }
);

// belongsToMany - 为连接的表创建N:M关系并以复数关系混入到源模型。会通过sourceId和targetId创建交叉表。
// 1个player属于多个俱乐部，一个俱乐部拥有多个player
// player.belongsToMany(teacher, { through: teacher_player });
// (async () => {
//   console.log(
//     getDataValues(await player.findAll({
//       include: [
//         { model: teacher }
//       ]
//     }))
//   );
// })();
*/
