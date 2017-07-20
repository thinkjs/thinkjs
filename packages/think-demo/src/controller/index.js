module.exports = class IndexController extends think.Controller {
  __before(){
  }
  async indexAction(){
    // var __ = this.getI18n();
    // console.log(__('some key'));
    await this.display('index_index');
  }
  __after(){
  }
}