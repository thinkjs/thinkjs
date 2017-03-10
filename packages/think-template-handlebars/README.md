# think-template-handlebars

handlebars template adapter for ThinkJS `2.x`

## Install

```sh
npm install think-template-handlebars
```

## How to use

### register adapter

```js
import HandlebarseAdapter from 'think-template-handlebars';
think.adapter('template', 'handlebars', HandlebarseAdapter);
```

add above code in bootstrap file, like `src/common/boostrap/adapter.js`.

### change view type

change view type in file `src/common/config/view.js`,

```js
export default {
  type: 'handlebars',
  adapter: {
    handlebars: { //handlebars options

    }
  }
}
```

### precompiled

you can precompile handlebars template before deployed. it will auto identified when render template.
