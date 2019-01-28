const fs = require('fs');
const path = require('path');
const helper = require('think-helper');
const stackTrace = require('stack-trace');
const { htmlentities } = require('./helper');

const readFileAsync = helper.promisify(fs.readFile);
const DEFAULT_404_TEMPLATE = path.join(__dirname, '../template/404.html');
const DEFAULT_500_TEMPLATE = path.join(__dirname, '../template/500.html');

module.exports = class Tracer {
  constructor(opts = {}) {
    this.ctxLineNumbers = opts.ctxLineNumbers || 10;
    this.debug = opts.debug !== undefined ? opts.debug : true;

    if (helper.isFunction(opts.templates)) {
      this.templatesPath = opts.templates;
    } else {
      if (helper.isString(opts.templates)) {
        opts.templates = this.readTemplatesPath(opts.templates);
      }
      this.templatesPath = helper.extend({
        404: DEFAULT_404_TEMPLATE,
        500: DEFAULT_500_TEMPLATE
      }, opts.templates);
    }

    this.templates = {};
    this.contentType = opts.contentType;
  }

  /**
   * get error template path from error directory
   * @param {String} dir directory
   */
  readTemplatesPath(dir) {
    const templates = {};
    try {
      fs.readdirSync(dir)
        .forEach(file => {
          const match = file.match(/^(\d{3})\./);
          if (helper.isArray(match)) {
            templates[match[1]] = path.join(dir, file);
          }
        });
    } catch (e) {
      console.log(e); // eslint-disable-line no-console
    }
    return templates;
  }

  /**
   * get error template file content
   */
  async getTemplateContent() {
    if (!helper.isEmpty(this.templates)) {
      return Promise.resolve();
    }

    let templates = this.templatesPath;
    if (helper.isFunction(templates)) {
      templates = await this.templatesPath();
      if (helper.isString(templates)) {
        templates = this.readTemplatesPath(templates);
      }
      templates = helper.extend({
        404: DEFAULT_404_TEMPLATE,
        500: DEFAULT_500_TEMPLATE
      }, templates);
    }

    const readFilesAsync = Object.keys(templates).map(status =>
      readFileAsync(templates[status], { encoding: 'utf-8' })
        .catch(() =>
          readFileAsync(status !== '404' ? DEFAULT_500_TEMPLATE : DEFAULT_404_TEMPLATE, { encoding: 'utf-8' })
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

    return readFileAsync(filename, { encoding: 'utf-8' }).then(data => {
      let content = data.split('\n');
      const startLineNumber = Math.max(0, lineNumber - this.ctxLineNumbers);
      const endLineNumber = Math.min(lineNumber + this.ctxLineNumbers, data.length);
      content = content.slice(startLineNumber, endLineNumber);

      line.content = content.join('\n');
      line.startLineNumber = Math.max(0, startLineNumber) + 1;

      return line;
    }).catch(() => { });
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

      const customField = think && helper.isFunction(think.config);
      const errnoField = customField ? think.config('errnoField') : 'errno';
      const errmsgField = customField ? think.config('errmsgField') : 'errmsg';

      return (isJsonp ? ctx.jsonp : ctx.json).bind(ctx)({
        [errnoField]: ctx.status,
        [errmsgField]: err.message
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
