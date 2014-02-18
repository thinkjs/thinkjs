## 简单介绍

Handlebars是一个Javascript语义模板库。它可以将逻辑与展现分离，使代码变得清晰，可维护。

## 使用说明

### 外链形式

```html
<script src="{{src}}"></script>
```

### 模块加载形式

Handlebars 不是标准的 AMD 模块。不过仍然可以这样引入：

```html
<script>
    require(['{{module}}'], function(_) {
        console.log(Handlebars);
    });
</script>
```

##快速使用
1. 在HTML中编写Handlebars模板，并用script标签包裹

    ```html
    <div class="author-info">
    <script id="author-info-template" type="text/x-handlebars-template">
        <h1>{{firstName}} {{lastName}}</h1>
    </script>
    </div>
    ```
    
1. 调用`Handlebar.compiles`编译handlebars模板，得到`template`方法

    ```javascript
    var source = $('#author-info-template').html();
    var template = Handlebars.compile(source);
    ```

1. 调用`template`方法，传入上下文，获得最终的html代码，写入到DOM

    ```javascript
    var data = {
        firstName: 'Joanne',
        lastName: 'Rowling'
    }
    var html = template(data);
    $('.author-info').html(html);
    ```

## 基本语法

### 表达式
形式：`{{expression}}`  
使用双大括号包裹。expression可以为值或者方法。

如果不希望Handlebars去**escape**你的内容，使用三个大括号：`{{{expression}}}`

### 块级表达式
形式：`{{#expression}} ... {{/expression}}`  
使用(#)表示开始，反斜杠(/)表示结束  

块级表达式可以让你定义一些helper来用不同的上下文调用模板片段。

Handlebars提供了许多内置的**block helper**：if, unless, each, with, log

### 条件语句
####if helper
```html
{{#if author}}
<h1>{{firstName}} {{lastName}}</h1>
{{else}}
<h1>Unknown author</h1>
{{/if}}
```

#### unless helper
unless helper与if helper相反
```html
{{#unless licence}}
<h3 class="warning">WARNING: This entry does not have a license!</h3>
{{/unless}}
```

### 循环语句

#### each遍历数组

```html
<ul>
    {{#each people}}
    <li>{{@index}} : {{this.name}}</li>
    {{/each}}
</ul>
```
```javascript
var data = {
    people: ['Jack', 'Tom', 'Wendy']
};
var html = template(data);
```
可使用`{{this}}`引用当前迭代的对象  
使用`{{@index}}`引用当前迭代的索引

#### each遍历对象
```html
<pre>
    {{#each student}}
        Name: {{name}}
        Age: {{age}}
        Gender: {{gender}} 
    {{/each}}
</pre>
```
```javascript
var data = {
    student: {
        name: 'Jack',
        age: '18',
        gender: 'male'
    }
};
var html = template(data);
```
遍历对象使用`{{@key}}`引用当前迭代的键


### 路径

#### 当前上下文属性
`{{author.name}}`或者`{{author/name}}`

#### 父级上下文属性
`{{../permalink}}`

### 注释
1. `{{! comments }}` 不会显示在最终生成的html中
2. `{{!--  comments  --}}` 会显示在最终生成的html中

### 自定义Helper
Handlebars支持自定义function helper或block helper来操作模板中的数据，添加处理逻辑。  
  
Example: 定义一个可打印名字列表的helper
```html
{{#list people}}{{firstName}} {{lastName}}{{/list}}
```
模板数据为：
```javascript
{
    people: [
        {firstName: "Yehuda", lastName: "Katz"},
        {firstName: "Carl", lastName: "Lerche"},
        {firstName: "Alan", lastName: "Johnson"}
    ]
}
```
使用`Handlebars.registerHelper`定义list helper
```javascript
Handlebars.registerHelper('list', function(items, options) {
    var out = "<ul>";

    for(var i=0, l=items.length; i<l; i++) {
        out = out + "<li>" + options.fn(items[i]) + "</li>";
    }

    return out + "</ul>";
});
```
最后生成的html
```html
<ul>
    <li>Yehuda Katz</li>
    <li>Carl Lerche</li>
    <li>Alan Johnson</li>
</ul>
```

## 文档参考

[完整文档请参考这里](http://handlebarsjs.com/)
