/**
 * base Controller class
 */
class Controller {
  constructor(ctx, next){
    this.ctx = ctx;
    this.next = next;
  }
}

module.exports = Controller;