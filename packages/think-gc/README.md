# think-gc

gc manager for ThinkJS 3.x

## Install

```
npm install think-gc
```

## How to use
```js
const gc = require('think-gc');

class handle {
  constructor(){
    this.gcType = 'session';
    gc(this, 3600 * 1000); //gc interval by 1 hour
  }
  gc(){
    //do gc task
  }
}
```