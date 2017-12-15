const fs = require('fs');
const path = require('path');
const helper = require('think-helper');
const stackTrace = require('stack-trace');
const {htmlentities} = require('./helper');

const readFileAsync = helper.promisify(fs.readFile);
const DEFAULT_404_TEMPLATE = path.join(__dirname, '../template/404.html');
const DEFAULT_500_TEMPLATE = path.join(__dirname, '../template/500.html');

module.exports = class Tracer {
  constructor(opts = {}) {
    this.ctxLineNumbers = opts.ctxLineNumbers || 10;
    this.debug = opts.debug !== undefined ? opts.debug : true;

    if (typeof (opts.templates) === 'string') {
      const templates = {};
      fs.readdirSync(opts.templates)
        .forEach(file => {
          const match = file.match(/^(\d{3})\./);
          if (Array.isArray(match)) {
            templates[match[1]] = path.join(opts.templates, file);
          }
        });
      opts.templates = templates;
    }

    this.contentType = opts.contentType;
    this.templatesPath = helper.extend({
      404: DEFAULT_404_TEMPLATE,
      500: DEFAULT_500_TEMPLATE
    }, opts.templates);
    this.templates = {};
  }

  /**
   * get error template file content
   */
  getTemplateContent() {
    if (!this.debug && !this.templates) {
      return Promise.resolve();
    }

    const readFilesAsync = Object.keys(this.templatesPath).map(status =>
      readFileAsync(this.templatesPath[status], {encoding: 'utf-8'})
        .catch(() =>
          readFileAsync(status !== '404' ? DEFAULT_500_TEMPLATE : DEFAULT_404_TEMPLATE, {encoding: 'utf-8'})
        ).then(template => {
          this.templates[status] = template;
        })
    );
    return Promise.all(readFilesAsync);
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
  renderError(template = this.templates[500], stacks, err) {
    let error;
    if (this.debug) {
      error = JSON.stringify(stacks, null, '\t');
    } else {
      error = '[]';
      err = '';
    }

    error = htmlentities(error);
    return template.replace('{{error}}', error).replace(
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
  renderNotFound(ctx, err) {
    if (!this.debug) {
      err = '';
    }

    return this.templates[404]
      .replace('{{errMsg}}', htmlentities(err.toString()));
  }

  /**
   * @param {*object} ctx koa ctx object
   * @param {*Error} err Error instance
   */
  run(ctx, err) {
    this.ctx = ctx;
    ctx.type = helper.isFunction(this.contentType) ? this.contentType(ctx) : 'html';

    const isJson = helper.isFunction(ctx.response.is) && ctx.response.is('json');
    const isJsonp = helper.isFunction(ctx.isJsonp) && ctx.isJsonp();
    if (isJson || isJsonp) {
      if (!helper.isFunction(ctx.json)) {
        ctx.json = res => { ctx.body = JSON.stringify(res) };
      }
      return (isJsonp ? ctx.jsonp : ctx.json).bind(ctx)({
        errno: ctx.status,
        errmsg: err.message
      });
    }

    // 404 not found error
    if (ctx.status === 404) {
      ctx.body = this.renderNotFound(ctx, err);
      return true;
    }

    const stack = stackTrace.parse(err);
    return Promise.all(
      stack.map(this.getFile.bind(this))
    ).then(stacks => stacks.filter(stack => stack))
      .then(stacks => {
        const template = this.templates[ctx.status];
        ctx.body = this.renderError(template, stack, err);
      });
  }
};
