 
try {
  var fs = require('fs');
  var files = fs.readdirSync('./node_modules');
  files = files.filter(function(f){return /^[^\.]/.test(f)});
  var script = 'npm uninstall ' + files.join(' ');
  fs.writeFileSync('uninstall_modules.bat', script);
} catch(e) {
  console.log('error:', e);
} finally {
  console.log('finished');
}