'use strict';
/**
 * websocket adapter for socket.io
 */
export default class extends think.adapter.websocket {
  /**
   * run
   * @return {} []
   */
  async run(){

    let socketio = await think.npm('socket.io');
    let io = socketio(this.server);
    this.io = io;

    //set io adapter, must be a function
    //http://socket.io/docs/using-multiple-nodes/
    if(this.config.adapter){
      io.adapter(this.config.adapter());
    }

    //Sets the allowed origins v. Defaults to any origins being allowed.
    let allow_origin = this.config.allow_origin;
    if(allow_origin){
      io.origins(this.config.allow_origin);
    }

    //get message type
    let messages = think.extend({}, this.config.messages);
    let open = messages.open;
    delete messages.open;
    let close = messages.close;
    delete messages.close;

    let msgKeys = Object.keys(messages);

    io.on('connection', socket => {

      //open connection
      if(open){
        this.message(open, undefined, socket);
      }
      //listen disonnection event
      if(close){
        socket.on('disconnect', () => {
          this.message(close, undefined, socket);
        });
      }

      //listen list of message type
      msgKeys.forEach(msgKey => {
        socket.on(msgKey, msg => {
          this.message(messages[msgKey], msg, socket);
        });
      });
    });
  }
  /**
   * deal message
   * @param  {String} url  []
   * @param  {Mixed} data []
   * @return {}      []
   */
  async message(url, data, socket){
    let request = socket.request;
    if(url[0] !== '/'){
      url = `/${url}`;
    }
    request.url = url;

    let http = await think.http(request, request.res);
    http.data = data;
    http.socket = socket;
    http.io = this.io;

    let instance = new this.app(http);
    return instance.run();
  }
}