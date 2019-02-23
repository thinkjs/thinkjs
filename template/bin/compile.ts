#!/usr/bin/env node

var thinkjs = require('thinkjs');
var path = require('path');
var WatchCompile = require('thinkjs/lib/util/watch_compile.js');

var rootPath = path.dirname(__dirname);
var srcPath = rootPath + think.sep + 'src';
var outPath = rootPath + think.sep + 'app';

think.ROOT_PATH = rootPath;
think.APP_PATH = outPath;

WatchCompile = WatchCompile.default || WatchCompile;
//compile src to app
WatchCompile.compile(srcPath, outPath, {
  type: 'ts'
});

