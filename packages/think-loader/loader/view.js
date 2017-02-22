const helper = require('think-helper');

function loader(viewPath){
  return helper.getdirFiles(viewPath);
}

module.exports = loader;