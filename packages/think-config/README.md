# think-config

Config manager for ThinkJS 3.x

## How to use

```
npm install think-config
```

```js
const Config = require('think-config');
const instance = new Config(config);
instance.get('name'); 
instance.get('foo.bar');
instance.get(); // get all config
instance.get('name', otherConfig);

instance.set('name', value);
instance.set('foo.bar', value);
```
