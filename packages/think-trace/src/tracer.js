const fs = require('fs');
const path = require('path');
const helper = require('think-helper');
const stackTrace = require('stack-trace');

const readFileAsync = helper.promisify(fs.readFile);
const DEFAULT_404_TEMPLATE = path.join(__dirname, 'template/404.html');
const DEFAULT_500_TEMPLATE = path.join(__dirname, 'template/500.html');

module.exports = class Tracer {
  constructor(opts = {
    ctxLineNumbers: 10, 
    err404Template: DEFAULT_404_TEMPLATE,
    err500Template: DEFAULT_500_TEMPLATE
  }) {
    this.ctxLineNumbers = opts.ctxLineNumbers;
    this.err404Template = opts.err404Template;
    this.err500Template = opts.err500Template;
  }

  /**
   * get error template file content
   */
  getTemplateContent() {
    return Promise.all([
      /** 404 */
      readFileAsync(this.err404Template, {encoding: 'utf-8'})
        .catch(() => readFileAsync(DEFAULT_404_TEMPLATE, {encoding: 'utf-8'}))
        .then(templateContent => this.err404TemplateContent = templateContent),
        
      /** 500 */
      readFileAsync(this.err500Template, {encoding: 'utf-8'})
        .catch(() => readFileAsync(DEFAULT_500_TEMPLATE, {encoding: 'utf-8'}))
        .then(templateContent => this.err500TemplateContent = temlateContent)
    ]);
  }

  /**
   * get File content by stack path and lineNumber
   * @param {*object} line stack object for every stack
   */
  getFile(line) {
    let filename = line.getFileName();
    let lineNumber = line.getLineNumber();

    return readFileAsync(filename, {encoding: 'utf-8'}).then(data => {
      let startLineNumber = lineNumber - this.ctxLineNumbers;
      let endLineNumber = lineNumber + this.ctxLineNumbers;
      let content = data.split(/[\r\n]+/).slice(startLineNumber, endLineNumber);

      line.content = content;
      line.getContent = function() { return this.content; };
      line.startLineNumber = startLineNumber < 0 ? 1 : startLineNumber + 1;
      line.getStartLineNumber = function() { return this.startLineNumber; };

      return line;
    }).catch((err) => null);
  }

  /**
   * render error page
   * @param {*Array} stacks stacke tracer array
   */
  render(stacks) {
    let error = JSON.stringify(stacks, null, '\t');
    this.ctx.body = this.templateContent.replace('{{error}}', error);
  }

  /**
   * @param {*object} ctx koa ctx object
   * @param {*Error} err Error instance
   */
  run(ctx, err) {
    this.ctx = ctx;

    if( !(err instanceof Error) ) {
      err = new Error(err);
    }

    let stack = stackTrace.parse(err);
    stack._rawErr = err;
    
    return Promise.all( 
      stack.map(this.getFile.bind(this)) 
    ).then(stacks => stacks.filter(stack => stack))
     .then(this.render.bind(this));
  }
}