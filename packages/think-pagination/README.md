# think-pagenation

pagenation for ThinkJS 2

## install

```sh
npm install think-pagenation
```

## how to use

### controller

```js
import pagenation from 'think-pagenation';
export default class think.controller.base {
  async indexAction(){
    let data = await this.model('user').countSelect();
    let html = pagenation(data, this.http, {});
    this.assign('pagenation', html);
  }
}
```

### view

#### ejs

```html
{%-pagenation%}
```

#### nunjucks

```html
{{pagenation | safe}}
```

## api

### pagenation(pagerData, http, options)

* `pagerData`  get from by model.countSelect
* `http` http object
* `options` options

`options`:

```js
{
  desc: false, //show description
    pageNum: 2, 
    url: '', //page url, when not set, it will auto generated
    class: '', //pagenation extra class
    text: {
      next: 'Next',
      prev: 'Prev',
      total: 'count: ${count} , pages: ${pages}'
    }
}
```
