var onEnterHandler = function(a, b, c) {
  c();
}

function setOnEnterHandler(handler) {
  onEnterHandler = handler;
}

function AuthRoute(config) {
  var {chunkLoader, path,...props} = config;

  var route = {
    path,
    ...props,
    getComponent(location, cb) {
      chunkLoader(entry => cb(null, (entry && entry.default) || entry));
    },
    onEnter(a, b, c) {
      onEnterHandler(a, b, c)
    },
    getChildRoutes(location, cb) {
      chunkLoader((entry, ...files)=> cb(null, files.map(f=>f.default || f)));
    }
  };
  return route;
}

export {AuthRoute, setOnEnterHandler};
export default AuthRoute;