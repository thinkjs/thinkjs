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

// test(async t => {
// 	//shell.rm("-rf",path.resolve(cwd+"/abc"));
// 	process.argv = ['/usr/local/bin/node','/Users/sgy/think3.0/think-cli/index.js','new', 'abc'];
// 	delete require.cache[modelPath];
// 	require("../index.js");
// 	shell.rm("-rf",path.resolve(cwd+"/abc"));
// })

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
// 	// 	return "/Users/sgy/think3.0/think-cli/abc2";ll
// 	// }
// 	// delete require.cache[modelPath];

// 	// require("../index.js");
// 	//shell.rm("-rf",path.resolve(cwd+"/abc2"));
// })



// test(async t => {
// 	process.argv = ['/usr/local/bin/node','/Users/sgy/think3.0/think-cli/index.js','new', 'abc'];
// 	delete require.cache[modelPath];
// 	require("../index.js");
// 	require("../index.js");	
// })

// test.serial(async t => {
// 	process.argv = ['/usr/local/bin/node','/Users/sgy/think3.0/think-cli/index.js','create', 'config'];
// 	delete require.cache[modelPath];
// 	process.cwd  = function() {
//  		return "/Users/sgy/think3.0/think-cli/abc2";
//  	}
// 	require("../index.js");	
// })

test.serial.cb('new project name is abc', t => {
	//require(modelPath);	
	exec('node index.js new abc', (error, stdout, stderr) => {
		exec('node ../index.js create config', {cwd: '/Users/sgy/think3.0/think-cli/abc'}, (error, stdout, stderr) => {
			t.pass();
			t.end();
		})
	})

	
})

test.serial.cb('new project name is abc2 for ts', t => {
	exec('node index.js new abc2 ts', (error, stdout, stderr) => {
		exec('node ../index.js create adapter test.js', {cwd: '/Users/sgy/think3.0/think-cli/abc2'}, (error, stdout, stderr) => {
			t.pass();
			t.end();
		})
	})
})

test.serial.cb('new project name is abc3 for config', t => {
	exec('node ../index.js new abc3 config',{cwd: '/Users/sgy/think3.0/think-cli/test'},  (error, stdout, stderr) => {
		t.pass();
		t.end();
	})
})

test.serial.cb('-v', t => {
	exec('node index.js -v', (error, stdout, stderr) => {
		t.pass();
    	t.end();
	})
})

// test.serial.cb('new project name is abc', t => {

// 	exec('node ../index.js create config', {cwd: '/Users/sgy/think3.0/think-cli/abc'}, (error, stdout, stderr) => {
// 		t.pass();
// 		t.end();
// 	})
// })

// test.serial.cb('-v', t => {
// 	require(modelPath);	
// 	exec('node index.js create config', (error, stdout, stderr) => {
// 		t.pass();
// 		t.end();
// 	})
// })



