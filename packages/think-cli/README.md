# think-cli
[![Build Status](https://travis-ci.org/thinkjs/think-cli.svg?branch=master)](https://travis-ci.org/thinkjs/think-cli)
[![AppVeyor](https://img.shields.io/appveyor/ci/lizheming/think-cli.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48ZyBmaWxsPSIjMUJBMUUyIiB0cmFuc2Zvcm09InNjYWxlKDgpIj48cGF0aCBkPSJNMCAyLjI2NWw2LjUzOS0uODg4LjAwMyA2LjI4OC02LjUzNi4wMzd6Ii8%2BPHBhdGggZD0iTTYuNTM2IDguMzlsLjAwNSA2LjI5My02LjUzNi0uODk2di01LjQ0eiIvPjxwYXRoIGQ9Ik03LjMyOCAxLjI2MWw4LjY3LTEuMjYxdjcuNTg1bC04LjY3LjA2OXoiLz48cGF0aCBkPSJNMTYgOC40NDlsLS4wMDIgNy41NTEtOC42Ny0xLjIyLS4wMTItNi4zNDV6Ii8%2BPC9nPjwvc3ZnPg==)](https://ci.appveyor.com/project/lizheming/think-cli)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-cli/badge.svg)](https://coveralls.io/github/thinkjs/think-cli)

`think-cli` is a command-line interface for ThinkJS.

## Installation

```
$ npm install -g think-cli
```

## Commands:
* [new](#new) - generate a new project from a template
* [list](#official-templates) - list available official templates
* [module](#module) - add module from a template
* [controller](#controller) - add controller from a template
* [service](#service) - add service from a template
* [model](#model) - add model from a template
* [middleware](#middleware) - add middleware from a template
* [adapter](#adapter) - add adapter from a template
* [migrate](#migrate) - migrate the project to think-cli 2.0
* [sync](#sync) - Synchronize the latest version of the project template to the local cache directory
* [clean](#clean) - Clear the project template cache

### new

**Usage:**

```
$ thinkjs new <project-name> <template-name>
```

**Example:**
```
$ thinkjs new my-project standard
```

The above command pulls the template from [think-template/standard](https://github.com/think-template/standard), prompts for some information, and generates the project at ./my-project/.

* <project-name> is optional, defaults to the current working directory
* <template-name> is optional, default is the standard template, support offline use

**Example:**
```
$ thinkjs new
```

The above command, prompts for some information, and generates the project at ./ (current working directory), support offline use

If you want to create a multi-module project, you need to add the `-m` parameter:

```
$ thinkjs new -m
```

#### official templates

thinkjs provide some recommended templates.

All official project templates are repos in the [think-template organization](https://github.com/think-template). When a new template is added to the organization, you will be able to run `thinkjs new <project-name> <template-name>` to use that template. You can also run `thinkjs list` to see all available official templates.

Current available templates include:

* [standard](https://github.com/think-template/standard) - A full-featured standard template

#### Custom Templates

It's unlikely to make everyone happy with the official templates. You can simply fork an official template and then use it via `think-cli` with:

```
$ thinkjs new my-project username/repo
```
Where `username/repo` is the GitHub repo shorthand for your fork.

The shorthand repo notation is passed to [download-git-repo](https://github.com/flipxfx/download-git-repo) so you can also use things like `bitbucket:username/repo` for a Bitbucket repo and `username/repo#branch` for tags or branches.

If you would like to download from a private repository use the `—clone` flag and the cli will use `git clone` so your SSH keys are used.

#### Local Templates

Instead of a GitHub repo, you can also use a template on your local file system:

```
$ thinkjs new my-project ~/fs/path/to-custom-template
```

### controller

**Usage:**

```
$ thinkjs controller <controller-name> [module-name]
```

**Example:**
```
$ thinkjs controller user home
```

The above command generates the controller at `src/home/controller/user.js`

* module-name is optional, defaults to the `thinkjs.defaultModule` in in the package.json file of project root directory, you can modify it, **module-name only be used in multi-module projects**

You can also add the `-r` parameter to create a rest type controller

**Example:**
```
$ thinkjs controller user -r
```

### service

**Usage:**

```
$ thinkjs service <service-name> [module-name]
```

**Example:**
```
$ thinkjs service user home
```

The above command generates the service at `src/home/service/user.js`

As with controller, `module-name` is optional and can only be used in multi-module projects

### model

**Usage:**

```
$ thinkjs model <model-name> [module-name]
```

**Example:**
```
$ thinkjs model user home
```

The above command generates the model at `src/home/model/user.js`

As with controller, `module-name` is optional and can only be used in multi-module projects

### middleware

**Usage:**

```
$ thinkjs middleware <middleware-name> [module-name]
```

**Example:**
```
$ thinkjs middleware user home
```

The above command generates the middleware at `src/home/middleware/user.js`

As with controller, `module-name` is optional and can only be used in multi-module projects

### adapter

**Usage:**

```
$ thinkjs adapter <adapter> [module-name]
```

**Example:**
create a adapter with the name base type user
```
$ thinkjs adapter user/base home
```

The above command generates the adapter at `src/home/adapter/user/base.js`

adapter name is optional, defaults to the `base`, Example:

```
$ thinkjs adapter user
```

The above command generates the adapter at `src/adapter/user/base.js`

As with controller, `module-name` is optional and can only be used in multi-module projects

### module
> The command can only be used in multi-module projects

**Usage:**

```
$ thinkjs module [module-name]
```

**Example:**
```
$ thinkjs module user
```

The above command generates a module with the name `user`

As with controller, `module-name` is optional,defaults to the `thinkjs.defaultModule` in in the package.json file of project root directory.


### migrate

**Usage:**

```
$ thinkjs module [module-name]
```

If your project was created with think-cli 1.0 and you want to use the capabilities of think-cli 2.0, you need to use `migrate` command to migrate your project to think-cli 2.0.

### sync

**Usage:**

```
$ thinkjs sync
```

The command will synchronize the latest version of the project template to the local cache directory.

### clean

**Usage:**

```
$ thinkjs clean
```

The command will delete the project template cache.

After the template cache is deleted, your next create file command will pull the latest template

## Writing Custom Templates from Scratch

* A template repo **must** have a `template` directory that holds the template files.
* A template repo **must** have a metadata file for the template which can be either a `metadata.js` or `metadata.json` file. It can contain the following fields:
  * prompts: used to collect user options data;
  * skipCompile: used to skip template compile, usually used for pictures and other resource files;
  * completeMessage: the message to be displayed to the user when the template has been generated. You can include custom instruction here.
  * new: new command mapping configuration
  * controller: controller command mapping configuration
  * model: model command mapping configuration
  * service: service command mapping configuration
  * middleware: middleware command mapping configuration
  * adapter: adapter command mapping configuration
  * module: module command mapping configuration
* Template can use any parameter carried in the command line

### prompts

The prompts field in the metadata file should be an object hash containing prompts for the user. For each entry, the key is the variable name and the value is an [Inquirer.js question object](https://github.com/SBoudrias/Inquirer.js/#question). Example:

```javascript
{
  "prompts": {
    "name": {
      "type": "string",
      "required": true,
      "message": "Project name"
    }
  }
}
```

After all prompts are finished, all files inside template will be rendered using [Ejs](http://ejs.co/), with the prompt results as the data.

### skipCompile

The project template is not always some code file, there are also some resource files, such as pictures, fonts, etc.

Only the code file needs to be compiled, because the code file may need to use syntax such as variables or conditional judgment, and pictures and other resource files are not needed, so we are use skipCompile field Skip these files.

The `skipCompile` field in the metadata file should be a [minimatch glob pattern](https://github.com/isaacs/minimatch). The files matched should skip rendering. Example:

```javascript
{
  "skipCompile": "src/**/*.png"
}
```

or

```javascript
{
  "skipCompile": [
    "src/**/*.css",
    "src/**/*.png"
  ]
}
```

### completeMessage

The `skipCompile` field in the metadata file, it can access the variables in the template, as well as all the syntax provided by EJS. Example:

```javascript
{
  "completeMessage": "To get started:\n\n<% if (!inPlace) { %># enter path\n$ cd <%= destDirName %>\n\n<% } %># install dependencies:\n$ npm install\n\n# run the app\n$ npm start"
}
```

### new

The `skipCompile` field in the metadata file should be an object hash containing map configuration required to generate a project from a template. It contain the following fields：

  * default: Generate single module project mapping configuration
  * multiModule: Generate multi-module project mapping configuration

Example:

```javascript
{
  "new": {
    "default": [
      ["src/bootstrap", "src/bootstrap"],
      ["src/config", "src/config"],
      ["src/controller/base.js", "src/controller/base.js"],
      ["src/controller/index.js", "src/controller/index.js"],
      ["src/logic", "src/logic"],
      ["src/model", "src/model"],
      ["test/index.js", "test/index.js"],
      ["view/index_index.html", "view/index_index.html"],
      ["development.js", "development.js"],
      ["eslintrc", ".eslintrc"],
      ["gitignore", ".gitignore"],
      ["nginx.conf", "nginx.conf"],
      ["package.json", "package.json"],
      ["pm2.json", "pm2.json"],
      ["production.js", "production.js"],
      ["README.md", "README.md"]
    ],
    "multiModule": [
      ["src/bootstrap", "src/common/bootstrap"],
      ["src/config", "src/common/config"],
      ["src/config/config.js", "src/[moduleName]/config/config.js"],
      ["src/controller/base.js", "src/[moduleName]/controller/base.js"],
      ["src/controller/index.js", "src/[moduleName]/controller/index.js"],
      ["src/logic", "src/[moduleName]/logic"],
      ["src/model", "src/[moduleName]/model"],
      ["test/index.js", "test/index.js"],
      ["view/index_index.html", "view/[moduleName]/index_index.html"],
      ["development.js", "development.js"],
      ["eslintrc", ".eslintrc"],
      ["gitignore", ".gitignore"],
      ["nginx.conf", "nginx.conf"],
      ["package.json", "package.json"],
      ["pm2.json", "pm2.json"],
      ["production.js", "production.js"],
      ["README.md", "README.md"]
    ]
  }
}
```

### controller

The `skipCompile` field in the metadata file should be an object hash containing map configuration required to generate a controller from a template. It contain the following fields：

  * default: Generate controller mapping configuration
  * rest: Generate rest controller mapping configuration

Example:

```javascript
{
  "controller": {
    "default": [
      ["src/controller/index.js", "src/[moduleName]/controller/[action].js"],
      ["src/logic/index.js", "src/[moduleName]/logic/[action].js"]
    ],
    "rest": [
      ["src/controller/rest.js", "src/[moduleName]/controller/rest.js"],
      ["src/controller/restIndex.js", "src/[moduleName]/controller/[action].js"],
      ["src/logic/index.js", "src/[moduleName]/logic/[action].js"]
    ]
  }
}
```

### model

The `skipCompile` field in the metadata file should be an array containing map configuration required to generate a model from a template. 

Example:

```javascript
{
  "model": [
    ["src/model/index.js", "src/[moduleName]/model/[action].js"]
  ]
}
```

### service

The `skipCompile` field in the metadata file should be an array containing map configuration required to generate a service from a template. 

Example:

```javascript
{
  "service": [
    ["src/service/index.js", "src/[moduleName]/service/[action].js"]
  ]
}
```

### middleware

The `skipCompile` field in the metadata file should be an array containing map configuration required to generate a middleware from a template. 

Example:

```javascript
{
  "middleware": [
    ["src/middleware/base.js", "src/[moduleName]/middleware/[action].js"]
  ]
}
```

### adapter

The `skipCompile` field in the metadata file should be an array containing map configuration required to generate a adapter from a template. 

Example:

```javascript
{
  "adapter": [
    ["src/adapter/base.js", "src/[moduleName]/adapter/[type]/[action].js"]
  ]
}
```

### module

The `skipCompile` field in the metadata file should be an array containing map configuration required to generate a module from a template. 

Example:

```javascript
{
  "module": [
    ["src/config/config.js", "src/[moduleName]/config/config.js"],
    ["src/controller/base.js", "src/[moduleName]/controller/base.js"],
    ["src/controller/index.js", "src/[moduleName]/controller/index.js"],
    ["src/logic/index.js", "src/[moduleName]/logic/index.js"],
    ["src/model/index.js", "src/[moduleName]/model/index.js"],
    ["view/index_index.html", "view/[moduleName]/index_index.html"]
  ]
}
```
