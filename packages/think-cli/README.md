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

### thinkjs new

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

#### official templates

thinkjs provide some recommended templates.

All official project templates are repos in the [think-template organization](https://github.com/think-template). When a new template is added to the organization, you will be able to run `thinkjs new <project-name> <template-name>` to use that template. You can also run `thinkjs list` to see all available official templates.

Current available templates include:

    * [standard](https://github.com/think-template/standard) - A full-featured standard template

### thinkjs controller

To be continued…