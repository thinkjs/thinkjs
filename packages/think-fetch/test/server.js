const http = require('http');
const url = require('url');

module.exports = (port, fn) => {
  const server = http.createServer((req, res) => {
    const path = url.parse(req.url).pathname;
    const status = path.split('/')[1];

    switch (status) {
      case 301:
        res.writeHead(301, { Location: '/200' });
        res.end();
        break;
      default:
        res.writeHead(status, {'Content-Type': 'text/plain'});
        res.end(req.method + ' ' + path);
    }
  });

  server.listen(port, () => {
    fn(function stopServer() {
      server.close();
    });
  })
};