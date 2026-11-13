'use strict';

// These tests intentionally use the JavaScript runtime as the compatibility oracle.
// No server or database is started. Each test restores the process-global think.
const assert = require('node:assert/strict');
const path = require('node:path');
const {test} = require('node:test');
const root = path.resolve(__dirname, '../..');
const fixture = name => path.join(__dirname, 'fixtures', name);
const runtime = name => require(path.join(root, 'packages', name));
const CommonLoader = runtime('think-loader/loader/common.js');
const ConfigLoader = runtime('think-loader/loader/config.js');
const ExtendLoader = runtime('think-loader/loader/extend.js');
const {extend} = runtime('think-loader/loader/util.js');
const {Config, getConfigFn} = runtime('think-config');
const context = runtime('thinkjs/lib/extend/context.js');
const controller = runtime('thinkjs/lib/extend/controller.js');

function freshThink(t) {
  const descriptor = Object.getOwnPropertyDescriptor(global, 'think');
  const filename = require.resolve(path.join(root, 'packages/thinkjs/lib/think.js'));
  const cached = require.cache[filename];
  delete require.cache[filename];
  t.after(() => {
    delete require.cache[filename];
    if (cached) require.cache[filename] = cached;
    if (descriptor) Object.defineProperty(global, 'think', descriptor);
    else delete global.think;
  });
  require(filename);
  return global.think;
}

function multiThink(t) {
  const think = freshThink(t);
  think.app.modules = ['common', 'admin'];
  think.app.services = CommonLoader.load(fixture('multi'), 'service', think.app.modules);
  return think;
}

test('single-module services preserve constructor arguments, object identity and nested default exports', t => {
  const think = freshThink(t);
  think.app.modules = [];
  think.app.services = CommonLoader.load(fixture('single'), 'service', []);
  const options = {enabled: true};
  assert.deepEqual(think.service('constructor', options, 42).args, [options, 42]);
  assert.deepEqual(think.service('function', options).args, [options]);
  assert.notStrictEqual(think.service('constructor'), think.service('constructor'));
  // The runtime passes an explicit undefined even when no constructor argument is given.
  assert.deepEqual(think.service('constructor').args, [undefined]);
  assert.strictEqual(think.service('object'), think.app.services.object);
  assert.strictEqual(think.service('object'), think.service('object'));
  const nested = think.service('nested/default', options);
  assert.deepEqual(nested.args, [options]);
  assert.equal(nested.__filename, fixture('single/service/nested/default.js'));
  assert.throws(() => think.service('missing'), /can not find service: missing/);
});

test('arrow service exports are unsupported by both loading and construction', t => {
  const think = freshThink(t);
  think.app.modules = [];
  const arrow = require(fixture('unsupported/service/arrow.js'));
  think.app.services = {arrow};
  assert.throws(() => think.service('arrow'), TypeError);
  // CommonLoader attempts to attach __filename to the nonexistent arrow prototype.
  assert.throws(() => CommonLoader.load(fixture('unsupported'), 'service', []), TypeError);
});

test('multi-module services default to common, inherit common exports and allow module overrides', t => {
  const think = multiThink(t);
  assert.equal(think.service('shared').source, 'common');
  assert.deepEqual(think.service('shared').args, []);
  const service = think.service('shared', 'admin', 1, 2);
  assert.equal(service.source, 'admin');
  assert.deepEqual(service.args, [1, 2]);
  assert.strictEqual(think.service('only_common', 'admin'), think.service('only_common'));
  assert.equal(think.service('shared', undefined, 3).source, 'common');
  assert.deepEqual(think.service('shared', undefined, 3).args, [3]);
  // Unknown explicit modules do not fall back to the common registry.
  assert.throws(() => think.service('shared', 'missing'), /can not find service/);
});

test('Context.service forwards arguments unchanged; Controller.service can infer its context module', t => {
  const think = multiThink(t);
  const ctx = extend({module: 'admin', app: think.app}, context);
  const ctl = extend(new think.Controller(ctx), controller);
  assert.equal(ctx.service('shared').source, 'common');
  assert.equal(ctx.service('shared', 'admin').source, 'admin');
  assert.equal(ctl.service('shared').source, 'admin');
  const options = {token: 1};
  assert.deepEqual(ctl.service('shared', options).args, [options]);
  assert.equal(ctl.service('shared', 'common').source, 'common');
  // Inferred controller module means an unrecognized second string is a constructor argument.
  assert.deepEqual(ctl.service('shared', 'payload').args, ['payload']);
  assert.throws(() => ctx.service('shared', 'payload'), /can not find service/);
  // A missing context-module registry retains the global common default.
  ctx.module = 'missing';
  assert.equal(ctl.service('shared').source, 'common');
  ctx.module = 'admin';
  assert.strictEqual(ctl.ctx, ctx);
  think.app.modules = [];
  think.app.services = CommonLoader.load(fixture('single'), 'service', []);
  assert.deepEqual(ctx.service('constructor', options).args, [options]);
  assert.deepEqual(ctl.service('constructor', options).args, [options]);
});

test('Config loading deep-merges common/module and environment layers in runtime order', () => {
  const configs = new ConfigLoader().load(fixture('multi'), 'testing', ['common', 'admin']);
  assert.equal(configs.admin.label, 'common-env');
  assert.deepEqual(configs.admin.nested, {common: true, admin: true, environment: true, winner: 'admin-env'});
  assert.deepEqual(configs.common.nested, {common: true, environment: true, winner: 'common-env'});
  // Arrays merge by index; a shorter override does not truncate the base array.
  assert.deepEqual(configs.admin.sequence, ['environment', 'tail']);
  assert.notStrictEqual(configs.common.nested, configs.admin.nested);
});

