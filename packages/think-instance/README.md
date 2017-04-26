# think-instance

## Install

```
npm install think-instance
```

## How to Use

```js
const thinkInstance = require('think-instance');
let cls = class {
  constructor(conf1, conf2){

  }
}
cls = thinkInstance(cls);
const instance = cls.getInstance(conf1, conf2);
```