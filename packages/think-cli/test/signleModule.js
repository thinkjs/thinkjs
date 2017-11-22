const test = require('ava')
const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs')
const exec = require('child_process').execSync
const ThinkInit = require('../lib/init.js')
const generate = require('../lib/generate')
const helper = require('think-helper');
const cacheTemplatePath = path.join(__dirname, '.think-templates', 'signleModule')
const targetDir = 'tmp'
const targetName = 'think-cli-unit-test-signle-module'
const root = path.join(__dirname, targetDir, targetName)

function readProjectPackageFile (root) {
  return helper.promisify(fs.readFile, fs)(path.join(root, 'package.json'), 'utf8')
    .then(text => JSON.parse(text))
}

const answers = {
  name: 'think-cli-test',
  author: 'Berwin <liubowen.niubi@gmail.com>',
  description: 'think-cli unit test',
  defaultModule: 'home'
}

function isMultiModule (root) {
  return helper.isExist(path.join(root, 'src/common'))
}

async function testAdd(command, maps) {
  process.chdir(root)
  const info = await readProjectPackageFile(root)
  const thinkjsInfo = info.thinkjs

  const template = thinkjsInfo.cacheTemplatePath
  const metadata = require(path.join(template, 'metadata'))
  const context = {
    action: 'user',
    type: 'type',
    actionPrefix: './',
    ROOT_PATH: './',
    APP_NAME: 'think-cli-test'
  }

  const options = {command, metadata, maps, context}
  return new Promise((resolve, reject) => {
    generate(template, root, options, (err, files) => {
      if (err) return reject(err)
      resolve(files)
    })
  })
}

test.before(() => {
  inquirer.prompt = (questions) => {
    const _answers = {}
    for (var i = 0; i < questions.length; i++) {
      const key = questions[i].name
      _answers[key] = answers[key]
    }
    return Promise.resolve(_answers)
  }
})

test.cb('should generate multi module project from local default template', t => {
  const targetPath = path.join(__dirname, targetDir, targetName)
  const init = new ThinkInit({
    template: 'think-template/standard',
    cacheTemplatePath,
    name: targetName,
    targetPath,
    clone: false,
    isMultiModule: false,
    context: {actionPrefix: './', ROOT_PATH: './', APP_NAME: 'think-cli-test'}
  })

  init.run()

  const timer = setInterval(() => {
    if (helper.isExist(targetPath)) {
      clearInterval(timer)
      t.pass()
      t.end()
    }
  }, 1000)
})

test('the project should be properly generated', async t => {
  const info = await readProjectPackageFile(root)
  t.is(info.thinkjs.isMultiModule, isMultiModule(root))
})

test('should be added the controller', async t => {
  const info = await readProjectPackageFile(root)
  const metadata = require(path.join(info.thinkjs.cacheTemplatePath, 'metadata'))
  const paths = metadata.controller.default
  const files = await testAdd('controller', paths)
  t.truthy(Object.keys(files).length === paths.length)
})

test('should be added the service', async t => {
  const metadata = require(path.join(__dirname, '../default_template', 'metadata'))
  const paths = metadata.service
  const files = await testAdd('service', paths)
  t.truthy(Object.keys(files).length === paths.length)
})

test('should be added the model', async t => {
  const metadata = require(path.join(__dirname, '../default_template', 'metadata'))
  const paths = metadata.model
  const files = await testAdd('model', paths)
  t.truthy(Object.keys(files).length === paths.length)
})

test('should be added the middleware', async t => {
  const metadata = require(path.join(__dirname, '../default_template', 'metadata'))
  const paths = metadata.middleware
  const files = await testAdd('middleware', paths)
  t.truthy(Object.keys(files).length === paths.length)
})

test('should be added the adapter', async t => {
  const metadata = require(path.join(__dirname, '../default_template', 'metadata'))
  const paths = metadata.adapter
  const files = await testAdd('adapter', paths)
  t.truthy(Object.keys(files).length === paths.length)
})

test('should be added the module', async t => {
  const metadata = require(path.join(__dirname, '../default_template', 'metadata'))
  const paths = metadata.module
  const files = await testAdd('module', paths)
  t.truthy(Object.keys(files).length === paths.length)
})

test.after(t => {
  return helper.rmdir(path.join(__dirname, targetDir))
    .then(_ => helper.rmdir(cacheTemplatePath))
})
