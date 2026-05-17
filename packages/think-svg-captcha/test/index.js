/*
* @Author: lushijie
* @Date:   2017-04-07 09:39:26
* @Last Modified by:   lushijie
* @Last Modified time: 2017-04-07 10:58:26
*/
import test from 'ava';
import helper from 'think-helper';
import path from 'path';
import fs from 'fs';
import ThinkCaptcha from '..';

const defaultOptions = {
  size: 4, // size of random string
  ignoreChars: '', // filter out some characters
  noise: 3, // number of noise lines
  color: false, // default grey, true if background option is set
  background: '#ffffff', // background color of the svg image
  width: 150, // width of captcha
  height: 50, // height of captcha
  fontPath: '',
  fontSize: 32, // captcha text size
  charPreset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' // random character preset
}

test.serial('normal', async t => {
  let captcha = new ThinkCaptcha();
  let out1 = captcha.create();
  let out2 = captcha.svgCaptcha('test');
  t.pass();
});

test.serial('with options', async t => {
  let options = helper.extend({}, defaultOptions, {fontPath: path.join(__dirname, './ff2.woff')});
  let captcha = new ThinkCaptcha(options);
  let out1 = captcha.create();
  let out2 = captcha.svgCaptcha('test');
  t.pass();
});

test.serial('with same fontPath', async t => {
  let options = helper.extend({}, defaultOptions, {fontPath: path.join(__dirname, './ff2.woff')});
  let captcha = new ThinkCaptcha(options);
  let out1 = captcha.create();
  let out2 = captcha.svgCaptcha('test');
  t.pass();
});


