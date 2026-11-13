'use strict';
const path = require('node:path');
const Application = require('thinkjs');
const application = new Application({ROOT_PATH: __dirname, APP_PATH: path.join(__dirname, 'app'), env: 'production'});
require('./scripts/lifecycle.cjs')(application);
application.run();
