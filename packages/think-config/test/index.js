import test from 'ava';
import {Config, getConfigFn} from '../index.js';

test('config init', t => {
  const config = new Config({name: 1});
  t.deepEqual(config.config, {name: 1});
});

test('config get all', t => {
  const config = new Config({name: 1});
  t.deepEqual(config.get(), {name: 1});
});
test('config get 1', t => {
  const config = new Config({name: 1});
  t.deepEqual(config.get('name'), 1);
});

test('config get 2', t => {
  const config = new Config({name: {value: 2}});
  t.deepEqual(config.get('name.value'), 2);
});

test('config get 3', t => {
  const config = new Config({name: {value: 2}});
  t.deepEqual(config.get('test'), undefined);
});

test('config get 4', t => {
  const config = new Config({name: {value: 2}});
  t.deepEqual(config.get('name.test'), undefined);
});

test('config get 5', t => {
  const config = new Config({name: {value: 2}});
  t.deepEqual(config.get('name'), {value: 2});
});

test('config get 6', t => {
  const config = new Config({name: {value: 2}});
  t.deepEqual(config.get('name.value', {name: {value: 3}}), 3);
});

test('config get 7', t => {
  const config = new Config({name: {value: 2}});
  t.deepEqual(config.get('name.value', {}), undefined);
});

test('config set 1', t => {
  const config = new Config({name: 1});
  config.set('name', 2);
  t.deepEqual(config.get('name'), 2);
});

test('config set 2', t => {
  const config = new Config({name: 1});
  config.set('name.value', 2);
  t.deepEqual(config.get('name'), {value: 2});
});

test('config set 3', t => {
  const config = new Config({name: {value: 1}});
  config.set('name.value', 2);
  t.deepEqual(config.get('name'), {value: 2});
});

test('config set 4', t => {
  const config = new Config({name: {value: 1}});
  config.set('name.value.test', 2);
  t.deepEqual(config.get('name'), {value: {test: 2}});
});

test('config set 5', t => {
  const config = new Config({name: {test: 1}});
  config.set('name.value', 2);
  t.deepEqual(config.get('name'), {value: 2, test: 1});
});

test('config set 6', t => {
  const config = new Config({name: 2});
  config.set('name.value', {name: 3});
  t.deepEqual(config.get('name'), {value: {name: 3}});
});

test('getConfigFn 1', t => {
  const fn = getConfigFn({name: 1}, false);
  const result = fn('name');
  t.deepEqual(result, 1);
});

test('getConfigFn 2', t => {
  const fn = getConfigFn({name: 1}, false);
  fn('name', 2);
  t.deepEqual(fn('name'), 2);
});

test('getConfigFn 3', t => {
  const fn = getConfigFn({name: 1}, false);
  fn('name', 2, 'test');
  t.deepEqual(fn('name'), 2);
});

test('getConfigFn 4', t => {
  const fn = getConfigFn({home: {name: 1}, common: {name: 2}}, true);
  fn('name', 2);
  t.deepEqual(fn('name'), 2);
});

test('getConfigFn 5', t => {
  const fn = getConfigFn({home: {name: 1}, common: {name: 2}}, true);
  fn('name', 2);
  t.deepEqual(fn('name', undefined, 'home'), 1);
});

test('getConfigFn 6', t => {
  const fn = getConfigFn({home: {name: 1}, common: {name: 2}}, true);
  fn('name', 2);
  t.deepEqual(fn('name', undefined, 'home333'), 2);
});

test('getConfigFn 7', t => {
  const fn = getConfigFn({home: {name: 1}, common: {name: 2}}, true);
  fn('name', 3, 'home');
  t.deepEqual(fn('name', undefined, 'home'), 3);
  t.deepEqual(fn('name'), 2);
});

test('getConfigFn 8', t => {
  const fn = getConfigFn({home: {name: 1}, common: {name: 2}, admin: {name: 4}}, true);
  fn('name', 3, 'home,admin');
  t.deepEqual(fn('name', undefined, 'home'), 3);
  t.deepEqual(fn('name', undefined, 'admin'), 3);
  t.deepEqual(fn('name'), 2);
});

test('getConfigFn 9', t => {
  const fn = getConfigFn({home: {name: 1}, common: {name: 2}, admin: {name: 4}}, true);
  fn('name', 3, true);
  t.deepEqual(fn('name', undefined, 'home'), 3);
  t.deepEqual(fn('name', undefined, 'admin'), 3);
  t.deepEqual(fn('name'), 3);
});
