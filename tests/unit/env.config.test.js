import { expect, jest, describe, it, beforeEach, afterEach } from '@jest/globals';

jest.unstable_mockModule('dotenv', () => ({
  default: {
    config: jest.fn(),
  },
}));

describe('Environment Configuration', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw an error if critical environment variables are missing', async () => {
    delete process.env.GITHUB_APP_ID;
    delete process.env.GITHUB_PRIVATE_KEY;
    delete process.env.GITHUB_WEBHOOK_SECRET;
    delete process.env.GEMINI_API_KEY;

    await expect(import(`../../src/config/env.config.js?t=${Date.now()}`)).rejects.toThrow(
      /CRITICAL: Environment variable.*is missing/,
    );
  });

  it('should parse base64 private keys correctly', async () => {
    process.env.GITHUB_APP_ID = '12345';
    process.env.GITHUB_WEBHOOK_SECRET = 'secret';
    process.env.GEMINI_API_KEY = 'gemini-key';

    const testKey = 'test-private-key';
    process.env.GITHUB_PRIVATE_KEY = Buffer.from(testKey).toString('base64');

    const { config } = await import(`../../src/config/env.config.js?t=${Date.now()}`);
    expect(config.github.privateKey).toBe(testKey);
  });

  it('should keep raw string if private key is not base64', async () => {
    process.env.GITHUB_APP_ID = '12345';
    process.env.GITHUB_WEBHOOK_SECRET = 'secret';
    process.env.GEMINI_API_KEY = 'gemini-key';

    const testKey = '-----BEGIN RSA PRIVATE KEY-----\nHelloWorld\n-----END RSA PRIVATE KEY-----';
    process.env.GITHUB_PRIVATE_KEY = testKey;

    const { config } = await import(`../../src/config/env.config.js?t=${Date.now()}`);
    expect(config.github.privateKey).toBe(testKey);
  });
});
