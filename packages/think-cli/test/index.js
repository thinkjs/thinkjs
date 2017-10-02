const test = require('ava')
const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs')
const ThinkInit = require('../lib/init.js')
const helper = require('think-helper');
const cacheTemplatePath = path.join(__dirname, '.think-templates')
const targetDir = 'tmp'
const targetName = 'think-cli-unit-test'
const localTargetName = 'think-cli-unit-test-local'
const multiModuleLocalTargetName = 'think-cli-unit-test-local-multiModule'
const multiModuleTargetName = 'think-cli-unit-test-multiModule'

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
    if (helper.isExist(targetPath)) {
      clearInterval(timer)
      t.pass()
      t.end()
    }
  }, 1000)
})

test.cb('should generate multi module project from standard template', t => {
  const targetPath = path.join(__dirname, targetDir, multiModuleTargetName)
  const init = new ThinkInit({
    template: 'standard',
    name: multiModuleTargetName,
    cacheTemplatePath,
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

test.cb('should generate single module project from a default template', t => {
  const targetPath = path.join(__dirname, targetDir, localTargetName)
  const init = new ThinkInit({
    template: path.join(__dirname, '../default_template'),
    name: localTargetName,
    cacheTemplatePath,
    targetPath,
    clone: false,
    isMultiModule: false
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

test.cb('should generate multi module project from a default template', t => {
  const targetPath = path.join(__dirname, targetDir, multiModuleLocalTargetName)
  const init = new ThinkInit({
    template: path.join(__dirname, '../default_template'),
    name: multiModuleLocalTargetName,
    cacheTemplatePath,
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
  const singleModuleRoot = path.join(__dirname, targetDir, targetName)
  const singleModulePackageInfo = await readProjectPackageFile(singleModuleRoot)
  t.is(singleModulePackageInfo.thinkjs.isMultiModule, isMultiModule(singleModuleRoot))

  const multiModuleRoot = path.join(__dirname, targetDir, multiModuleTargetName)
  const multiModulePackageInfo = await readProjectPackageFile(multiModuleRoot)
  t.is(multiModulePackageInfo.thinkjs.isMultiModule, isMultiModule(multiModuleRoot))

  const localSingleModuleRoot = path.join(__dirname, targetDir, localTargetName)
  const localSingleModulePackageInfo = await readProjectPackageFile(localSingleModuleRoot)
  t.is(localSingleModulePackageInfo.thinkjs.isMultiModule, isMultiModule(localSingleModuleRoot))

  const localmultiModuleRoot = path.join(__dirname, targetDir, multiModuleLocalTargetName)
  const localmultiModulePackageInfo = await readProjectPackageFile(localmultiModuleRoot)
  t.is(localmultiModulePackageInfo.thinkjs.isMultiModule, isMultiModule(localmultiModuleRoot))
})

test.after(t => {
  return helper.rmdir(cacheTemplatePath)
    .then(() => helper.rmdir(path.join(__dirname, targetDir)))
})
