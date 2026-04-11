import app from './app.js';
import config from './config/env.config.js';

const PORT = config.port;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 AI Code Review Bot is running!
📡 Listening on port: http://localhost:${PORT}
🌍 Environment: ${config.nodeEnv}
  `);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
