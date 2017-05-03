import test from 'ava';
import shell from 'shelljs';
import helper from 'think-helper';
import path from 'path';
import fs  from 'fs';

const cwd = process.cwd();

var filePath =  '../index.js';

var exec = require('child_process').exec;

const modelPath = require.resolve("../index.js");
const projectPath = path.join(__dirname,'../');
const testDirPath = path.join(projectPath,'test');

test.serial.cb('new project name is abc', t => {
	let dirPath = path.join(projectPath,'abc');
	exec('node index.js new abc', (error, stdout, stderr) => {
		exec('node ../index.js create config', {cwd: dirPath}, (error, stdout, stderr) => {
			t.pass();
			shell.rm('-rf', dirPath);
			t.end();
		})
	})

	
})

test.serial.cb('new project name is abc2 for ts', t => {
	let dirPath = path.join(projectPath,'abc2');
	exec('node index.js new abc2 ts', (error, stdout, stderr) => {
		exec('node ../index.js create adapter test.js', {cwd: dirPath}, (error, stdout, stderr) => {
			t.pass();
			shell.rm('-rf', dirPath);
			t.end();
		})
	})
})

test.serial.cb('new project name is abc3 for config', t => {

	exec('node ../index.js new abc3 config',{cwd: testDirPath},  (error, stdout, stderr) => {
		t.pass();
		t.end();
	})
})

test.serial.cb('create logic', t => {
	exec('node ../index.js create logic test.js',{cwd: testDirPath},  (error, stdout, stderr) => {
		t.pass();
		t.end();
	})
})

test.serial.cb('create extend', t => {
	exec('node ../index.js create extend test.js',{cwd: testDirPath},  (error, stdout, stderr) => {
		t.pass();
		t.end();
	})
})

test.serial.cb('create service', t => {
	exec('node ../index.js create service test.js',{cwd: testDirPath},  (error, stdout, stderr) => {
		t.pass();
		t.end();
	})
})


test.serial.cb('create model', t => {
	let dirPath = path.join(testDirPath,"abc3");
	exec('node ../index.js create model test.js',{cwd: testDirPath},  (error, stdout, stderr) => {
		t.pass();
		shell.rm('-rf', dirPath);
		t.end();
	})
})


test.serial.cb('abnormal 1', t => {
	let dirPath = path.join(testDirPath, 'abnormal');
	shell.mkdir('-p', dirPath);
	exec('node ../../index.js new abc3 config',{cwd: dirPath},  (error, stdout, stderr) => {
		exec('node ../../index.js new abc3 config',{cwd: dirPath},  (error, stdout, stderr) => {
			t.pass();
			shell.rm('-rf', dirPath);
			t.end();
		})
	})
})

test.serial.cb('abnormal 2', t => {
	let dirPath = path.join(testDirPath, 'abnormal2');
	let thinkjsonPath = path.join(dirPath, 'think.json');
	shell.mkdir('-p', dirPath);
	fs.writeFile(thinkjsonPath,'test', function() {
		exec('node ../../index.js new abc3 config',{cwd: dirPath},  (error, stdout, stderr) => {
			exec('node ../../index.js new abc3 config',{cwd: dirPath},  (error, stdout, stderr) => {
				t.pass();
				shell.rm('-rf', dirPath);
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



