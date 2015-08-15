var Ws = require('ws').Server;
var http = require('http');

var port = process.argv[3] || 32568;

// Create server.
var server = http.createServer(function(request, response) {
  response.writeHead(200);
  send();
  response.end();
});

server.listen(port, function() {
  console.log((new Date()) + ' Server is listening on port', port);
});

var ws = new Ws({server: server});

ws.on('error', function(e) { console.log("ERROR:", e); });

var sockets = [];

ws.on('connection', function(socket) {
  sockets.push(socket);
});

function send() {
  sockets . forEach(function(socket, idx) {
    try {
      socket.send("ping");
    } catch (e) {
      delete sockets[idx];
    }
  });
}
