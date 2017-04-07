# think-captcha
[![Build Status](https://travis-ci.org/thinkjs/think-captcha.svg?branch=master)](https://travis-ci.org/thinkjs/think-captcha)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-captcha/badge.svg?branch=master)](https://coveralls.io/github/thinkjs/think-captcha?branch=master)
[![npm](https://img.shields.io/npm/v/think-captcha.svg?style=flat-square)](https://www.npmjs.com/package/think-captcha)


think-captcha is just a wrap of [svg-captcha)](https://github.com/lemonce/svg-captcha) .


## Usage

### default options
```js
const defaultOptions = {
  size: 4, // size of random string
  ignoreChars: '', // filter out some characters
  noise: 3, // number of noise lines
  color: false, // default grey, true if background option is set
  background: '#ffffff', // background color of the svg image
  width: 150, // width of captcha
  height: 50, // height of captcha
  fontPath: './fonts/Comismsh.ttf', // your font path
  fontSize: 32, // captcha text size
  charPreset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' // random character preset
}
```

### demo

```js
import ThinkCaptcha from 'think-captcha';
let captcha = new ThinkCaptcha(options);

captcha.create(); // returns an object that has the following property: {data: 'svg path data', text: 'captcha text'}
captcha.svgCaptcha(text); // return a svg captcha based on text provided.

```

You can find more details at [svg-captcha](https://github.com/lemonce/svg-captcha) !
