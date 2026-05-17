# think-awesome

Awesome projects for `ThinkJS 3.x`

## Middlewares

| Package  | Author  | Version  |  Status | Coverage  | Description |
|---|---|---|---|---|---|
| [think-router](https://github.com/thinkjs/think-router) | [@lushijie](https://github.com/lushijie)  | ![version](https://img.shields.io/npm/v/think-router.svg)  |  ![](https://travis-ci.org/thinkjs/think-router.svg) | ![](https://coveralls.io/repos/github/thinkjs/think-router/badge.svg)  | Router Parser |
| [think-trace](https://github.com/thinkjs/think-trace)  | [@lizheming](https://github.com/lizheming)  | ![version](https://img.shields.io/npm/v/think-trace.svg)  |  ![](https://travis-ci.org/thinkjs/think-trace.svg) | ![](https://coveralls.io/repos/github/thinkjs/think-trace/badge.svg)  | Error trace |
| [think-payload](https://github.com/thinkjs/think-payload)  | [@berwin](https://github.com/berwin)  | ![version](https://img.shields.io/npm/v/think-payload.svg)  |  ![](https://travis-ci.org/thinkjs/think-payload.svg) | ![](https://coveralls.io/repos/github/thinkjs/think-payload/badge.svg)  | Parse body data |
| [think-meta](https://github.com/thinkjs/think-meta)  | [@welefen](https://github.com/welefen)  | ![version](https://img.shields.io/npm/v/think-meta.svg)  |  ![](https://travis-ci.org/thinkjs/think-meta.svg) | ![](https://coveralls.io/repos/github/thinkjs/think-meta/badge.svg)  | Show meta info |
| [think-logic](https://github.com/thinkjs/think-logic)  | [@toxic-johann](https://github.com/toxic-johann)  | ![version](https://img.shields.io/npm/v/think-logic.svg)  |  ![](https://travis-ci.org/thinkjs/think-logic.svg) | ![](https://coveralls.io/repos/github/thinkjs/think-logic/badge.svg)  | Invoke logic action |
| [think-controller](https://github.com/thinkjs/think-controller)  | [@toxic-johann](https://github.com/toxic-johann)  | ![version](https://img.shields.io/npm/v/think-logic.svg)  |  ![](https://travis-ci.org/thinkjs/think-controller.svg) | ![](https://coveralls.io/repos/github/thinkjs/think-controller/badge.svg)  | Invoke controller action |
| [think-wechat](https://github.com/akira-cn/think-wechat)  | [@akira-cn](https://github.com/akira-cn)  | ![version](https://img.shields.io/npm/v/think-wechat.svg)  |  ![](https://travis-ci.org/akira-cn/think-wechat.svg) | ![](https://coveralls.io/repos/github/akira-cn/think-wechat/badge.svg)  | wechat middleware |
| [think-swagger](https://github.com/libery/think-swagger)  | [@libery](https://github.com/libery)   | ![version](https://img.shields.io/npm/v/think-swagger-controller.svg)  |  ![](https://travis-ci.org/libery/think-swagger-controller.svg) | ![](https://coveralls.io/repos/github/libery/think-swagger-controller/badge.svg)  | swagger middleware |
| [think-qs](https://github.com/thinkjs/think-qs)  | [@welefen](https://github.com/welefen)  | ![version](https://img.shields.io/npm/v/think-qs.svg)  |  ![](https://travis-ci.org/thinkjs/think-qs.svg) | ![](https://coveralls.io/repos/github/thinkjs/think-qs/badge.svg)  | parse complex query data |

## Koa Middlewares

| Package  | Author  | Version  |  Status | downloads | Description |
|---|---|---|---|---|---|
| [kcors](https://github.com/koajs/cors) | [@fengmk2](https://github.com/fengmk2) | ![version](https://img.shields.io/npm/v/kcors.svg) | ![status](https://travis-ci.org/koajs/cors.svg) | ![downloads](https://img.shields.io/npm/dm/kcors.svg) | CORS middleware |
| [grant](https://github.com/simov/grant) | [@simov](https://github.com/simov) | ![version](https://img.shields.io/npm/v/grant.svg) | ![status](https://travis-ci.org/simov/grant.svg) | ![downloads](https://img.shields.io/npm/dm/grant.svg) | OAuth middleware |
| [koa-csrf](https://github.com/koajs/csrf) | [@jonathanong](https://github.com/jonathanong) | ![version](https://img.shields.io/npm/v/koa-csrf.svg) | ![status](https://travis-ci.org/koajs/csrf.svg) | ![downloads](https://img.shields.io/npm/dm/koa-csrf.svg) | CSRF tokens |
| [koa-helmet](https://github.com/venables/koa-helmet) | [@venables](https://github.com/venables) | ![version](https://img.shields.io/npm/v/koa-helmet.svg)| ![status](https://travis-ci.org/venables/koa-helmet.svg) | ![downloads](https://img.shields.io/npm/dm/koa-helmet.svg) | helmet middleware |
| [koa-ip-filter](https://github.com/charlike/koa-ip-filter) | [@charlike](https://github.com/charlike) | ![version](https://img.shields.io/npm/v/koa-ip-filter.svg) | ![status](https://travis-ci.org/charlike/koa-ip-filter.svg) | ![downloads](https://img.shields.io/npm/dm/koa-ip-filter.svg) | Ip filter middleware for koa |
| [koa-jwt](https://github.com/koajs/jwt) | [@sdd](https://github.com/sdd) | ![version](https://img.shields.io/npm/v/koa-jwt.svg) | ![status](https://travis-ci.org/koajs/jwt.svg) | ![downloads](https://img.shields.io/npm/dm/koa-jwt.svg) | JWT (JSON Web Tokens) verification |
| [koa-basic-auth](https://github.com/koajs/basic-auth) | [@tj](https://github.com/tj) | ![version](https://img.shields.io/npm/v/koa-basic-auth.svg) | ![status](https://travis-ci.org/koajs/basic-auth.svg) | ![downloads](https://img.shields.io/npm/dm/koa-basic-auth.svg) | blanket basic auth middleware |

## Adapters

### view
* [think-view-pug](https://github.com/thinkjs/think-view-pug) Use pug to render view files (pug is rename from jade)
* [think-view-nunjucks](https://github.com/thinkjs/think-view-nunjucks) Use nunjucks to render view files
* [think-view-handlebars](https://github.com/thinkjs/think-view-handlebars) Use handlebars to render view files
* [think-view-ejs](https://github.com/thinkjs/think-view-ejs) Use ejs to render view files
* [think-view-xtemplate](https://github.com/lizheming/think-view-xtemplate) Use xtemplate to render view files
* [think-view-opx](https://github.com/wj008/think-view-opx) Use sdopx to render view files
* [think-view-art](https://github.com/leo-enigma/think-view-art) Use art-template to render view files

### session
* [think-session-cookie](https://github.com/thinkjs/think-session-cookie) Use cookie to store session data
* [think-session-file](https://github.com/thinkjs/think-session-file) Use file to store session data
* [think-session-redis](https://github.com/thinkjs/think-session-redis) Use redis to store session data
* [think-session-jwt](https://github.com/thinkjs/think-session-jwt) Use jsonwebtoken to store session data
* [think-session-mysql](https://github.com/thinkjs/think-session-mysql) Use mysql to store session data

### cache
* [think-cache-file](https://github.com/thinkjs/think-cache-file) Use file to store cache data
* [think-cache-redis](https://github.com/thinkjs/think-cache-redis) Use redis to store cache data
* [think-cache-memcache](https://github.com/thinkjs/think-cache-memcache) Use memcache to store cache data

### model
* [think-model-abstract](https://github.com/thinkjs/think-model-abstract) Model adapter abstract class
* [think-model-mysql](https://github.com/thinkjs/think-model-mysql) Mysql adapter for model
* [think-model-sqlite](https://github.com/thinkjs/think-model-sqlite) Sqlite adapter for model
* [think-model-postgresql](https://github.com/thinkjs/think-model-postgresql) Postgresql adapter for model

### websocket

* [think-websocket-socket.io](https://github.com/thinkjs/think-websocket-socket.io) Socket.io adapter for websocket

## Extends

* [think-view](https://github.com/thinkjs/think-view) Add `display`, `render`, `assign` methods to controller.
* [think-email](https://github.com/thinkjs/think-email) Add `sendEmail` method to think, context, controller.
* [think-cache](https://github.com/thinkjs/think-cache) Add `cache` method to  think, context, controller.
* [think-session](https://github.com/thinkjs/think-session) Add `session` method to  think, context, controller.
* [think-fetch](https://github.com/thinkjs/think-fetch) Add `fetch` method to  think, context, controller, service.
* [think-model](https://github.com/thinkjs/think-model) Add `model` method to  think, context, controller, service. add `Model` to think.
* [think-websocket](https://github.com/thinkjs/think-websocket) Support websocket.
* [think-mongoose](https://github.com/thinkjs/think-mongoose) Wrap mongoose.
* [think-sequelize](https://github.com/thinkjs/think-sequelize) Wrap sequelize
* [think-i18n](https://github.com/thinkjs/think-i18n) A comprehensive I18N solution wraps Jed, Number(opt in) and Currency(opt in). Support flexible customize for text, number and currency per locale in a standard way.
* [think-eolinker-apishop](https://github.com/sls-open/think-eolinker-apishop) 对[eoLinker官方apishop](https://www.apishop.net/)提供的第三方API做的封装。
* [think-mock](https://github.com/thinkjs/think-mock) Mock data extend for ThinkJS

## Others

* [think-pagination](https://github.com/thinkjs/think-pagination) Pagination for ThinkJS 3.x
* [think-ueditor](https://github.com/uedkx/think-ueditor) Ueditor configuration for ThinkJS 3
* [think-redis](https://github.com/thinkjs/think-redis) Wrap [ioredis](https://github.com/luin/ioredis)
* [think-svg-captcha](https://github.com/thinkjs/think-svg-captcha) Generate svg captcha.
* [think-memcache](https://github.com/thinkjs/think-memcache) Wrap memcache.
* [think-hashids](https://github.com/weihongyu12/think-hashids) Generate a short unique ID from the integer for ThinkJS
* [think-purify](https://github.com/weihongyu12/think-purify) Use the HTML5 Purify extension in ThinkJS
* [think-esapi](https://github.com/weihongyu12/think-esapi) An ESAPI(Enterprise Security API) extend for ThinkJS

## Projects by ThinkJS

* [在线书签管理系统](https://github.com/luchenqun/my-bookmark) - 一款后端基于ThinkJS+MySQL前端基于AngularJS 的在线书签管理系统
* [360 静态资源托管库](https://cdn.baomitu.com/) - 托管前端常见的静态资源库，支持 HTTP2
* [360 移动开发者中心](https://dc.360.cn/) - 提供推送、Replugin、代码检查等移动开发服务
* [众成翻译](http://zcfy.cc/) - 中国最好的技术翻译社区，最懂译者的翻译平台
* [爆米兔](http://www.baomitu.com/) - 小而美的 H5 创意制作平台
* [声享](https://ppt.baomitu.com/) - 免费在线制作有声 PPT
* [Firekylin](https://github.com/firekylin/firekylin) - A Simple & Fast Node.js Blogging Platform Base On ThinkJS & React & ES2015+
* [CMSWing](https://github.com/arterli/CmsWing) - 一款功能强大的（PC端、手机端和微信公众平台）电子商务平台及 CMS 建站系统
* [thinkjsplus](https://github.com/wuyanwen/thinkjsplus) - 一款基于 ThinkJS 3 从入门到实践的记事本项目，很适合新手实战
* [NideShop](https://github.com/tumobi/nideshop) - 基于 ThinkJS+MySQL 开发的开源微信小程序商城
* [CmPage](https://gitee.com/defans/cmpage) - 企业信息化开发框架，包括账套、用户权限等管理模块，轻量级工作流引擎，以及业务模块的快速开发等
* [weekly](https://github.com/saucxs/weekly) - 周报系统，企业管理系统，各级负责人（4级权限控制）向上汇报每周工作和完成情况，以及下属的统计情况，适合新手学习。
----
If you have projects created by ThinkJS, please pull request.
