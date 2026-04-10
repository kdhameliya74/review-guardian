import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import webhookRoutes from './routes/webhook.route.js';

const app = express();

// Apply security headers
app.use(helmet());
app.use(cors());

// Apply rate limiting (e.g., 100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Parse JSON and save raw body for signature validation
app.use(
  bodyParser.json({
    verify: (req, _, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use('/webhook', webhookRoutes);
app.get('/', (_, res) => {
  res.json({
    status: 'ok',
    message: 'AI Code Review Bot is running!',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, _, res) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

export default app;
