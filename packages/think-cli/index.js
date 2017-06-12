const Cmd = require('./commander');
const commander = require('commander');
const cmdInstance = new Cmd(commander);
cmdInstance.parseArgv(process.argv);
