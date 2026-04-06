const { Server } = require('socket.io');
const env = require('../config/env');
const registerChatSocket = require('./chat.socket');
const registerNotificationSocket = require('./notification.socket');

let ioInstance;

function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    registerChatSocket(ioInstance, socket);
    registerNotificationSocket(socket);
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized');
  }

  return ioInstance;
}

module.exports = {
  initSocket,
  getIO
};
