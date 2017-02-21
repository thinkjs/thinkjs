# think-ip-filter

IP filter middleware for ** ThinkJS 2.0 **, support whiteList & blackList.

## Install

```sh
npm install think-ip-filter --save
```

## How to use

### register middleware 

create file if not exist, `src/common/bootstrap/middleware.js`.

```js
import ipFilter from 'think-ip-filter';
think.middleware('ip_filter', ipFilter);
```

### config hook

create file if not exist, `src/common/config/hook.js`.

```js
export default {
  request_begin: ['prepend', 'ip_filter']
}
```

### config ip whiteList or blackList

add `ip_filter` config in file `src/common/config/config.js`.

**black list**

```js
export default {
  ip_filter: ['111.222.333.444', '121.233.120.11']
}
```

**white list**

```js
export default {
  ip_filter: {
    whiteList: ['123.222.122.11', '22.33.11.22']
  }
}
```

**\* rule**

```js
export default {
  ip_filter: {
    whiteList: ['123.*.122.11', '*.33.11.22']
  }
}
```

**RegExp rule**

```js
export default {
  ip_filter: {
    whiteList: [/^10\./]
  }
}
```

**dynamic load**

dynamic load by function, must be return Promise.

```js
export default {
  ip_filter: function(){
    //such as: get from db
    return Promise.resolve(['111.*']);
  }
}
```

## LICENSE

MIT
