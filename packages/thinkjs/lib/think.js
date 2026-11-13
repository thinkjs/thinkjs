const Koa = require('koa');
const helper = require('think-helper');
const messenger = require('think-cluster').messenger;
const createThink = require('./core/think');

global.think = createThink(new Koa(), helper, messenger);
