function registerNotificationSocket(socket) {
  socket.on('join_notification_room', ({ userId }) => {
    if (userId) {
      socket.join(`notification:${userId}`);
    }
  });
}

module.exports = registerNotificationSocket;
