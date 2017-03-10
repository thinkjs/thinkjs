const Application = require('thinkjs');

const instance = new Application({
  ROOT_PATH: __dirname,
  env: 'production'
});

instance.run();