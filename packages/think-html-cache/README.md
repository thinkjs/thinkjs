# think-html-cache

html-cache middleware for ThinkJS 2.0

## Install

```sh
npm install think-html-cache
```

## How to use

### register middleware

create file is not exist, `src/common/bootstrap/middleware.js`

```js
import htmlCache from 'think-html-cache';
think.middleware('html_cache', htmlCache);
```

### hook config

`src/common/config/hook.js`

```js
export default {
  logic_before: ['prepend', 'html_cache'],
  view_after: ['append', 'html_cache']
}
```

### html_cache config

create file is not exist `src/common/config/html_cache.js`:

```js
export default {
  on: true, //use html_cache
  type: 'base', //cache content store type
  timeout: 0,
  callback: function(key){
    return think.md5(key);
  },
  rules: {
    'home/index/index': ['index_{page}', timeout, callback],
    'index/detail': ['index_{id}', timeout, callback]
  },
  //adapter config
  adapter: {
    file: {
      path: think.getPath('common', 'runtime') + '/html_cache' //when type is file, set cache path
    }
  }
}
```

**type**

cache content store type, support `base` & `file`.

**timeout**

expire time, if value is `0`, only expired when template is updated.

**callback**

encrypt cache key, such as:

```js
function (key) {
  return think.md5(key);
}
```

**rules**

cache rules, key is `[module]/[controller]/[action]`.

can get paramters in rule:

```
'index_{page}' // get page paramter from GET
'index_{:module}' // get module value
'index_{:controller}' //get controller value
'index_{:action}' //get action value
'index_{cookie.xxx}' //get value from cookie
```


## LICENSE

MIT