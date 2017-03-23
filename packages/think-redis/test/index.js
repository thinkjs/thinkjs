/*
* @Author: lushijie
* @Date:   2017-03-22 21:00:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-23 10:36:25
*/
// const helper = require('think-helper');
// const path = require('path');
// const fs = require('fs');

import test from 'ava';
import helper from 'think-helper';
import path from 'path';
import fs from 'fs';
import Redis from '../index';


let config = {
  port: 6379,          // Redis port
  host: '127.0.0.1',   // Redis host
  password: '',
};

test.serial('set key & get key & del key', async t => {
  let key = 'name1';
  let value = 'thinkjs';

  let redisInst = new Redis(helper.extend({}, config));
  redisInst.on('connect', function() {
    // console.log('connect...')
  });
  let setres = await redisInst.set(key, value);
  let getres1 = await redisInst.get(key);
  let delres = await redisInst.delete(key);
  let getres2 = await redisInst.get(key);

  t.true(setres === 'OK' && getres1 === value && delres ===1 && getres2 === null);
});

test.serial('set key', async t => {

  let redisInst = new Redis(helper.extend({}, config));
  let s1 = await redisInst.set('name2', 'lushijie');
  let s2 = await redisInst.set('name3', 'lushijie', 3);
  let s3 = await redisInst.set('name4', 'lushijie', 'EX', 5);
  let s4 = await redisInst.set('name5', 'lushijie', 'PX', 10000);
  redisInst.close();
  redisInst.close();

  t.true(s1 === 'OK' && s2 === 'OK' && s3 === 'OK' && s4 === 'OK');
});

