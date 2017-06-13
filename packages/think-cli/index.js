#!/usr/bin/env node 
const Commander = require('./commander');
const instance = new Commander();
instance.parseArgv(process.argv);
