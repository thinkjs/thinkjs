## 文档

详细文档请见 <http://thinkjs.org/doc.html>

## 2.0需要改进的功能

### 强化websocket，封装socket.io, sockjs等几种常用的websocket库

1.x的websocket是基于websocket-driver模块来实现的，没有对应的浏览器端js库，有些用户可能不习惯。他们还是想直接用成熟的socket.io之类的库。

可以针对这些库做个adapter支持。

### 强化ORM, 支持mysql, mongodb等多种数据库

可以考虑使用一个第三方的orm库

### 强化Rest

1.x里支持rest需要在route.js里添加配置，不太友好。

可以根据识别哪些controller是继承rest.js来判断

### 完善单元测试，官网，文档。多写DEMO

一定要多谢demo

文档改版，支持单一页面查看方式。更改文档书写格式，分为使用和开发2种

### 支持generator function 

thinkjs代码里使用任何的generator代码，但需要支持项目里的generator代码。

调用项目里的方法或者函数时，通过下面的方式包装:

```
var appFn = function*(){}
var fn = think.co.wrap(appFn);
fn(arg1, arg2).then(function(data){
    
})
//如果appFn是一个类的方法，则需要重新bind this
fn.bind(instance)(arg1, arg2).then(function(data){
    
})
//或者通过call也可以
var fn = think.co.wrap.call(instance, appFn);
```

### 去除全局变量

已经去除，但thinkit模块下的方法是否写如到全局变量中可以通过一个配置来判断。

### 服务启动时自动安装缺少的依赖库 

有些依赖的模块并不在依赖列表里，这样可以减少安装thinkjs所花的时间。但如果用户改了配置后，在服务启动时，需要自动安装依赖模块

### 支持国际化

添加common/config/local/en.js配置，各个模块下是否需要支持这样的配置？

### 考虑移动端的支持方式，换module?

可以加个middleware，通过配置自动更换module

### 对1.x系统的兼容方案

主要是全局变量和一些接口调用的问题

### tag -> hook, behavior -> middleware, driver -> adapter

将tag修改为hook, 并提供think.hook 和 this.hook方法

behavior改为middleware，因为express里都是叫middleware，并且thinkjs里的功能与之类似，使用middleware容易被接受

driver改为adapter，改为adapter更合适一些

### think.config, this.config

支持模块下有独立的config文件，主要是让不同模块下可以自动调用不同的config。所以的配置在服务启动时直接读到内存中，避免用户请求时在产生文件io。

### 打包支持, grunt gulp

提供一套给grunt或者gulp的打包配置，方便外面的用户使用

### 权限认证

1.x里有auth.js，需要对其完善，并且可以支持其他类型的权限认证。

添加一个adapter

### 增加文件名检测机制

windows和mac文件名不区分大小写，但linux区分。需要增加文件名大小检测的机制。

避免上线后才出现文件找不到的情况。


## 2.0开发规范

* 缩进使用2个空格，文件顶部添加`use strict`
* 文件名全部使用小写和下划线
* 所有代码都要写单元测试
* 所有注释必须使用英文
