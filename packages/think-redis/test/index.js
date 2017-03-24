/*
* @Author: lushijie
* @Date:   2017-03-22 21:00:08
* @Last Modified by:   lushijie
* @Last Modified time: 2017-03-24 10:15:58
*/
// const helper = require('think-helper');
// const path = require('path');
// const fs = require('fs');

import test from 'ava';
import helper from 'think-helper';
import path from 'path';
import fs from 'fs';
import Redis from '../index';

test.serial('set key & get key & del key', async t => {
  let key = 'name1';
  let value = 'thinkjs';

  let redisInst = new Redis();
  redisInst.on('connect', function() {
    // console.log('connect...')
  });
  let s = await redisInst.set(key, value);
  let g1 = await redisInst.get(key);
  let d = await redisInst.delete(key);
  let g2 = await redisInst.get(key);

  t.true(s === 'OK' && g1 === value && d === 1 && g2 === null);
});

test.serial('set key', async t => {

  let redisInst = new Redis();
  let s1 = await redisInst.set('name2', 'lushijie');
  let s2 = await redisInst.set('name3', 'lushijie', 3);
  let s3 = await redisInst.set('name4', 'lushijie', 'EX', 5);
  let s4 = await redisInst.set('name5', 'lushijie', 'PX', 10000);
  redisInst.close();
  redisInst.close();

  t.true(s1 === 'OK' && s2 === 'OK' && s3 === 'OK' && s4 === 'OK');
});

