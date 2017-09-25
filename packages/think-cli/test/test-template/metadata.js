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
    "src/**/*.vue",
    "src/assets/*.png"
  ],
  "filesignore": [
    "src/controller/index_tpl.js",
    "src/controller/restIndex_tpl.js",
    "src/controller/rest.js"
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
  },
  "model": [
    ["src/model/index.js", "/model/[name].js"]
  ],
  "service": [
    ["src/service/index.js", "/service/[name].js"]
  ],
  "middleware": [
    ["src/middleware/base.js", "/middleware/[name].js"]
  ],
  "adapter": [
    ["src/adapter/base.js", "/adapter/[type]/[name].js"]
  ],
  "module": [
    ["src/config/config.js", "/config/config.js"],
    ["src/controller/base.js", "/controller/base.js"],
    ["src/controller/index.js", "/controller/index.js"],
    ["src/logic/index.js", "/logic/index.js"],
    ["src/model/index.js", "/model/index.js"],
    ["view/index_index.html", "/index_index.html", "view"]
  ]
}
