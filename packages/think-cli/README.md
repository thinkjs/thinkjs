# think-cli
[![Build Status](https://travis-ci.org/thinkjs/think-cli.svg?branch=master)](https://travis-ci.org/thinkjs/think-cli)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-cli/badge.svg)](https://coveralls.io/github/thinkjs/think-cli)

`think-cli` is a command-line interface for ThinkJS.

## Installation

```
$ npm install -g think-cli
```

## Usage:

```
$ thinkjs

Usage: think <command> [options]


  Options:

    -V, --version  output the version number
    -h, --help     output usage information


  Commands:

    new          generate a new project from a template
    list         list available official templates
    module       add module from a template
    controller   add controller from a template
    service      add service from a template
    model        add model from a template
    middleware   add middleware from a template
    adapter      add adapter from a template
    help [cmd]   display help for [cmd]
```

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

To be continued…