import { expect, jest, describe, it, beforeEach, afterEach } from '@jest/globals';

jest.unstable_mockModule('dotenv', () => ({
  default: {
    config: jest.fn(),
  },
}));

// All critical env vars the module checks — define once to avoid repetition
const CRITICAL_ENV_VARS = [
  'GITHUB_APP_ID',
  'GITHUB_PRIVATE_KEY',
  'GITHUB_WEBHOOK_SECRET',
  'GEMINI_API_KEY',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
];

describe('Environment Configuration', () => {
  let originalEnv;

  beforeEach(() => {
    jest.resetModules();
    originalEnv = { ...process.env };
    CRITICAL_ENV_VARS.forEach((key) => delete process.env[key]);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should throw an error if critical environment variables are missing', async () => {
    await expect(import(`../../src/config/env.config.js?t=${Date.now()}`)).rejects.toThrow(
      /CRITICAL: Environment variable.*is missing/,
    );
  });

  it('should parse base64 private keys correctly', async () => {
    process.env.GITHUB_APP_ID = '12345';
    process.env.GITHUB_WEBHOOK_SECRET = 'secret';
    process.env.GEMINI_API_KEY = 'gemini-key';
    process.env.GITHUB_CLIENT_ID = 'client-id';
    process.env.GITHUB_CLIENT_SECRET = 'client-secret';

    const testKey = 'test-private-key';
    process.env.GITHUB_PRIVATE_KEY = Buffer.from(testKey).toString('base64');

    const { config } = await import(`../../src/config/env.config.js?t=${Date.now()}`);
    expect(config.github.privateKey).toBe(testKey);
  });

  it('should keep raw string if private key is not base64', async () => {
    process.env.GITHUB_APP_ID = '12345';
    process.env.GITHUB_WEBHOOK_SECRET = 'secret';
    process.env.GEMINI_API_KEY = 'gemini-key';
    process.env.GITHUB_CLIENT_ID = 'client-id';
    process.env.GITHUB_CLIENT_SECRET = 'client-secret';

    const testKey = '-----BEGIN RSA PRIVATE KEY-----\nHelloWorld\n-----END RSA PRIVATE KEY-----';
    process.env.GITHUB_PRIVATE_KEY = testKey;

    const { config } = await import(`../../src/config/env.config.js?t=${Date.now()}`);
    expect(config.github.privateKey).toBe(testKey);
  });
});
