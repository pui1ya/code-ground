const { Server } = require('socket.io');

function setup(server) {
  const io = new Server(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    socket.on('disconnect', () => console.log('socket disconnected', socket.id));
  });
  return io;
}

module.exports = { setup };
