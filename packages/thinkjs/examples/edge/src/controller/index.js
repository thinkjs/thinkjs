module.exports = class extends think.Controller {
  indexAction() {
    return this.success({
      runtime: 'fetch',
      binding: this.ctx.env.NAME || 'ThinkJS'
    });
  }

  echoAction() {
    return this.success({query: this.get(), post: this.post()});
  }

  uploadAction() {
    const file = this.file('file');
    return this.success({name: file.name, size: file.size});
  }

  streamAction() {
    this.body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('hello edge'));
        controller.close();
      }
    });
  }
};
