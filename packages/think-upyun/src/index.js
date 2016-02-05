'use strict';

import thinkit from 'thinkit';
import request from 'request';
import fs from 'fs';
import path from 'path';
import parallelLimit from 'parallel-limit';

/**
 * upyun 操作
 */
module.exports = class {
  /**
   * 接口域名
   * @type {String}
   */
  domain = 'v0.api.upyun.com';
  /**
   * limit
   * @type {Number}
   */
  limit = 2;
  /**
   * constructor
   */
  constructor(bucketname, username, password){
    this.bucketname = bucketname;
    this.username = username;
    this.password = thinkit.md5(password);
    this.plInstance = new parallelLimit(this.limit);
  }
  /**
   * 设置域名
   * @param {} domain []
   */
  setDomain(domain){
    this.domain = domain;
  }
  /**
   * 签名
   */
  sign(method, uri, date, length){
    let signValue = `${method}&${uri}&${date}&${length}&${this.password}`;
    return `UpYun ${this.username}:${thinkit.md5(signValue)}`;
  }
  /**
   * 最后添加斜杠
   * @param {[type]} str [description]
   */
  addSlash(str){
    if(!str || !thinkit.isString(str)){
      return str;
    }
    if (str.slice(-1) !== '/') {
      str += '/';
    }
    return str;
  }
  /**
   * 获取文件夹或者文件信息
   * @param  {String} file [description]
   * @return {[type]}      [description]
   */
  async getInfo(file = '/'){
    let response = await this.request(file, 'HEAD');
    let headers = response.headers;
    return {
      type: headers['x-upyun-file-type'],
      size: headers['x-upyun-file-size'],
      date: headers['x-upyun-file-date']
    };
  }
  /**
   * 查看空间占用信息
   */
  async getUsage(path = '/'){
    let response = await this.request(path + "?usage");
    return parseInt(response.body, 10);
  }
  /**
   * 从返回的headers里获取图片的信息
   */
  getPicInfo(response){
    let headers = response.headers;
    return {
      width: headers['x-upyun-width'],
      height: headers['x-upyun-height'],
      frames: headers['x-upyun-frames'],
      type: headers['x-upyun-file-type']
    };
  }
  /**
   * 上传文件或者文件夹
   * @param  {[type]} savePath [description]
   * @param  {[type]} filePath [description]
   * @return {[type]}          [description]
   */
  async upload(filePath, savePath, headers){
    let defaultHeaders = {
      mkdir: true
    };
    if (thinkit.isObject(headers)){
      defaultHeaders = thinkit.extend(defaultHeaders, headers);
    }else if (headers) {
      defaultHeaders["Content-Secret"] = headers;
    }
    //文件上传
    if (thinkit.isFile(filePath)) {
      let stream = await thinkit.promisify(fs.readFile, fs)(filePath);
      let filename;
      if (!(/\.\w+$/.test(savePath))) {
        filename = filePath.split('/');
        filename = filename[filename.length - 1];
        savePath += '/' + filename;
      }
      let response = await this.requestAwait(savePath, 'PUT', stream, defaultHeaders);
      let data = this.getPicInfo(response);
      if(filename){
        data.filename = filename;
      }
      return data;
    }
    //文件夹上传
    if (thinkit.isDir(filePath)) { 
      savePath = this.addSlash(savePath);
      filePath = this.addSlash(filePath);
      let files = think.promisify(fs.readdir, fs)(filePath);
      let promises = files.map(item => {
        let nFilePath = filePath + item;
        if(thinkit.isFile(nFilePath) || thinkit.isDir(nFilePath)){
          return this.upload(savePath + item, nFilePath);
        }
      });
      return Promise.all(promises);
    }
    //普通内容上传
    let response = await this.request(savePath, 'PUT', filePath, defaultHeaders);
    return this.getPicInfo(response);
  }
  /**
   * 文件或者文件夹下载
   * @param  {[type]} path     [description]
   * @param  {[type]} savePath [description]
   * @return {[type]}          [description]
   */
  async download(sourcePath = '/', savePath, typeData){
    if(thinkit.isObject(savePath)){
      typeData = savePath;
      savePath = '';
    }
    savePath = this.addSlash(savePath);
    if(!typeData){
      typeData = await this.getInfo(sourcePath);
    }
    //文件夹
    if (typeData.type === 'folder') {
      sourcePath = this.addSlash(sourcePath);
      let dirs = await this.readdir(sourcePath);
      let promises = dirs.map(item => {
        let nPath = sourcePath + item.name;
        if(item.type === 'F'){
          return this.download(nPath + '/', savePath + item.name + '/');
        }
        return this.download(nPath, savePath, {type: 'file'});
      })
      return Promise.all(promises);
    }
    //单个文件
    let response = await this.requestAwait(sourcePath, 'GET', '', {}, {encoding: null});
    if(!savePath){
      return response.body;
    }
    let sourceExt = path.extname(sourcePath);
    let saveExt = path.extname(savePath);
    let fileSavePath = savePath;
    if (sourceExt && sourceExt === saveExt) {
      thinkit.mkdir(path.dirname(savePath));
    }else{
      thinkit.mkdir(savePath);
      fileSavePath = savePath + path.basename(sourcePath);
    }
    return thinkit.promisify(fs.writeFile, fs)(fileSavePath, response.body);
  }
  /**
   * 删除文件或者文件夹
   */
  async rm(filePath = '/'){
    let info = await this.getInfo(filePath);
    if (info.type !== 'folder') {
      return this.requestAwait(filePath, 'DELETE');
    }
    let dirs = await this.readdir(filePath);
    let promises = dirs.map(item => {
      filePath = this.addSlash(filePath);
      let nPath = filePath + item.name;
      if(item.type === 'F'){
        return this.rm(nPath);
      }
      return this.requestAwait(nPath, 'DELETE');
    });
    await Promise.all(promises);
    return this.requestAwait(filePath, 'DELETE');
  }
  /**
   * 递归创建目录
   */
  mkdir(path){
    return this.request(path, 'PUT', '', {
      mkdir: true,
      folder: true
    }).then(function(response){
      return response.body;
    });
  }
  /**
   * 读取目录下的文件和子目录
   */
  async readdir(filePath = '/', recursive){
    filePath = this.addSlash(filePath);
    let response = await this.request(filePath, "GET");
    let dirs = response.body.split("\n");
    let result = [];
    for (let i = 0, length = dirs.length; i < length; i++) {
      let dir = dirs[i];
      let attrs = dir.split("\t");
      dir = {
        name: attrs[0],
        type: attrs[1],
        size: attrs[2],
        time: attrs[3]
      };
      if (recursive && dir.type === 'F') {
        dir.children = await this.readdir(filePath + dir.name, true);
      }
      result.push(dir);
    }
    return result;
  }
  /**
   * request await
   * @param  {...[type]} args [description]
   * @return {[type]}         [description]
   */
  requestAwait(...args){
    return this.plInstance.add(() => {
      return this.request(...args).catch(err => {
        return this.request(...args); //retry
      }).catch(err => { //ignore error
        console.log(err.stack);
      })
    });
  }
  /**
   * 请求数据
   */
  request(uri, method = 'GET', data = '', headers = {}, options){
    uri = "/" + this.bucketname + uri;
    let length = 0;
    if (data) {
      length = !thinkit.isBuffer(data) ? Buffer.byteLength(data) : data.length;
    }
    let date = (new Date()).toUTCString();
    let Authorization = this.sign(method, uri, date, length);
    headers = thinkit.extend({}, headers, {
      'Expect': "",
      'Content-Length': length,
      'Date': date,
      'Authorization': Authorization
    });
    let requestUrl = "http://" + this.domain + uri;
    //console.log(method, requestUrl);
    let opts = thinkit.extend({
      url: requestUrl,
      method: method,
      body: data,
      headers: headers
    }, options);
    return thinkit.promisify(request)(opts).then(response => {
      if(response.statusCode !== 200){
        return Promise.reject(new Error(response.body + ', request url is ' + requestUrl));
      }
      return response;
    });
  }
}