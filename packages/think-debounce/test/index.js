import test from 'ava';
import Debounce from '../index.js';
import fs from 'fs';

const instance = new Debounce();
test('await', t => {
  let readTimes = 0;

  const filePath = '../README.md';
  const awaitKey = 'readMyFile';
  const readFileCallback = () => {
    return new Promise((resolve, reject) => {
      readTimes ++;
      fs.readFile(filePath, {encoding: 'utf8'}, (err, data) => {
        if(err) reject(err);
        resolve(data);
      });
    });
  }

  let promise1 = instance.debounce(awaitKey, readFileCallback);
  let promise2 = instance.debounce(awaitKey, readFileCallback);


  return Promise.all([promise1, promise2]).then(values => {
    t.is(readTimes, 1);
    t.is(values[0], values[1]);
  }, reason => {
    t.is(readTimes, 1);
  });
});

test('await 1', t => {

  let readTimes = 0;

  const filePath = '../nonexistence'; // read a nonexistent file
  const awaitKey = 'readMyFile1'; // Don't use the same key in different test cases!
  const readFileCallback = () => {
    return new Promise((resolve, reject) => {
      readTimes ++;
      fs.readFile(filePath, {encoding: 'utf8'}, (err, data) => {
        if(err) reject(err);
        resolve(data);
      });
    });
  }

  let promise1 = instance.debounce(awaitKey, readFileCallback);
  let promise2 = instance.debounce(awaitKey, readFileCallback);

  return Promise.all([promise1, promise2]).then(values => {
    t.is(readTimes, 1);
    t.is(values[0], values[1]);
  }, reason => {
    t.is(readTimes, 1);
  });
});