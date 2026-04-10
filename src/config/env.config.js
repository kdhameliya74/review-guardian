import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment configuration and validation
 */
export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  github: {
    appId: process.env.GITHUB_APP_ID,
    privateKey: Buffer
      .from(process.env.GITHUB_PRIVATE_KEY, 'base64')
      .toString('utf-8'),
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
    personalAccessToken: process.env.GITHUB_PAT,
  },
  ai: {
    apiKey: process.env.GEMINI_API_KEY,
    modelName: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },
};

// Simple validation
const requiredVars = [
  'GITHUB_WEBHOOK_SECRET',
  'GEMINI_API_KEY'
];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Warning: Environment variable ${key} is missing.`);
  }
});

export default config;
