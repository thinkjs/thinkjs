import test from 'ava';
import shell from 'shelljs';
import helper from 'think-helper';
import path from 'path';
import fs  from 'fs';

const cwd = process.cwd();

var filePath =  '../index.js';

var exec = require('child_process').exec;

const modelPath = require.resolve("../index.js");


test.serial.cb('new project name is abc', t => {
	exec('node index.js new abc', (error, stdout, stderr) => {
		exec('node ../index.js create config', {cwd: '/Users/sgy/think3.0/think-cli/abc'}, (error, stdout, stderr) => {
			t.pass();
			shell.rm('-rf', '/Users/sgy/think3.0/think-cli/abc');
			t.end();
		})
	})

	
})

test.serial.cb('new project name is abc2 for ts', t => {
	exec('node index.js new abc2 ts', (error, stdout, stderr) => {
		exec('node ../index.js create adapter test.js', {cwd: '/Users/sgy/think3.0/think-cli/abc2'}, (error, stdout, stderr) => {
			t.pass();
			shell.rm('-rf', '/Users/sgy/think3.0/think-cli/abc2');
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

test.serial.cb('create logic', t => {
	exec('node ../index.js create logic test.js',{cwd: '/Users/sgy/think3.0/think-cli/test'},  (error, stdout, stderr) => {
		t.pass();
		t.end();
	})
})

test.serial.cb('create extend', t => {
	exec('node ../index.js create extend test.js',{cwd: '/Users/sgy/think3.0/think-cli/test'},  (error, stdout, stderr) => {
		t.pass();
		t.end();
	})
})

test.serial.cb('create service', t => {
	exec('node ../index.js create service test.js',{cwd: '/Users/sgy/think3.0/think-cli/test'},  (error, stdout, stderr) => {
		t.pass();
		t.end();
	})
})


test.serial.cb('create model', t => {
	exec('node ../index.js create model test.js',{cwd: '/Users/sgy/think3.0/think-cli/test'},  (error, stdout, stderr) => {
		t.pass();
		shell.rm('-rf', '/Users/sgy/think3.0/think-cli/test/abc3');
		t.end();
	})
})


test.serial.cb('abnormal 1', t => {
	shell.mkdir('-p', '/Users/sgy/think3.0/think-cli/test/abnormal');
	exec('node ../../index.js new abc3 config',{cwd: '/Users/sgy/think3.0/think-cli/test/abnormal'},  (error, stdout, stderr) => {
		exec('node ../../index.js new abc3 config',{cwd: '/Users/sgy/think3.0/think-cli/test/abnormal'},  (error, stdout, stderr) => {
			t.pass();
			shell.rm('-rf', '/Users/sgy/think3.0/think-cli/test/abnormal');
			t.end();
		})
	})
})

test.serial.cb('abnormal 2', t => {
	shell.mkdir('-p', '/Users/sgy/think3.0/think-cli/test/abnormal2');
	fs.writeFile('/Users/sgy/think3.0/think-cli/test/abnormal2/think.json','test', function() {
		exec('node ../../index.js new abc3 config',{cwd: '/Users/sgy/think3.0/think-cli/test/abnormal2'},  (error, stdout, stderr) => {
			exec('node ../../index.js new abc3 config',{cwd: '/Users/sgy/think3.0/think-cli/test/abnormal2'},  (error, stdout, stderr) => {
				t.pass();
				shell.rm('-rf', '/Users/sgy/think3.0/think-cli/test/abnormal2');
				t.end();
			})
		})
	})
	
})

test.serial.cb('-v', t => {
	exec('node index.js -v', (error, stdout, stderr) => {
		t.pass();
    	t.end();
	})
})



