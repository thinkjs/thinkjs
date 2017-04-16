import test from 'ava';
import shell from 'shelljs';
import helper from 'think-helper';
import path from 'path';
import fs  from 'fs';

const cwd = process.cwd();

const fs_unlink = helper.promisify(fs.unlink, fs);

var filePath =  '../index.js';

var exec = require('child_process').exec;

const modelPath = require.resolve("../index.js");

test(async t => {
	//shell.rm("-rf",path.resolve(cwd+"/abc"));
	process.argv = ['/usr/local/bin/node','/Users/sgy/think3.0/think-cli/index.js','new', 'abc'];
	delete require.cache[modelPath];
	require("../index.js");
	shell.rm("-rf",path.resolve(cwd+"/abc"));
})

// test(async t => {
// 	//shell.rm("-rf",path.resolve(cwd+"/abc"));
// 	process.argv = ['/usr/local/bin/node','/Users/sgy/think3.0/think-cli/index.js','new', 'abc3', 'config'];
// 	delete require.cache[modelPath];
// 	require("../index.js");
// 	//shell.rm("-rf",path.resolve(cwd+"/abc3"));
// })

// test(t => {
// 	process.argv = ['/usr/local/bin/node','/Users/sgy/think3.0/think-cli/index.js','new', 'abc2'];
// 	delete require.cache[modelPath];
// 	require("../index.js");

// 	// process.argv = ['/usr/local/bin/node','/Users/sgy/think3.0/think-cli/index.js','create', 'config'];
// 	// process.cwd  = function() {
// 	// 	return "/Users/sgy/think3.0/think-cli/abc2";
// 	// }
// 	// delete require.cache[modelPath];

// 	// require("../index.js");
// 	shell.rm("-rf",path.resolve(cwd+"/abc2"));
// })



// test(async t => {
// 	process.argv = ['/usr/local/bin/node','/Users/sgy/think3.0/think-cli/index.js','new', 'abc'];
// 	delete require.cache[modelPath];
// 	require("../index.js");
// 	require("../index.js");	
// })

// test(async t => {
// 	process.argv = ['/usr/local/bin/node','/Users/sgy/think3.0/think-cli/index.js','create', 'config'];
// 	delete require.cache[modelPath];
// 	process.cwd  = function() {
//  		return "/Users/sgy/think3.0/think-cli/abc2";
//  	}
// 	require("../index.js");	
// })



// test.before('version', t => {
// 	process.argv = ['/usr/local/bin/node','/Users/sgy/think3.0/think-cli/index.js','-v'];
// 	delete require.cache[modelPath];
// 	require("../index.js");
// })



