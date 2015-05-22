## 2.0开发文档

### 介绍

从`https://github.com/75team/thinkjs`上拉取代码后，选择`es6`的分支。

2.0基于ES6特性进行开发，如果对ES6不够了解，请先熟练了解ES6的特性 http://es6.ruanyifeng.com/#README

由于有些特性目前Node还不支持，所以需要使用`Babel`来编译成Es5的代码运行。http://babeljs.io/

安装Babel：

```
npm install -g babel
```

然后对src目录进行编译：

```
babel --loose all --optional runtime --stage 0 src/ --out-dir lib/ --watch
```

上面代码表示用监听的方式将src/目录编译到lib/目录下，这样文件有修改后会自动编译。


### 规范

* 必须使用2个空格作为缩进
* 必须写较为完善的注释，注释使用英文
* git commit的message也必须是英文

