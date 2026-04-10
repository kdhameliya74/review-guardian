import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import crypto from 'crypto';

// Setup Mock for dependencies
jest.unstable_mockModule('../../src/config/env.config.js', () => ({
  default: {
    github: {
      webhookSecret: 'test-secret',
    },
  },
}));

const { verifyGitHubSignature } =
  await import('../../src/middleware/verifySignature.middleware.js');

describe('verifyGitHubSignature Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      rawBody: Buffer.from('{"test":"payload"}', 'utf-8'),
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should return 401 if no signature header is provided', () => {
    verifyGitHubSignature(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'No signature found on request' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 500 if req.rawBody is missing', () => {
    mockReq.headers['x-hub-signature-256'] = 'sha256=fake-signature';
    delete mockReq.rawBody;

    verifyGitHubSignature(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error - unable to verify signature',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should successfully pass when signature matches', () => {
    const hmac = crypto.createHmac('sha256', 'test-secret');
    const digest = 'sha256=' + hmac.update(mockReq.rawBody).digest('hex');

    mockReq.headers['x-hub-signature-256'] = digest;

    verifyGitHubSignature(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 401 when signature is invalid', () => {
    mockReq.headers['x-hub-signature-256'] = 'sha256=invalid-signature';

    verifyGitHubSignature(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'X-Hub-Signature-256 does not match request signature',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
