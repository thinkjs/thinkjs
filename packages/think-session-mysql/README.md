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
    database:'think_test',
    prefix:'think_',
    host:'127.0.0.1',
    port:'3306',
    user:'root',
    password:''
  }
}
```

## Create Database
`think_` is the prefix in `adapter.js`
```
  DROP TABLE IF EXISTS `think_session`;
  CREATE TABLE `think_session` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `cookie` varchar(255) NOT NULL DEFAULT '',
    `data` text,
    `expire` bigint(11) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `cookie` (`cookie`),
    KEY `expire` (`expire`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
