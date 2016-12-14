var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');

var Index = require('../../lib/index.js');
var instance = new Index();
instance.load();

var Compile = think.safeRequire(path.resolve(__dirname, '../../lib/util/watch_compile.js'));

describe('watch_compile', function(){
  it('compile, src not exist', function(){
    Compile.compile(__dirname + think.sep + 'compile_src', __dirname + think.sep + 'compile_output' );
  })
  it('compile, src not exist, with options', function(){
    Compile.compile(__dirname + think.sep + 'compile_src', __dirname + think.sep + 'compile_output', {} );
  })
  it('init', function(){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath);
    assert.deepEqual(instance.allowFileExt, ['.js', '.ts'])
  })
  it('compileByTypeScript', function(done){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath);
    var result = instance.compileByTypeScript('let a = 1', 'a.ts');
    var content = fs.readFileSync(outPath + think.sep + 'a.js', 'utf8');
    assert.equal(content.trim(), '"use strict";\n\nvar a = 1;\n//# sourceMappingURL=a.js.map');
    think.rmdir(outPath).then(function(){
      done();
    });
  })
  it('compileByTypeScript, has error', function(){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath);
    try{
      var result = instance.compileByTypeScript('let a = ', 'a.ts');
      assert.equal(1, 2)
    }catch(e){

    }
  })
   it('compileByTypeScript, show log', function(done){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {log: true});
    var result = instance.compileByTypeScript('let a = 1', 'a.ts');
    var content = fs.readFileSync(outPath + think.sep + 'a.js', 'utf8');
    assert.equal(content.trim(), '"use strict";\n\nvar a = 1;\n//# sourceMappingURL=a.js.map');
    muk.restore();
    think.rmdir(outPath).then(function(){
      done();
    });
  })
  it('compileByBabel', function(done){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {presets: [], plugins: []});
    var result = instance.compileByBabel('let a = 1', 'a.js');
    var content = fs.readFileSync(outPath + think.sep + 'a.js', 'utf8');
    assert.equal(content, '"use strict";\n\nvar a = 1;\n//# sourceMappingURL=a.js.map');
    think.rmdir(outPath).then(function(){
      done();
    });
  })
  it('compileByBabel, retainLines', function(done){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true, presets: [], plugins: []});
    var result = instance.compileByBabel('let a = 1', 'a.js');
    var content = fs.readFileSync(outPath + think.sep + 'a.js', 'utf8');
    assert.equal(content, '"use strict";\n\nvar a = 1;\n//# sourceMappingURL=a.js.map');
    think.rmdir(outPath).then(done);
  })
  it('compileByBabel, show log', function(done){
    muk(think, 'log', function(msg, type){
      assert.equal(type, 'Babel')
    })
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true, log: true, presets: [], plugins: []});
    var result = instance.compileByBabel('let a = 1', 'a.js');
    var content = fs.readFileSync(outPath + think.sep + 'a.js', 'utf8');
    assert.equal(content, '"use strict";\n\nvar a = 1;\n//# sourceMappingURL=a.js.map');
    muk.restore();
    think.rmdir(outPath).then(function(){
      done();
    });
  })
  it('replaceExtName', function(){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true, log: true});
    var str = instance.replaceExtName('a.js');
    assert.equal(str, 'a');
  })
  it('replaceExtName, with extName', function(){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true, log: true});
    var str = instance.replaceExtName('a/aaa.ts', '.js');
    assert.equal(str, 'a/aaa.js');
  })
  it('compileFile', function(done){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true, log: true});
    var srcFilepath = srcPath + think.sep + 'test' + think.sep + 'a.js';
    think.mkdir(path.dirname(srcFilepath));
    fs.writeFileSync(srcFilepath, 'var a = 2');
    instance.compileFile('test' + think.sep + 'a.js', true);
    var content = fs.readFileSync(outPath + think.sep + 'test' + think.sep + 'a.js', 'utf8');
    assert.equal(content, 'var a = 2');
    Promise.all([
      think.rmdir(srcPath),
      think.rmdir(outPath)
    ]).then(function(){
      done();
    });
  })
  it('compileFile, empty', function(done){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true, log: true});
    var srcFilepath = srcPath + think.sep + 'test' + think.sep + 'a.js';
    think.mkdir(path.dirname(srcFilepath));
    fs.writeFileSync(srcFilepath, '');
    instance.compileFile('test' + think.sep + 'a.js', true);
    assert.equal(think.isFile(outPath + think.sep + 'test' + think.sep + 'a.js'), false);
    think.rmdir(srcPath).then(function(){
      done();
    })
  })
  it('compileFile, TypeScript', function(done){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true, type: 'ts'});
    var srcFilepath = srcPath + think.sep + 'test' + think.sep + 'a.ts';
    think.mkdir(path.dirname(srcFilepath));
    fs.writeFileSync(srcFilepath, 'let a = 2');
    instance.compileFile('test' + think.sep + 'a.ts');
    var content = fs.readFileSync(outPath + think.sep + 'test' + think.sep + 'a.js', 'utf8');
    assert.equal(content.indexOf('var a = 2;') > -1, true);
    Promise.all([
      think.rmdir(srcPath),
      think.rmdir(outPath)
    ]).then(function(){
      done();
    });
  })
  it('compileFile, Babel', function(done){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {presets: [], plugins: []});
    var srcFilepath = srcPath + think.sep + 'test' + think.sep + 'a.js';
    think.mkdir(path.dirname(srcFilepath));
    fs.writeFileSync(srcFilepath, 'let a = 2');
    instance.compileFile('test' + think.sep + 'a.js');
    var content = fs.readFileSync(outPath + think.sep + 'test' + think.sep + 'a.js', 'utf8');
    assert.equal(content, '"use strict";\n\nvar a = 2;\n//# sourceMappingURL=a.js.map');
    Promise.all([
      think.rmdir(srcPath),
      think.rmdir(outPath)
    ]).then(function(){
      done();
    });
  })
  it('compileFile, error', function(done){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true});
    var srcFilepath = srcPath + think.sep + 'test' + think.sep + 'a.js';
    think.mkdir(path.dirname(srcFilepath));
    muk(think, 'log', function(fn){
      if(think.isFunction(fn)){
        fn({red: function(){}})
      }
    })
    fs.writeFileSync(srcFilepath, 'let a = ');
    instance.compileFile('test' + think.sep + 'a.js');
    assert.equal(think.isFile(outPath + think.sep + 'test' + think.sep + 'a.js'), false);
    assert.equal(think.isError(think.compileError), true)
    Promise.all([
      think.rmdir(srcPath),
      think.rmdir(outPath)
    ]).then(function(){
      muk.restore();
      think.compileError = null;
      done();
    });
  })
  it('getSrcDeletedFiles, empty', function(){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true});
    var files = instance.getSrcDeletedFiles([
      'a.ts'
    ], ['a.js']);
    assert.deepEqual(files, [])
  })
  it('getSrcDeletedFiles, same ext', function(){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true});
    var files = instance.getSrcDeletedFiles([
      'a.js'
    ], ['a.js']);
    assert.deepEqual(files, [])
  })
  it('getSrcDeletedFiles, same ext, other files', function(){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true});
    var files = instance.getSrcDeletedFiles([
      'a.js'
    ], ['a.js', 'c.txt']);
    assert.deepEqual(files, [])
  })
  it('getSrcDeletedFiles, same ext, has deleted files', function(){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true});
    var files = instance.getSrcDeletedFiles([
      'a.ts'
    ], ['a.js', 'b.js']);
    assert.deepEqual(files, [outPath + think.sep + 'b.js'])
  })
  it('getSrcDeletedFiles, same ext, has deleted files, file ext', function(done){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true});
    think.mkdir(outPath);
    fs.writeFileSync(outPath + think.sep + 'b.js', 'var a =1');
    var files = instance.getSrcDeletedFiles([
      'a.ts'
    ], ['a.js', 'b.js']);
    assert.deepEqual(files, [outPath + think.sep + 'b.js']);
    think.rmdir(outPath).then(function(){
      done();
    })
  })
  it('compile, once', function(done){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true, presets: [], plugins: []});
    think.mkdir(srcPath);
    fs.writeFileSync(srcPath + think.sep + 'b.js', 'var a =1');
    instance.compile(true);
    var content = fs.readFileSync(outPath + think.sep + 'b.js', 'utf8');
    assert.equal(content, '"use strict";\n\nvar a = 1;\n//# sourceMappingURL=b.js.map')
    Promise.all([
      think.rmdir(srcPath),
      think.rmdir(outPath)
    ]).then(function(){
      done();
    })
  })
   it('compile, once, other file', function(done){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true});
    think.mkdir(srcPath);
    fs.writeFileSync(srcPath + think.sep + 'b.log', 'var a =1');
    instance.compile(true);
    assert.equal(think.isFile(outPath + think.sep + 'b.log'), true);
    var content = fs.readFileSync(outPath + think.sep + 'b.log', 'utf8');
    assert.equal(content, 'var a =1');
    Promise.all([
      think.rmdir(srcPath),
      think.rmdir(outPath)
    ]).then(function(){
      done();
    })
  })
  it('compile, once, outFile is exist', function(done){
    var srcPath = __dirname + think.sep + 'compile_src';
    var outPath = __dirname + think.sep + 'compile_output';
    var instance = new Compile(srcPath, outPath, {retainLines: true});
    think.mkdir(srcPath);
    fs.writeFileSync(srcPath + think.sep + 'b.js', 'var a =1');
    think.mkdir(outPath);
    fs.writeFileSync(outPath + think.sep + 'b.js', 'var a =2');
    instance.compile(true);
    var content = fs.readFileSync(outPath + think.sep + 'b.js', 'utf8');
    assert.equal(content, 'var a =2');

    Promise.all([
      think.rmdir(srcPath),
      think.rmdir(outPath)
    ]).then(function(){
      done();
    })
  })
})