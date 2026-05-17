const http = require('http');
const url = require('url');

module.exports = (port, fn) => {
  const server = http.createServer((req, res) => {
    const path = url.parse(req.url).pathname;
    const param = path.split('/')[1];

    switch (param) {
      case 'json':
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({
          name: 'value'
        }));
        break;
      case 301:
        res.writeHead(301, { Location: '/200' });
        res.end();
        break;
      default:
        res.writeHead(param, {'Content-Type': 'text/plain'});
        res.end(req.method + ' ' + path);
    }
  });

  server.listen(port, () => {
    fn(function stopServer() {
      server.close();
    });
  })
};