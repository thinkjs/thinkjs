# think-session-mysql
Use Mysql to store session for ThinkJS


## Install

```
npm install think-session-mysql
```

## How to use

config file `src/config/adapter.js`, add options:

```js
const mysqlSession = require('think-session-mysql');
exports.session = {
  type: 'mysql',
  common: {
    cookie: {
      name: 'thinkjs',
      //maxAge: '',
      //expires: '',
      path: '/',  //a string indicating the path of the cookie
      //domain: '',
      //secure: false,
      //keys: [],
      httpOnly: true,
      sameSite: false,
      signed: false,
      overwrite: false
    }
  },
   mysql:{
    handle:mysqlSession,
    // optional config fields,merge model.mysql if empty
    database:'think_test',
    prefix:'think_',
    host:'127.0.0.1',
    port:'3306',
    user:'root',
    password:'',
    gcInterval: 3600 * 1000 //gc interval
  }
}
```

if some fields also in model config, you can use Spread Properties.

```js
const mysqlConfig = {
  database:'think_test',
  prefix:'think_',
  host:'127.0.0.1',
  port:'3306',
  user:'root',
  password:'',
}
exports.model = {
  type: 'mysql',
  mysql: {
    handle: mysqlModel,
    ...mysqlConfig
  }
}
exports.session = {
  type: 'mysql',
  mysql: {
    handle: mysqlSession,
    ...mysqlConfig
  }
}
```

## Create Database
`think_` is the prefix in `adapter.js`
```
CREATE TABLE `think_session` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cookie` varchar(255) NOT NULL DEFAULT '',
  `data` text,
  `expire` bigint(11) NOT NULL DEFAULT '0',
  `maxage` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cookie` (`cookie`),
  KEY `expire` (`expire`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
