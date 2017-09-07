module.exports = {
  "prompts": {
    "name": {
      "type": "string",
      "message": "Project name"
    },
    "description": {
      "type": "string",
      "message": "Project description",
      "default": "A Speike project"
    },
    "author": {
      "type": "string",
      "message": "Author"
    },
    "defaultModule": {
      "type": "string",
      "message": "Please enter a default module name",
      "default": "home"
    }
  },
  "skipCompile": [
    "App/src/**/*.vue",
    "App/src/assets/*.png"
  ],
  "paths": {
    "controller": "src/controller",
    "bootstrap": "src/bootstrap",
    "config": "src/config",
    "multiModuleConf": "src/config/config.js"
  },
  "multiModule": {
    "bootstrap": "src/common/bootstrap",
    "config": "src/common/config",
    "controller": "src/[defaultModule]/controller",
    "logic": "src/[defaultModule]/logic",
    "model": "src/[defaultModule]/model",
    "multiModuleConf": "src/[defaultModule]/config/config.js"
  }
}