test('Config arguments distinguish get/set, dotted keys, all modules and comma-separated modules', () => {
  const single = getConfigFn({nested: {value: 1}}, false);
  assert.equal(single('nested.value'), 1);
  assert.equal(single('nested.absent.value'), undefined);
  assert.ok(single('nested.value', 2) instanceof Config);
  assert.equal(single('nested.value', undefined, 'ignored'), 2);
  single('nullable', null);
  assert.equal(single('nullable'), null);
  assert.equal(single().nested.value, 2);
  single('created.deep.value', 7);
  assert.equal(single('created.deep.value'), 7);
  single('scalar', 1);
  single('scalar.deep', 8);
  assert.deepEqual(single('scalar'), {deep: 8});
  single('list', ['first']);
  assert.equal(single('list.0'), undefined);
  const multi = getConfigFn({common: {value: 1}, admin: {value: 2}, api: {value: 3}}, true);
  assert.equal(multi('value'), 1);
  assert.equal(multi('value', undefined, 'admin'), 2);
  assert.equal(multi('value', undefined, 'missing'), 1);
  // A second string is a value to set, not a module selector.
  assert.equal(multi('value', 'admin'), undefined);
  assert.equal(multi('value'), 'admin');
  multi('value', 4, 'admin,api,missing');
  assert.equal(multi('value', undefined, 'admin'), 4);
  assert.equal(multi('value', undefined, 'api'), 4);
  multi('value', 5, true);
  for (const module of ['common', 'admin', 'api']) assert.equal(multi('value', undefined, module), 5);
});

test('Context and Controller config default to their request module and permit explicit overrides', t => {
  const think = multiThink(t);
  think.config = getConfigFn({common: {value: 1}, admin: {value: 2}}, true);
  const ctx = extend({module: 'admin'}, context);
  const ctl = extend(new think.Controller(ctx), controller);
  assert.equal(ctx.config('value'), 2);
  assert.equal(ctl.config('value'), 2);
  assert.equal(ctx.config('value', undefined, 'common'), 1);
  ctl.config('value', 3);
  assert.equal(ctx.config('value'), 3);
});

test('models preserve registry identity, nested basename, fallback and context-specific config', t => {
  const think = multiThink(t);
  const app = think.app;
  app.models = CommonLoader.load(fixture('multi'), 'model', app.modules);
  class Adapter {}
  think.config = getConfigFn({
    common: {model: {handle: Adapter, prefix: 'common_'}, cache: {scope: 'common'}},
    admin: {model: {handle: Adapter, prefix: 'admin_'}, cache: {scope: 'admin'}}
  }, true);
  const extensions = runtime('think-model')(app);
  extend(think, extensions.think);
  const ctx = extend(extend({module: 'admin'}, context), extensions.context);
  const ctl = extend(extend(new think.Controller(ctx), controller), extensions.controller);
  const common = think.model('nested/record');
  assert.equal(common.source, 'common');
  assert.equal(common.modelName, 'record');
  assert.strictEqual(common.models, app.models.common);
  const admin = ctl.model('nested/record');
  assert.equal(admin.source, 'admin');
  assert.strictEqual(admin.models, app.models.admin);
  assert.equal(admin.config.prefix, 'admin_');
  const override = ctx.model('nested/record', undefined, 'common');
  assert.equal(override.source, 'common');
  // An explicit model module changes registry selection, not the Context's config module.
  assert.equal(override.config.prefix, 'admin_');
  assert.deepEqual(override._cacheConfig, {scope: 'admin'});
  assert.equal(think.model('nested/record', undefined, 'admin').config.prefix, 'admin_');
  const fallback = ctx.model('nested/missing');
  assert.ok(fallback instanceof extensions.think.Model);
  assert.equal(fallback.modelName, 'missing');
  assert.strictEqual(fallback.models, app.models.admin);
  assert.ok(think.model('missing', undefined, 'unknown') instanceof extensions.think.Model);
  app.modules = [];
  app.models = {record: app.models.common['nested/record']};
  const single = think.model('record', {prefix: 'override_'}, 'admin');
  assert.equal(single.source, 'common');
  assert.strictEqual(single.models, app.models);
  assert.equal(single.config.prefix, 'override_');
  assert.ok(think.model('missing') instanceof extensions.think.Model);
});

test('Extend applies system, ordered configured, then common application extensions with receiver/getters intact', () => {
  const extensions = ExtendLoader.load(fixture('multi'), ['common', 'admin']);
  const ctx = extend({marker: 'original', method: 'GET'}, extensions.context);
  assert.equal(ctx.order, 'application');
  assert.equal(ctx.first, true);
  assert.equal(ctx.second, true);
  assert.equal(ctx.adminOnly, undefined);
  assert.strictEqual(ctx.identity(), ctx);
  assert.equal(ctx.receiver, 'original');
  ctx.receiver = 'updated';
  assert.equal(ctx.marker, 'updated');
  assert.equal(typeof Object.getOwnPropertyDescriptor(ctx, 'receiver').get, 'function');
  // Assigning a value over a getter-only system extension does not replace that getter.
  assert.equal(ctx.isGet, true);
  const service = extend({}, extensions.service);
  assert.strictEqual(service.identity(), service);
  const ctl = extend({ctx: {body: 'before'}}, extensions.controller);
  assert.equal(ctl.body, 'before');
  ctl.body = 'after';
  assert.equal(ctl.ctx.body, 'after');
});
