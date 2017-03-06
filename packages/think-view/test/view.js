const test = require('ava');
const View = require('../lib/view');

class TestView extends View{
  constructor(ctx){
    super(ctx);
    this.viewData = {};
  }
}

test('test view',t=>{
  let view = new TestView();
  view.assign('test','test');
  console.log(view.viewData);
});