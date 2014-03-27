/*
* Before execution: `npm install agentkeepalive`
*/
var http = require('http'),
    url = require('url'),
    Agent = require('agentkeepalive');

var keepaliveAgent = new Agent({
    maxSockets: 5,
    maxFreeSockets: 5,
    keepAlive: true,
    keepAliveMsecs: 30000
});

server = http.createServer(onRequest);
server.listen(4444);
console.log("Server started on port 4444");

function onRequest(client_req, client_res) {
  console.log('serve:', client_req.url);
  var parseURL = url.parse(client_req.url, true);
  var req_headers = client_req.headers;
  req_headers['connection'] = 'keep-alive';

  var options = {
    path: parseURL.path,
    hostname: 'hub.browserstack.com',
    port: 80,
    method: client_req.method,
    headers: req_headers,
    agent: keepaliveAgent
  };

  var proxy = http.request(options, function (res) {
    client_res.writeHead(res.statusCode, res.headers);
    res.pipe(client_res);
    delete options, req_headers;
  }).on('error', function(e) {
    console.log('req error:', e);
    client_res.writeHead(500);
    client_res.write('error: ' + e.toString());
    client_res.end();
  });

  client_req.pipe(proxy, {
    end: true
  });
}

server.on('error', function(e) {
  console.log('error', e);
});
