/*
* @Author: lushijie
* @Date:   2017-03-14 19:25:56
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-15 10:28:20
*/
import test from 'ava';
import helper from 'think-helper';
import path from 'path';
import fs from 'fs';
import thinkCache from '../index.js';

let cacheDB = thinkCache.think.cache;

const thisConfig = {
  config(name) {
    return {
      type: 'cache'
    }
  }
}

class Redis {
  constructor(config) {
    this.config = config;
  }
  get(arg) {
    if(arg === 'nothave') {
      return Promise.resolve(undefined);
    }
    return Promise.resolve('thinkjs');
  }
  set() {
    return Promise.resolve(true);
  }
  delete() {
    return Promise.resolve(1);
  }
}

function getConfig() {
  return {
    timeout: 6 * 3600,
    handle: Redis
  }
}

test('delete by cache name', async t => {
  let ret = await cacheDB.apply(thisConfig, ['name', null, getConfig()]);
  t.is(1, ret);
});

test('get by cache name', async t => {
  let ret = await cacheDB.apply(thisConfig, ['name', undefined, getConfig()]);
  t.is('thinkjs', ret);
});

test('set cache ', async t => {
  let ret = await cacheDB.apply(thisConfig, ['name', 'thinkjs', getConfig()]);
  t.true(ret);
});


test('get cache when value is function and function return undefined', async t => {
  let argName = 'nothave';
  let ret = await cacheDB.apply(thisConfig, [
    argName,
    function(arg) {
      return arg;
    },
    getConfig()
  ]);
  t.is(argName, ret);
});

test('get cache when value is function and function return value', async t => {
  let argName = 'have';
  let ret = await cacheDB.apply(thisConfig, [
    argName,
    function(arg) {
      return arg;
    },
    getConfig()
  ]);
  t.is('thinkjs', ret);
});
