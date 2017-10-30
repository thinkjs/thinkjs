const test = require('ava')
const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs')
const exec = require('child_process').execSync
const ThinkInit = require('../lib/init.js')
const ThinkAdd = require('../lib/add')
const helper = require('think-helper');
const targetDir = 'tmp'
const targetName = 'think-cli-unit-test-local-multi-module'
const name = 'user'
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

async function testAdd(paths) {
  process.chdir(root)
  const info = await readProjectPackageFile(root)
  const thinkjsInfo = info.thinkjs

  const isMultiModule = thinkjsInfo.isMultiModule
  const moduleName = thinkjsInfo.metadata.defaultModule
  const template = thinkjsInfo.templateName
  const add = new ThinkAdd({name: 'user', moduleName, paths, template, isMultiModule, clone: thinkjsInfo.clone})
  return await add.run()
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
    template: path.join(__dirname, '../default_template'),
    name: targetName,
    targetPath,
    clone: false,
    isMultiModule: true
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
  const files = await testAdd(paths)
  for (let i = 0; i < paths.length; i++) {
    t.truthy(files[i].endsWith(paths[i][1]))
  }
})

test('should be added the service', async t => {
  const metadata = require(path.join(__dirname, '../default_template', 'metadata'))
  const paths = metadata.service
  const files = await testAdd(paths)
  for (let i = 0; i < paths.length; i++) {
    t.truthy(files[i].endsWith(paths[i][1]))
  }
})

test('should be added the model', async t => {
  const metadata = require(path.join(__dirname, '../default_template', 'metadata'))
  const paths = metadata.model
  const files = await testAdd(paths)
  for (let i = 0; i < paths.length; i++) {
    t.truthy(files[i].endsWith(paths[i][1]))
  }
})

test('should be added the middleware', async t => {
  const metadata = require(path.join(__dirname, '../default_template', 'metadata'))
  const paths = metadata.middleware
  const files = await testAdd(paths)
  for (let i = 0; i < paths.length; i++) {
    t.truthy(files[i].endsWith(paths[i][1]))
  }
})

test('should be added the adapter', async t => {
  const metadata = require(path.join(__dirname, '../default_template', 'metadata'))
  const paths = metadata.adapter
  const type = 'user';

  for (let i = 0; i < paths.length; i++) {
    paths[i][1] = paths[i][1].replace(/(\[type\])/g, type)
  }
  const files = await testAdd(paths)
  for (let i = 0; i < paths.length; i++) {
    t.truthy(files[i].endsWith(paths[i][1]))
  }
})

test.after(t => {
  return helper.rmdir(path.join(__dirname, targetDir))
})
