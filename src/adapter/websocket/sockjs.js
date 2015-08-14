'use strict';
/**
 * websocket adapter for sockjs
 */
export default class extends think.adapter.websocket {
  /**
   * run
   * @return {} []
   */
  async run(){
    let sockjs = await think.npm('sockjs');
    let sockjsServer = sockjs.createServer({
      log: () => {}
    });

    //get message type
    let messages = think.extend({}, this.config.messages);
    let open = messages.open;
    delete messages.open;
    let close = messages.close;
    delete messages.close;

    sockjsServer.on('connection', socket => {
      
      //open connection
      if(open){
        this.message(open, undefined, socket);
      }
      //listen close event
      if(close){
        socket.on('close', () => {
          this.message(close, undefined, socket);
        })
      }

      // msg type is
      // {
      //    type: 'chat',
      //    data: 'message'
      // }
      socket.on('data', msg => {
        try{
          msg = JSON.parse(msg);
          if(msg.type && messages[msg.type]){
            this.message(messages[msg.type], msg.data, socket);
          }
        }catch(e){}
      });
      
    });

    let path = this.config.path || '/sockjs';
    sockjsServer.installHandlers(this.server, {prefix: path});
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

    let http = await think.http(request, think.extend({}, request.res));
    http.data = data;
    http.socket = socket;

    let instance = new this.app(http);
    return instance.run();
  }
}