const test = require('ava')
const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs')
const ThinkInit = require('../lib/init.js')
const ThinkAdd = require('../lib/add')
const helper = require('think-helper');
const cacheTemplatePath = path.join(__dirname, '.think-templates', 'signleModule')
const targetDir = 'tmp'
const targetName = 'think-cli-unit-test'
const name = 'user'

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

test.cb('should generate single module project from standard template', t => {
  const targetPath = path.join(__dirname, targetDir, targetName)
  const init = new ThinkInit({
    template: 'standard',
    name: targetName,
    cacheTemplatePath,
    targetPath,
    clone: false,
    isMultiModule: false
  })

  init.run()

  const timer = setInterval(() => {
    if (helper.isExist(targetPath) && helper.isExist(cacheTemplatePath)) {
      clearInterval(timer)
      t.pass()
      t.end()
    }
  }, 1000)
})

test('the project should be properly generated', async t => {
  const root = path.join(__dirname, targetDir, targetName)
  const info = await readProjectPackageFile(root)
  t.is(info.thinkjs.isMultiModule, isMultiModule(root))
})

test('should be added the controller', async t => {
  const root = path.join(__dirname, targetDir, targetName)
  const info = await readProjectPackageFile(root)
  const thinkjsInfo = info.thinkjs

  const isMultiModule = thinkjsInfo.isMultiModule
  const moduleName = thinkjsInfo.defaultModule
  const template = thinkjsInfo.templateName
  console.log('--------')
  const metadata = require(path.join(cacheTemplatePath, 'metadata'))
  const paths = metadata.controller.default
  const add = new ThinkAdd({name: 'user', moduleName, paths, template, cacheTemplatePath, isMultiModule, clone: thinkjsInfo.clone})
  const files = await add.run()
  console.log(files)
  t.pass()
})

test.after(t => {
  // return helper.rmdir(cacheTemplatePath)
    // .then(() => helper.rmdir(path.join(__dirname, targetDir)))
})
