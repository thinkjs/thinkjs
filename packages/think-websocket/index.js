const helper = require('think-helper');

module.exports = app => {
  app.on('appReady', () => {
    const config = helper.parseAdapterConfig(app.think.config('websocket'));
    const handle = config.handle;
    delete config.handle;
    const instance = new handle(app.server, config, app);
    instance.run();
  });
  return {
    context: {
      get data(){

      },
      get socket(){
        
      }
    },
    controller: {
      get isWebsocket(){
        return this.isMethod('websocket');
      },
      emit: () => {},
      broadcast: () => {}
    }
  }
}