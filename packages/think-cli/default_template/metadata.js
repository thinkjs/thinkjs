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
  "new": {
    "default": [
      ["src/bootstrap", "src/bootstrap"],
      ["src/config", "src/config"],
      ["src/controller", "src/controller"],
      ["src/logic", "src/logic"],
      ["src/model", "src/model"],
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
      ["src/config/config.js", "src/[module]/config/config.js"],
      ["src/controller/base.js", "src/[module]/controller/base.js"],
      ["src/controller/index.js", "src/[module]/controller/index.js"],
      ["src/logic", "src/[module]/logic"],
      ["src/model", "src/[module]/model"],
      ["view/index_index.html", "view/[module]/index_index.html"],
      ["development.js", "development.js"],
      ["eslintrc", ".eslintrc"],
      ["gitignore", ".gitignore"],
      ["nginx.conf", "nginx.conf"],
      ["package.json", "package.json"],
      ["pm2.json", "pm2.json"],
      ["production.js", "production.js"],
      ["README.md", "README.md"]
    ]
  },
  "multiModule": [
    ["src/bootstrap", "src/common/bootstrap"],
    ["src/config", "src/common/config"],
    ["src/config/config.js", "src/[module]/config/config.js"],
    ["src/controller", "src/[module]/controller"],
    ["src/logic", "src/[module]/logic"],
    ["src/model", "src/[module]/model"],
    ["view/index_index.html", "view/[module]/index_index.html"]
  ],
  "controller": {
    "default": [
      ["src/controller/index.tpl.js", "/controller/[action].js"],
      ["src/logic/index.js", "/logic/[action].js"]
    ],
    "rest": [
      ["src/controller/rest.js", "controller/rest.js"],
      ["src/controller/restIndex.tpl.js", "/controller/[action].js"],
      ["src/logic/index.js", "/logic/[action].js"]
    ]
  },
  "model": [
    ["src/model/index.js", "/model/[action].js"]
  ],
  "service": [
    ["src/service/index.js", "/service/[action].js"]
  ],
  "middleware": [
    ["src/middleware/base.js", "/middleware/[action].js"]
  ],
  "adapter": [
    ["src/adapter/base.js", "/adapter/[type]/[action].js"]
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
