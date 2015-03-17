[![NPM version](https://badge.fury.io/js/thinkjs.svg)](http://badge.fury.io/js/thinkjs)
[![travis-ci](https://travis-ci.org/75team/thinkjs.svg?branch=master)](https://travis-ci.org/welefen/thinkjs)
[![Coverage Status](https://coveralls.io/repos/75team/thinkjs/badge.png?branch=master)](https://coveralls.io/r/75team/thinkjs?branch=master)

## 介绍

thinkjs是一款基于Promise的Node.js MVC框架，借鉴于ThinkPHP。具有如下特性：

* 使用Promise，完美的解决了异步嵌套的问题
* 支持Http、命令行、WebSocket、Restful等多种访问方式
* C(Core) + B(Behavior) + D(Driver)架构
* 封装了Db、Session、Cache等功能
* 开发模式下修改后立即生效

## 安装

```
npm install -g thinkjs-cmd
```

## 创建项目

```
# 在合适的位置创建一个新目录，new_dir_name为你想创建的文件夹名字
mkdir new_dir_name; 
# 通过thinkjs命令创建项目
thinkjs new_dir_name
```

执行后，如果当前环境有浏览器，会自动用打开浏览器，并且会看到如下内容。

```
hello, thinkjs!
```

看到这个内容后，说明项目已经成功创建。

更多介绍请见 http://thinkjs.org/doc/start.html

## 贡献者

```
   944  welefen                 94.8%
    14  李成银                   1.4%
     7  akira                   0.7%
     5  Rayi                    0.5%
     5  炎燎                     0.5%
     4  JerryQu                 0.4%
     3  wavelynn                0.3%
     3  zhangdaiping            0.3%
     2  AlphaTr                 0.2%
     2  Startan                 0.2%
     2  jiangyuan               0.2%
     1  snadn                   0.1%
     1  qgy18                   0.1%
     1  liupengke               0.1%
     1  akira-cn                0.1%
     1  Jackson Tian            0.1%
```

## 协议

MIT
