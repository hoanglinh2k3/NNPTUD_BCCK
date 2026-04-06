function registerChatSocket(io, socket) {
  socket.on('join_user_room', ({ userId }) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  socket.on('send_message', (payload) => {
    if (!payload?.receiverId) {
      return;
    }

    io.to(`user:${payload.receiverId}`).emit('receive_message', payload);
  });

  socket.on('mark_as_read', (payload) => {
    if (!payload?.senderId) {
      return;
    }

    io.to(`user:${payload.senderId}`).emit('mark_as_read', payload);
  });
}

module.exports = registerChatSocket;
