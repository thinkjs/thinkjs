import test from 'ava';
import {Config} from '../index.js';


test('config init', t => {
    let config = new Config({name: 1});
    t.deepEqual(config.config, {name: 1})
})

test('config get all', t => {
    let config = new Config({name: 1});
    t.deepEqual(config.get(), {name: 1})
})
test('config get 1', t => {
    let config = new Config({name: 1});
    t.deepEqual(config.get('name'), 1)
})

test('config get 2', t => {
    let config = new Config({name: {value: 2}});
    t.deepEqual(config.get('name.value'), 2)
})

test('config get 3', t => {
    let config = new Config({name: {value: 2}});
    t.deepEqual(config.get('test'), undefined)
})

test('config get 4', t => {
    let config = new Config({name: {value: 2}});
    t.deepEqual(config.get('name.test'), undefined)
})

test('config get 5', t => {
    let config = new Config({name: {value: 2}});
    t.deepEqual(config.get('name'), {value: 2})
})

test('config get 6', t => {
    let config = new Config({name: {value: 2}});
    t.deepEqual(config.get('name.value', {name: {value: 3}}), 3)
})

test('config get 7', t => {
    let config = new Config({name: {value: 2}});
    t.deepEqual(config.get('name.value', {}), undefined)
})

test('config set 1', t => {
    let config = new Config({name: 1});
    config.set('name', 2)
    t.deepEqual(config.get('name'), 2)
})

test('config set 2', t => {
    let config = new Config({name: 1});
    config.set('name.value', 2)
    t.deepEqual(config.get('name'), {value: 2})
})

test('config set 3', t => {
    let config = new Config({name: {value: 1}});
    config.set('name.value', 2)
    t.deepEqual(config.get('name'), {value: 2})
})

test('config set 4', t => {
    let config = new Config({name: {value: 1}});
    config.set('name.value.test', 2)
    t.deepEqual(config.get('name'), {value: {test: 2}})
})

test('config set 5', t => {
    let config = new Config({name: {test: 1}});
    config.set('name.value', 2)
    t.deepEqual(config.get('name'), {value: 2, test: 1})
})

test('config set 6', t => {
    let config = new Config({name: 2});
    config.set('name.value', {name: 3})
    t.deepEqual(config.get('name'), {value: {name: 3}})
})