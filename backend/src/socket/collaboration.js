module.exports = {
  joinDocument: (io, socket) => (docId) => {
    socket.join(docId);
    socket.to(docId).emit('user-joined', { socketId: socket.id });
  },
};
