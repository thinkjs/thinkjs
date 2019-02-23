'use strict';

import Base from './base.js';

/**
 * websocket adapter for sockjs
 */
export default class extends Base {
  /**
   * run
   * @return {} []
   */
  async run(){
    let sockjs = await think.npm('sockjs');

    let options = {
      log: () => {}
    };
    if(this.config.sockjs_url){
      options.sockjs_url = this.config.sockjs_url;
    }
    let sockjsServer = sockjs.createServer(options);
    this.sockjs = sockjsServer;

    //get message type
    let messages = think.extend({}, this.config.messages);
    let open = messages.open;
    delete messages.open;
    let close = messages.close;
    delete messages.close;

    thinkCache(thinkCache.WEBSOCKET, []);

    sockjsServer.on('connection', socket => {

      this.addSocket(socket);
          
      //open connection
      if(open){
        this.message(open, undefined, socket);
      }

      socket.on('close', () => {
        this.removeSocket(socket);

        if(close){
          this.message(close, undefined, socket);
        }
      });

      //msg is {event: event, data: data}
      socket.on('data', msg => {
        try{
          msg = JSON.parse(msg);
          if(msg.event && messages[msg.event]){
            this.message(messages[msg.event], msg.data, socket);
          }
        }catch(e){}
      });
      
    });

    let path = this.config.path || '/sockjs';
    sockjsServer.installHandlers(this.server, {prefix: path});
  }
  /**
   * add socket
   * @param {Object} socket []
   */
  addSocket(socket){
    let sockets = thinkCache(thinkCache.WEBSOCKET);
    sockets.push(socket);
  }
  /**
   * remove socket
   * @param  {Object} socket []
   * @return {}        []
   */
  removeSocket(socket){
    let sockets = thinkCache(thinkCache.WEBSOCKET);
    sockets.some((item, index) => {
      if(item.id === socket.id){
        sockets.splice(index, 1);
        return true;
      }
    });
  }
  /**
   * emit data
   * @param  {String} event []
   * @param  {Mixed} data  []
   * @return {}       []
   */
  emit(event, data){
    this.socket.write(JSON.stringify({event: event, data: data}));
  }
  /**
   * broadcast data
   * @param  {String} event []
   * @param  {Mixed} data  []
   * @return {}       []
   */
  broadcast(event, data, containSelf){
    let sockets = thinkCache(thinkCache.WEBSOCKET);
    sockets.forEach(socket => {
      if(!containSelf && socket.id === this.socket.id){
        return;
      }
      socket.write(JSON.stringify({event: event, data: data}));
    });
  }
  /**
   * deal message
   * @param  {String} url  []
   * @param  {Mixed} data []
   * @return {}      []
   */
  async message(url, data, socket){
    if(url[0] !== '/'){
      url = `/${url}`;
    }

    let http = await think.http({
      url: url,
      headers: socket.headers,
      ip: socket.remoteAddress
    });
    
    http.data = data;
    http.socket = socket;
    http.sockjs = this.sockjs;

    http.socketEmit = this.emit;
    http.socketBroadcast = this.broadcast;

    let instance = new this.app(http);
    return instance.run();
  }
}