/* eslint-disable no-unused-vars,no-multi-spaces */
const cookie = {
  name: 'thinkjs',   // cookie的名字
  maxAge: '',        // cookie生存时间
  expires: '',       // cookie超时时间
  path: '/',         // 可以访问此cookie的页面
  domain: '',        // 可以访问此cookie的域名
  secure: false,     // 是否只能通过https传递此条cookie
  keys: [],          // set signed cookie keys
  httpOnly: true,    // 只能通过http请求使用cookie
  signed: false,     // 是否签名cookie内容
  encrypt: false,    // encrypt cookie data
  autoUpdate: false, // auto update cookie when is set maxAge
  sameSite: false,   // i do not know
  overwrite: false   // i do not know
};

const sign = {
  algorithm: 'HS256', // default is HS256
  audience: '',       // jwt的接收者
  issuer: '',         // jwt的签发者
  expiresIn: 'ms',    // 过期时间
  notBefore: 'ms',    // 有效期
  jwtid: '',          // jwtid
  subject: '',        // 面向的用户
  noTimestamp: '',    // 为true，不使用时间戳
  header: '',         // jwt描述信息，{typ:"JWT",alg:"HS256"}
  keyid: ''           // in decoded data
};

const verify = {
  algorithm: ['HS256'], // 允许的加密算法
  audience: '',         // jwt的接收者
  issuer: '',           // jwt签发者
  ignoreExpiration: false, // 如果为true,不校验expiresIn
  ignoreNotBefore: false,  // 如果为true,不校验notBefore
  subject: '',             // 面向的用户
  clockTolerance: 300,     // nbf和exp的容差秒数
  maxAge: 300,             // token生存时间，不要使用毫秒级别的数
  clockTimeStamp: 'timestamp' // 当前时间戳，不要使用毫秒级别的数
};

module.exports =  { cookie, verify, sign };
