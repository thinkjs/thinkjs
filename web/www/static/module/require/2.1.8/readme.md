## 使用说明

### 外链形式

```html
<script src="{{src}}"></script>
```

### 线上外链

1、包含 `jQuery1.10.2`、`json2.js`、`require2.1.8` 的 CDN 地址如下：

```html
<script src="http://s0.qhimg.com/static/8b15829770ad1a0f/jquery,require.js"></script>
```

2、包含 `jQuery1.10.2`、`json2.js`、`require2.1.8`、[`QW.Core`](detail.html?name=QW.Core) 的 CDN 地址如下：

```html
<script src="http://s0.qhimg.com/static/6dee1b004b2a2496/jquery,require,qw.core.js"></script>
```

3、包含 `jQuery1.9.1`、`json2.js`、`require2.1.8` 的 CDN 地址如下：

```html
<script src="http://s0.qhimg.com/static/1225d7874dae7749/jquery,require.js"></script>
```

----

4、包含 `jQuery1.9.1`、`json2.js`、`require2.1.8`、[`QW.Core`](detail.html?name=QW.Core&path=qwrap-core/1.1.5&ver=1.1.5) 的 CDN 地址如下：

```html
<script src="http://s0.qhimg.com/static/0d263806316d6fa0/jquery,require,qw.core.js"></script>
```

### 模块化加载

`qiwoo` 约定：RequireJS 只能外链形式引入。

## 文档参考

定义模块：
```js
//my/shirt.js now does setup work
//before returning its module definition.
define(function () {
    //Do setup work here

    return {
        color: "black",
        size: "unisize"
    }
});
```

使用模块：
```js
require(['my/shirt'], function(Shirt) {
	console.log(Shirt.color);
});
```

完整使用请参考以下文档：


[http://requirejs.org/docs/api.html](http://requirejs.org/docs/api.html)

## 使用心得
1. [Javascript模块化编程（三）：require.js的用法](http://www.ruanyifeng.com/blog/2012/11/require_js.html)
1. [RequireJS 快速入门](http://www.wojilu.com/Forum1/Topic/4205)