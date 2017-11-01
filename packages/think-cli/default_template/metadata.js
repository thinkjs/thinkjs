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
  "new": [
    ["src/bootstrap", "src/common/bootstrap"],
    ["src/config", "src/common/config"],
    ["src/config/config.js", "src/[moduleName]/config/config.js"],
    ["src/controller/base.js", "src/[moduleName]/controller/base.js"],
    ["src/controller/index.js", "src/[moduleName]/controller/index.js"],
    ["src/logic", "src/[moduleName]/logic"],
    ["src/model", "src/[moduleName]/model"],
    ["view/index_index.html", "view/[moduleName]/index_index.html"],
    ["development.js", "development.js"],
    ["eslintrc", ".eslintrc"],
    ["gitignore", ".gitignore"],
    ["nginx.conf", "nginx.conf"],
    ["package.json", "package.json"],
    ["pm2.json", "pm2.json"],
    ["production.js", "production.js"],
    ["README.md", "README.md"]
  ],
  "controller": {
    "default": [
      ["src/controller/index.tpl.js", "src/[moduleName]/controller/[action].js"],
      ["src/logic/index.js", "src/[moduleName]/logic/[action].js"]
    ],
    "rest": [
      ["src/controller/rest.js", "src/[moduleName]/controller/rest.js"],
      ["src/controller/restIndex.tpl.js", "src/[moduleName]/controller/[action].js"],
      ["src/logic/index.js", "src/[moduleName]/logic/[action].js"]
    ]
  },
  "model": [
    ["src/model/index.js", "src/[moduleName]/model/[action].js"]
  ],
  "service": [
    ["src/service/index.js", "src/[moduleName]/service/[action].js"]
  ],
  "middleware": [
    ["src/middleware/base.js", "src/[moduleName]/middleware/[action].js"]
  ],
  "adapter": [
    ["src/adapter/base.js", "src/[moduleName]/adapter/[type]/[action].js"]
  ],
  "module": [
    ["src/config/config.js", "src/[moduleName]/config/config.js"],
    ["src/controller/base.js", "src/[moduleName]/controller/base.js"],
    ["src/controller/index.js", "src/[moduleName]/controller/index.js"],
    ["src/logic/index.js", "src/[moduleName]/logic/index.js"],
    ["src/model/index.js", "src/[moduleName]/model/index.js"],
    ["view/index_index.html", "view/[moduleName]/index_index.html"]
  ]
}
