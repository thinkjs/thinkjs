module.exports = function({projectName, templateName, cacheTemplatePath, clone, isMultiModule}) {
  return function(files, metalsmith, done) {
    if (!files['package.json']) return done();
    const metadata = metalsmith.metadata();
    const defaultModule = metadata.defaultModule;
    const str = files['package.json'].contents.toString();
    const json = JSON.parse(str);

    json.thinkjs = Object.assign(json.thinkjs || {}, {
      metadata,
      projectName,
      templateName,
      cacheTemplatePath,
      defaultModule,
      clone,
      isMultiModule
    });

    files['package.json'].contents = Buffer.from(JSON.stringify(json, null, '  '), 'binary');
    done();
  };
}