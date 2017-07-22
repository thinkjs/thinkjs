const fs = require('fs');
const path = require('path');
const helper = require('think-helper');
const stackTrace = require('stack-trace');

const readFileAsync = helper.promisify(fs.readFile);
const DEFAULT_404_TEMPLATE = path.join(__dirname, '../template/404.html');
const DEFAULT_500_TEMPLATE = path.join(__dirname, '../template/500.html');

module.exports = class Tracer {
  constructor(opts = {}) {
    this.ctxLineNumbers = opts.ctxLineNumbers || 10;
    this.debug = opts.debug !== undefined ? opts.debug : true;
    this.err404Template = opts.err404Template || DEFAULT_404_TEMPLATE;
    this.err500Template = opts.err500Template || DEFAULT_500_TEMPLATE;
  }

  /**
   * get error template file content
   */
  getTemplateContent() {
    if(!this.debug && this.err404TemplateContent && this.err500TemplateContent) {
      return Promise.resolve();
    }

    return Promise.all([
      /** 404 */
      readFileAsync(this.err404Template, {encoding: 'utf-8'})
        .catch(() => readFileAsync(DEFAULT_404_TEMPLATE, {encoding: 'utf-8'})),
      /** 500 */
      readFileAsync(this.err500Template, {encoding: 'utf-8'})
        .catch(() => readFileAsync(DEFAULT_500_TEMPLATE, {encoding: 'utf-8'}))
    ]).then(([template404Content, template500Content]) => {
      this.err404TemplateContent = template404Content;
      this.err500TemplateContent = template500Content;
    });
  }

  /**
   * get File content by stack path and lineNumber
   * @param {*object} line stack object for every stack
   */
  getFile(line) {
    const filename = line.getFileName();
    const lineNumber = line.getLineNumber();

    return readFileAsync(filename, {encoding: 'utf-8'}).then(data => {
      let content = data.split('\n');
      const startLineNumber = Math.max(0, lineNumber - this.ctxLineNumbers);
      const endLineNumber = Math.min(lineNumber + this.ctxLineNumbers, data.length);
      content = content.slice(startLineNumber, endLineNumber);

      line.content = content.join('\n');
      line.startLineNumber = Math.max(0, startLineNumber) + 1;

      return line;
    }).catch(() => {});
  }

  /**
   * render error page
   * @param {*Array} stacks stacke tracer array
   */
  render500(stacks, err) {
    let error;
    if (this.debug) {
      error = JSON.stringify(stacks, null, '\t');
    } else {
      error = '[]';
      err = '';
    }

    return this.err500TemplateContent
      .replace('{{error}}', error)
      .replace(
        '{{errMsg}}',
        err.toString()
          .replace(/[\r\n]+/g, '<br/>')
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
      );
  }

  /**
   * render 404 not found page
   * @param {*Error} err Error instance
   */
  render404(ctx, err) {
    if (!this.debug) {
      err = '';
    }

    return this.err404TemplateContent
      .replace('{{errMsg}}', err.toString());
  }

  /**
   * @param {*object} ctx koa ctx object
   * @param {*Error} err Error instance
   */
  run(ctx, err) {
    this.ctx = ctx;

    // 404 not found error
    if (err.status === 404) {
      ctx.body = this.render404(ctx, err);
      return true;
    }

    const stack = stackTrace.parse(err);
    return Promise.all(
      stack.map(this.getFile.bind(this))
    ).then(stacks => stacks.filter(stack => stack))
      .then(stacks => {
        ctx.body = this.render500(stacks, err);
      });
  }
};
