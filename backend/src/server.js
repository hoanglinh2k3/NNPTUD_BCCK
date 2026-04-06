const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./database/connection');
const { initSocket } = require('./sockets');

async function bootstrap() {
  await connectDB();
  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start backend', error);
  process.exit(1);
});
