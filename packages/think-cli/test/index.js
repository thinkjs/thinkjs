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
const multiModuleTargetName = 'think-cli-unit-test-multiModule'

const answers = {
  name: 'think-cli-test',
  author: 'Berwin <liubowen.niubi@gmail.com>',
  description: 'think-cli unit test',
  defaultModule: 'home'
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

test.cb('should generation think-cli-unit-test project', t => {
  const targetPath = path.join(__dirname, targetDir, targetName)
  const init = new ThinkInit({
    template: 'speike-template-haotech',
    name: targetName,
    cacheTemplatePath,
    targetPath,
    clone: false
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

test.cb('project content be equal to answers', t => {
  const targetPath = path.join(__dirname, targetDir, targetName)
  fs.readFile(path.join(targetPath, 'Server', 'package.json'), 'utf8', (err, data) => {
    if (err) throw err
    const json = JSON.parse(data)
    t.is(json.name, answers.name)
    t.is(json.description, answers.description)
    t.is(json.author, answers.author)
    t.end()
  })
})

test.cb('should generate from a local template', t => {
  const targetPath = path.join(__dirname, targetDir, localTargetName)
  const init = new ThinkInit({
    template: path.join(__dirname, './test-template'),
    targetPath,
    name: localTargetName
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

test.cb('local template generate project content be equal to answers', t => {
  const targetPath = path.join(__dirname, targetDir, localTargetName)
  fs.readFile(path.join(targetPath, 'index.js'), 'utf8', (err, data) => {
    if (err) throw err
    const json = JSON.parse(data)
    t.is(json.name, answers.name)
    t.is(json.description, answers.description)
    t.is(json.author, answers.author)
    t.end()
  })
})

test.cb('should generate multi module project from a local template', t => {
  const targetPath = path.join(__dirname, targetDir, multiModuleTargetName)
  const init = new ThinkInit({
    template: path.join(__dirname, './test-template'),
    targetPath,
    name: multiModuleTargetName,
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

test.cb('local template generate multi module project content be equal to multiModule', t => {
  const targetPath = path.join(__dirname, targetDir, multiModuleTargetName)
  t.true(helper.isExist(path.join(targetPath, 'src/common/bootstrap')), 'The multi module project directory is incorrect')
  t.end()
})

test.after(t => {
  return helper.rmdir(cacheTemplatePath)
    .then(() => helper.rmdir(path.join(__dirname, targetDir)))
})
