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
    "src/controller/index.tpl.js",
    "src/controller/restIndex.tpl.js",
    "src/controller/restIndex.js",
    "src/controller/rest.js",
    "src/adapter",
    "src/middleware",
    "src/service"
  ],
  "multiModule": [
    ["src/bootstrap", "src/common/bootstrap"],
    ["src/config", "src/common/config"],
    ["src/config/config.js", "src/[defaultModule]/config/config.js"],
    ["src/controller", "src/[defaultModule]/controller"],
    ["src/logic", "src/[defaultModule]/logic"],
    ["src/model", "src/[defaultModule]/model"],
    ["view/index_index.html", "view/[defaultModule]/index_index.html"]
  ],
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
