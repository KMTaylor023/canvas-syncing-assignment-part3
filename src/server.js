const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');


const port = process.env.PORT || process.env.NODE_PORT || 3000;

const index = fs.readFileSync(`${__dirname}/../client/index.html`);

const onRequest = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const app = http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1:${port}`);

const io = socketio(app);


const onMove = (sock) => {
  const socket = sock;

  socket.on('move', (data) => {
    if (!data.x || !data.y || !data.time) {
      return;// Could emit error here
    }

    const newData = {};
    newData.x = parseFloat(data.x);
    newData.y = parseFloat(data.y);
    newData.time = parseInt(data.time, 10);
    if (Number.isNaN(newData.x) || Number.isNaN(newData.y) || Number.isNaN(newData.time)) {
      return;// Could emit error here
    }

    newData.name = socket.name;

    socket.broadcast.to('room1').emit('move', newData);
  });
};

// handles disconnect events
const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    socket.broadcast.to('room1').emit('remove', { name: socket.name });

    socket.leave('room1');
  });
};

// Sets up the socket message handlers
io.sockets.on('connection', (sock) => {
  const socket = sock;
  socket.join('room1');
  socket.broadcast.to('room1').emit('bump', {});
  socket.name = `user:${(Math.floor((Math.random() * 1000)) + 1)}`;

  onMove(socket);
  onDisconnect(socket);
});

console.log('Websocket server started');

