## 2.0

### 参考文档

* http://laravel.com/docs/master/releases
* http://www.yiiframework.com/doc-2.0/yii-db-migration.html#createTable()-detail
* http://sailsjs.org/documentation/concepts/
* http://docs.mongodb.org/manual/reference/operator/query/ mongdb where condition
* http://docs.mongodb.org/manual/reference/sql-comparison/
* http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#count

### 遗留的问题

* validator需要改为laravel类似的方式，更加简洁 -- 已经完成 2015.08.07
* 服务启动时增加文件名大小写的检测 -- 已经完成 2015.08.08
* 完善mongodb -- 基于mongodb模块 -- 基本完成 2015.08.13
* 重写websocket -- 基本完成 2015.08.21
* 官网改版 -- 基本完成 2015.08.21
* 错误页面美化 -- 基本完成 2015.08.21
* ThinkJS创建项目的命令 - 已经完成 2015.08.25
* 添加csrf检测，cors头信息设置的middleware - 已经完成 2015.09.12
* cli模式下自动关闭socket的问题 - 已经完成 2015.09.15
* base基类修改 - 已经完成，添加 think.http.base 2015.09.22

* 完善relationModel
* 单元测试，代码覆盖率 >95%
* 关键功能写DEMO
* 在线文档
* ThinkJS T-shirt

* 增加migration功能？
* 打包个Vagrant环境?
* 添加think.crontab接口？
* grunt,gulp支持？


## 其他

### 启动mongodb

```
./mongod --dbpath=/data --port 27017
```




