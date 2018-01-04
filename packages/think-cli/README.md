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

## new

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

### official templates

thinkjs provide some recommended templates.

All official project templates are repos in the [think-template organization](https://github.com/think-template). When a new template is added to the organization, you will be able to run `thinkjs new <project-name> <template-name>` to use that template. You can also run `thinkjs list` to see all available official templates.

Current available templates include:

* [standard](https://github.com/think-template/standard) - A full-featured standard template

### Custom Templates

It's unlikely to make everyone happy with the official templates. You can simply fork an official template and then use it via `think-cli` with:

```
$ thinkjs new my-project username/repo
```
Where `username/repo` is the GitHub repo shorthand for your fork.

The shorthand repo notation is passed to [download-git-repo](https://github.com/flipxfx/download-git-repo) so you can also use things like `bitbucket:username/repo` for a Bitbucket repo and `username/repo#branch` for tags or branches.

If you would like to download from a private repository use the `—clone` flag and the cli will use `git clone` so your SSH keys are used.

### Local Templates

Instead of a GitHub repo, you can also use a template on your local file system:

```
$ thinkjs new my-project ~/fs/path/to-custom-template
```

## controller

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

## service

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

## model

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

## middleware

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

## adapter

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

## module
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


## migrate

**Usage:**

```
$ thinkjs module [module-name]
```

If your project was created with think-cli 1.0 and you want to use the capabilities of think-cli 2.0, you need to use `migrate` command to migrate your project to think-cli 2.0.

## sync

**Usage:**

```
$ thinkjs sync
```

The command will synchronize the latest version of the project template to the local cache directory.

## clean

**Usage:**

```
$ thinkjs clean
```

The command will delete the project template cache.

After the template cache is deleted, your next create file command will pull the latest template
