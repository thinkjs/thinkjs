/**
 * invoke logic
 */

function invokeLogic(options){
  return (ctx, next) => {
    return next();
  }
}

module.exports = invokeLogic;