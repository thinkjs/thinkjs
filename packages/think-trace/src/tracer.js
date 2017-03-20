const fs = require('fs');
const path = require('path');
const helper = require('think-helper');
const stackTrace = require('stack-trace');

const readFileAsync = helper.promisify(fs.readFile);
const DEFAULT_404_TEMPLATE = path.join(__dirname, 'template/404.html');
const DEFAULT_500_TEMPLATE = path.join(__dirname, 'template/500.html');

module.exports = class Tracer {
  constructor({ctxLineNumbers, err404Template, err500Template}) {
    this.ctxLineNumbers = ctxLineNumbers || 10;
    this.err404Template = err404Template || DEFAULT_404_TEMPLATE;
    this.err500Template = err500Template || DEFAULT_500_TEMPLATE;
  }

  /**
   * get error template file content
   */
  getTemplateContent() {
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
    let filename = line.getFileName();
    let lineNumber = line.getLineNumber();

    return readFileAsync(filename, {encoding: 'utf-8'}).then(data => {
      let startLineNumber = lineNumber - this.ctxLineNumbers;
      let endLineNumber = lineNumber + this.ctxLineNumbers;
      let content = data.split('\n').slice(startLineNumber, endLineNumber);
      
      line.content = content.join('\n');
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
  render500(stacks, err) {
    let error = JSON.stringify(stacks, null, '\t');
    return this.err500TemplateContent
      .replace('{{error}}', error)
      .replace('{{errMsg}}', err.toString());
  }

  /**
   * render 404 not found page
   * @param {*Error} err Error instance
   */
  render404(err) {
    error = 'controller not found';
    return this.err404TemplateContent
      .replace('{{error}}', error)
      .replace('{{errMsg}}', err.toString());
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

    // 404 not found error
    if( err.status === 404 ) {
      ctx.body = this.render404(ctx, err);
      return true;
    }
    
    let stack = stackTrace.parse(err);
    return Promise.all( 
      stack.map(this.getFile.bind(this)) 
    ).then(stacks => stacks.filter(stack => stack))
     .then(stacks => ctx.body = this.render500(stacks, err));
  }
}