# think-email

# think-email
[![npm](https://img.shields.io/npm/v/think-email.svg?style=flat-square)](https://www.npmjs.com/package/think-email)

Email extend for ThinkJS 3.x based on [nodemailer](https://github.com/nodemailer/nodemailer).

## Install

```
npm install think-email
```
## How to use

Set the extend in `src/config/extend.js`

```js
const email = require('think-email');

module.exports = [
  email
];
```

And then the `controller`, `context`, `think` will have the method `sendEmail`. For
example in `controller` you can use like this:

```js

this.sendEmail(transport, options).then(info => {
  console.log(info);
}, err => {
  console.log(err);
});
```

#### transport like:

```js
{
  service: '126',
  auth: {
    user: 'aaa@126.com', // your account
    pass: '******'       // authorization code, not the email password
  }
}
```

#### options like:

```js
{
  from: 'aaa@126.com',          // sender address
  to: 'bbb@qq.com,ccc@qq.com',  // list of receivers
  cc: 'ddd@126.com',            // cc list of receivers
  bcc: 'eed@126.com',           // bcc list of receivers
  subject: 'this is subject',   // subject line
  html: '<b>this is HTML content <img src="cid:00000001"/></b>', // html content
  attachments:[
    {
      filename : 'attachment1',
      path: './package.json'
    },{
      filename: 'attachment2',
      content: '123123'
    },{
      filename: 'attachment3',
      path: 'http://p5.qhimg.com/t012e4e6855de50213e.jpg',
      cid: '00000001'
    }
  ]
}
```

More config options, you can see at [nodemailer doc](https://nodemailer.com/about/).
