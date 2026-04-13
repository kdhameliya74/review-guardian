import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment configuration and validation
 */

// Basic error checking before parsing private key
const getPrivateKey = () => {
  const pk = process.env.GITHUB_PRIVATE_KEY;
  if (!pk) return undefined;
  // If it's already a regular string key, return it. Otherwise try base64 decoding.
  if (pk.includes('BEGIN RSA PRIVATE KEY')) return pk;
  try {
    return Buffer.from(pk, 'base64').toString('utf-8');
  } catch (e) {
    return pk;
  }
};

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  github: {
    appId: process.env.GITHUB_APP_ID,
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    privateKey: getPrivateKey(),
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
  },
  ai: {
    apiKey: process.env.GEMINI_API_KEY,
    modelName: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },
};

// Strict validation
const requiredVars = [
  'GITHUB_APP_ID',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_PRIVATE_KEY',
  'GITHUB_WEBHOOK_SECRET',
  'GEMINI_API_KEY',
];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`CRITICAL: Environment variable ${key} is missing. Application cannot start.`);
  }
});

export default config;
