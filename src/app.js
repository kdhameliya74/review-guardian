import express from 'express';
import bodyParser from 'body-parser';
import webhookRoutes from './routes/webhook.route.js';

const app = express();

app.use(bodyParser.json());

app.use('/webhook', webhookRoutes);
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'AI Code Review Bot is running!', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

export default app;
