[![Build Status](https://travis-ci.org/thinkjs/think-cli.svg?branch=master)](https://travis-ci.org/thinkjs/think-cli)
[![Coverage Status](https://coveralls.io/repos/github/thinkjs/think-cli/badge.svg)](https://coveralls.io/github/thinkjs/think-cli)

# think-cli


`think-cli` is a command-line interface for ThinkJS.

## Installation

Using npm:

```sh
npm install -g think-cli
```

Commands:

```
Usage: thinkjs [command] <options ...>


  Commands:

    new <projectPath>            create project
    module <moduleName>          add module
    controller <controllerName>  add controller
    service <serviceName>        add service
    model <modelName>            add model
    middleware <middlewareName>  add middleware
    adapter <adapterName>        add adapter

  Options:

    -h, --help         output usage information
    -v, --version      output the version number
    -V                 output the version number
    -m, --mode <mode>  project mode type(normal, module), default is normal, using in `new` command
```


