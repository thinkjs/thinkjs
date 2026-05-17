module.exports = class CrontabController extends think.Controller {
  indexAction(){
    think.logger.info('test');
    console.log('test');
    this.success();
  }
}