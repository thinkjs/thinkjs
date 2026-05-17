import $ from 'zepto';
import './style.css';

global.App = class App {
  constructor(errMsg, stacks) {
    this.state = {activeStack: 0};
    this.setState({errMsg, stacks});
    this.bindEvent();
  }

  setState(state) {
    for(let i in state) {
      this.state[i] = state[i];
    }
    this.render();
  }

  bindEvent() {
    let that = this;
    $('.wrap').on('click', 'li:not(.stack-code)', function() { 
      that.setState({activeStack: $(this).attr('data-index')/1});
    });
  }

  render() {
    let {errMsg, stacks, activeStack} = this.state;
    if( !errMsg && !stacks.length ) {
      return true;
    }
    
    let html = `
      <div class="stacks-header">${errMsg}</div>
      <!--stacks-->
      <ul class="stacks">
      ${stacks.map((stack, i) => 
        `
        <li class="${i==activeStack?'active':''}" data-index="${i}">
          <div class="stack-info">
            <span class="stack-index">${stacks.length - i}</span>
            <span class="stack-function">${stack.functionName}</span>
          </div>
          <div class="stack-file">
            <span>${stack.fileName}:${stack.lineNumber}</span>
          </div>
        </li>
        <li class="stack-code">
          <pre 
            class="prettyprint linenums:${stack.startLineNumber}"
            data-activeLine="${stack.lineNumber}"
          >${stack.content}</pre>
        </li>
        `
      ).join('')}
      </ul>
    `;
    $('body>.wrap').html(html);
    this._afterRender();
  }

  highlightCurrentLine(_, frame) {
    var $frame = $(frame);
    var activeLineNumber = $frame.attr('data-activeline');
    var $lines           = $frame.find('.linenums li');
    var firstLine        = +($lines[0].value);

    var activeLine = activeLineNumber - firstLine;
    var preActiveLine = activeLine - 1;
    var nextActiveLine = activeLine + 1;

    if( $lines[preActiveLine] ) { $($lines[preActiveLine]).addClass('current'); }
    if( $lines[nextActiveLine]) { $($lines[nextActiveLine]).addClass('current'); }
    $($lines[activeLine]).addClass('current active');
  }

  _afterRender() {
    prettyPrint();
    $('pre').each(this.highlightCurrentLine.bind(this));
  }
}