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
    }
  },
  "skipCompile": [
    "App/src/**/*.vue",
    "App/src/assets/*.png"
  ],
  "paths": {
    "controller": "src/controller",
    "logic": "src/logic",
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
  },
  "controller": {
    "default": [
      ["src/controller/index_tpl.js", "/controller/[name].js"],
      ["src/logic/index.js", "/logic/[name].js"]
    ],
    "rest": [
      ["src/controller/rest.js", "controller/rest.js"],
      ["src/controller/restIndex_tpl.js", "/controller/[name].js"],
      ["src/logic/index.js", "/logic/[name].js"]
    ]
  }
}
