
function invokeController(options){
  return (ctx, next) => {
    ctx.body = 'hello';
    return next();
  }
}

module.exports = invokeController;