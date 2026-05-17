module.exports = function({projectName, template, clone, isMultiModule}) {
  return function(files, metalsmith, done) {
    if (!files['package.json']) return done();
    const metadata = metalsmith.metadata();
    const str = files['package.json'].contents.toString();
    const json = JSON.parse(str);

    json.thinkjs = Object.assign(json.thinkjs || {}, {
      metadata,
      projectName,
      template,
      clone,
      isMultiModule
    });

    files['package.json'].contents = Buffer.from(JSON.stringify(json, null, '  '), 'utf8');
    done();
  };
};
