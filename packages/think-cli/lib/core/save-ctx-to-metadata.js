module.exports = function(ctx = {}) {
  return function(files, metalsmith, done) {
    const metadata = metalsmith.metadata();
    for (var key in ctx) {
      metadata[key] = ctx[key];
    }
    done(null);
  };
};
