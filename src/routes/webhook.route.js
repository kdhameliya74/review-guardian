import express from 'express';
import { handleWebhook } from '../controllers/webhook.controller.js';
import { verifyGitHubSignature } from '../middleware/verifySignature.middleware.js';

const router = express.Router();
router.post('/', verifyGitHubSignature, handleWebhook);

export default router;
