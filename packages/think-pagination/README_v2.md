# think-pagination

pagination for ThinkJS 2

## install

```sh
npm install think-pagination@1.6.0
```

## how to use

### controller

```js
import pagination from 'think-pagination';
export default class think.controller.base {
  async indexAction(){
    let data = await this.model('user').countSelect();
    let html = pagination(data, this.http, {});
    this.assign('pagination', html);
  }
}
```

### view

#### ejs

```html
{%-pagination%}
```

#### nunjucks

```html
{{pagination | safe}}
```

## api

### pagination(pagerData, http, options)

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
