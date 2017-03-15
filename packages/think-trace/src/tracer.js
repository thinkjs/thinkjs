const fs = require('fs');
const path = require('path');
const helper = require('think-helper');
const stackTrace = require('stack-trace');

const readFileAsync = helper.promisify(fs.readFile);
const DEFAULT_TEMPLATE = path.join(__dirname, 'template/error.html');

module.exports = class Tracer {
  constructor(opts = {
    ctxLineNumbers: 10, 
    templateFile: DEFAULT_TEMPLATE
  }) {
    this.ctxLineNumbers = opts.ctxLineNumbers;
    this.templateFile = opts.templateFile;
  }

  /**
   * get error template file content
   */
  getTemplateContent() {
    return readFileAsync(this.templateFile, {encoding: 'utf-8'})
    .catch(() => readFileAsync(DEFAULT_TEMPLATE, {encoding: 'utf-8'}))
    .then(templateContent => this.templateContent = templateContent);
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