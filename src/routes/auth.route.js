import express from 'express';
import { handleCallback } from '../controllers/auth.controller.js';

const router = express.Router();

// GitHub App setup/callback URL
// Example: /auth/callback?code=...&installation_id=...
router.get('/callback', handleCallback);

export default router;
