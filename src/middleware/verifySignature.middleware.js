import crypto from 'crypto';
import config from '../config/env.config.js';

/**
 * Middleware to verify the GitHub webhook signature using HMAC SHA-256.
 * Requires req.rawBody to be populated by express body parser.
 */
export const verifyGitHubSignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];

  if (!signature) {
    console.warn('Webhook received but no signature found on request.');
    return res.status(401).json({ error: 'No signature found on request' });
  }

  if (!req.rawBody) {
    console.error(
      'req.rawBody is missing! Ensure app.js configures express.json with a verify function.',
    );
    return res.status(500).json({ error: 'Internal server error - unable to verify signature' });
  }

  try {
    const hmac = crypto.createHmac('sha256', config.github.webhookSecret);
    const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');

    if (
      signature.length !== digest.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
    ) {
      console.warn('Webhook signature mismatch.');
      return res
        .status(401)
        .json({ error: 'X-Hub-Signature-256 does not match request signature' });
    }

    next();
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return res.status(500).json({ error: 'Error verifying signature' });
  }
};
