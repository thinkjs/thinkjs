module.exports = class PayloadController extends think.Controller {
  async indexAction() {
    await this.display('payload/index.html');
  }

  async requestAction() {
    await this.display('payload/request.html');
  }

  async uploadAction() {
    await this.display('payload/upload.html');
  }

  async demoAction() {
    this.ctx.body = {
      query: this.query(),
      file: this.file(),
      post: this.post()
    };
  }
}