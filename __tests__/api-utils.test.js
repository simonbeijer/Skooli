import { ZodError } from 'zod';

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn()
  }
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(false)
}));

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn().mockReturnValue('mock-uuid-1234')
  }
});

describe('API Utils', () => {
  let originalEnv;
  let consoleSpy;

  beforeAll(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('IP Address Utilities', () => {
    it('should extract IP from x-forwarded-for header', async () => {
      const { getClientIP } = await import('../src/lib/api/utils.ts');
      
      const mockRequest = {
        headers: {
          get: jest.fn().mockImplementation((header) => {
            if (header === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1';
            return null;
          })
        }
      };

      const ip = getClientIP(mockRequest);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from cf-connecting-ip header', async () => {
      const { getClientIP } = await import('../src/lib/api/utils.ts');
      
      const mockRequest = {
        headers: {
          get: jest.fn().mockImplementation((header) => {
            if (header === 'cf-connecting-ip') return '192.168.1.1';
            return null;
          })
        }
      };

      const ip = getClientIP(mockRequest);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', async () => {
      const { getClientIP } = await import('../src/lib/api/utils.ts');
      
      const mockRequest = {
        headers: {
          get: jest.fn().mockImplementation((header) => {
            if (header === 'x-real-ip') return '192.168.1.1';
            return null;
          })
        }
      };

      const ip = getClientIP(mockRequest);
      expect(ip).toBe('192.168.1.1');
    });

    it('should fallback to localhost when no headers present', async () => {
      const { getClientIP } = await import('../src/lib/api/utils.ts');
      
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      };

      const ip = getClientIP(mockRequest);
      expect(ip).toBe('127.0.0.1');
    });

    it('should get user agent from request', async () => {
      const { getUserAgent } = await import('../src/lib/api/utils.ts');
      
      const mockRequest = {
        headers: {
          get: jest.fn().mockImplementation((header) => {
            if (header === 'user-agent') return 'Mozilla/5.0 (Test Browser)';
            return null;
          })
        }
      };

      const userAgent = getUserAgent(mockRequest);
      expect(userAgent).toBe('Mozilla/5.0 (Test Browser)');
    });

    it('should return Unknown for missing user agent', async () => {
      const { getUserAgent } = await import('../src/lib/api/utils.ts');
      
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      };

      const userAgent = getUserAgent(mockRequest);
      expect(userAgent).toBe('Unknown');
    });
  });

  describe('Security Logging', () => {
    it('should log security event in development mode', async () => {
      process.env.NODE_ENV = 'development';
      const { logSecurityEvent } = await import('../src/lib/api/utils.ts');
      
      const mockRequest = {
        headers: {
          get: jest.fn().mockImplementation((header) => {
            if (header === 'x-real-ip') return '192.168.1.1';
            if (header === 'user-agent') return 'Test Browser';
            return null;
          })
        }
      };

      logSecurityEvent('LOGIN_ATTEMPT', { email: 'test@example.com' }, mockRequest, 'user123');

      expect(consoleSpy.warn).toHaveBeenCalledWith('Security Event:', expect.objectContaining({
        event: 'LOGIN_ATTEMPT',
        details: { email: 'test@example.com' },
        ip: '192.168.1.1',
        userId: 'user123'
      }));
    });

    it('should log security event in production mode', async () => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      const { logSecurityEvent } = await import('../src/lib/api/utils.ts');
      
      logSecurityEvent('LOGIN_FAILURE', { reason: 'invalid_password' });

      expect(consoleSpy.log).toHaveBeenCalledWith('SECURITY_EVENT:', expect.stringContaining('LOGIN_FAILURE'));
    });

    it('should log API error with context', async () => {
      process.env.NODE_ENV = 'development';
      jest.resetModules();
      const { logAPIError } = await import('../src/lib/api/utils.ts');
      
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('127.0.0.1')
        },
        method: 'POST',
        url: 'http://localhost:3000/api/test'
      };

      const error = new Error('Test error');
      const context = { userId: 'user123' };

      const errorId = logAPIError(error, mockRequest, context);

      expect(errorId).toBe('mock-uuid-1234');
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('API Error [mock-uuid-1234]'),
        expect.objectContaining({
          errorId: 'mock-uuid-1234',
          message: 'Test error',
          method: 'POST',
          url: 'http://localhost:3000/api/test',
          context
        })
      );
    });

    it('should log API error in production mode', async () => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      const { logAPIError } = await import('../src/lib/api/utils.ts');
      
      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue('127.0.0.1') },
        method: 'GET',
        url: 'http://localhost:3000/api/test'
      };

      const error = new Error('Production error');
      logAPIError(error, mockRequest);

      expect(consoleSpy.error).toHaveBeenCalledWith('API_ERROR:', expect.stringContaining('mock-uuid-1234'));
    });
  });

  describe('RateLimiter', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'; // Enable rate limiting
      jest.resetModules();
    });

    it('should allow requests within limit', async () => {
      const { RateLimiter } = await import('../src/lib/api/utils.ts');
      
      const limiter = new RateLimiter({
        maxAttempts: 5,
        windowMs: 60000, // 1 minute
      });

      const result = limiter.check('test-identifier');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
      expect(result.blocked).toBe(false);
    });

    it('should track attempts and reduce remaining count', async () => {
      const { RateLimiter } = await import('../src/lib/api/utils.ts');
      
      const limiter = new RateLimiter({
        maxAttempts: 3,
        windowMs: 60000,
      });

      // First attempt
      limiter.recordAttempt('test-user');
      let result = limiter.check('test-user');
      expect(result.remaining).toBe(2);
      expect(result.allowed).toBe(true);

      // Second attempt
      limiter.recordAttempt('test-user');
      result = limiter.check('test-user');
      expect(result.remaining).toBe(1);
      expect(result.allowed).toBe(true);

      // Third attempt
      limiter.recordAttempt('test-user');
      result = limiter.check('test-user');
      expect(result.remaining).toBe(0);
      expect(result.allowed).toBe(false);
    });

    it('should block requests when limit exceeded with block duration', async () => {
      const { RateLimiter } = await import('../src/lib/api/utils.ts');
      
      const limiter = new RateLimiter({
        maxAttempts: 2,
        windowMs: 60000,
        blockDurationMs: 30000, // 30 seconds
      });

      // Exceed limit
      limiter.recordAttempt('blocked-user');
      limiter.recordAttempt('blocked-user');

      const result = limiter.check('blocked-user');
      expect(result.allowed).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should clear rate limit data', async () => {
      const { RateLimiter } = await import('../src/lib/api/utils.ts');
      
      const limiter = new RateLimiter({
        maxAttempts: 3,
        windowMs: 60000,
      });

      limiter.recordAttempt('clear-test');
      limiter.clear('clear-test');

      const result = limiter.check('clear-test');
      expect(result.remaining).toBe(3);
      expect(result.allowed).toBe(true);
    });

    it('should skip rate limiting in development', async () => {
      process.env.NODE_ENV = 'development';
      jest.resetModules();
      const { RateLimiter } = await import('../src/lib/api/utils.ts');
      
      const limiter = new RateLimiter({
        maxAttempts: 1,
        windowMs: 60000,
      });

      const result = limiter.check('dev-user');
      expect(result.allowed).toBe(true);
      expect(result.blocked).toBe(false);
    });
  });

  describe('Error Response Utilities', () => {
    beforeEach(() => {
      // Mock NextResponse.json
      const { NextResponse } = require('next/server');
      NextResponse.json = jest.fn().mockImplementation((data, options) => ({
        ...data,
        status: options?.status,
        headers: new Map()
      }));
    });

    it('should create error response', async () => {
      const { createErrorResponse } = await import('../src/lib/api/utils.ts');
      const { NextResponse } = require('next/server');
      
      const response = createErrorResponse('Test error', 400, 'TEST_ERROR', { field: 'value' });

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          code: 'TEST_ERROR',
          details: { field: 'value' },
          timestamp: expect.any(String)
        }),
        { status: 400 }
      );
    });

    it('should handle validation error', async () => {
      const { handleValidationError } = await import('../src/lib/api/utils.ts');
      const { NextResponse } = require('next/server');
      
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['email'],
          message: 'Expected string, received number'
        },
        {
          code: 'too_small',
          minimum: 8,
          type: 'string',
          inclusive: true,
          path: ['password'],
          message: 'String must contain at least 8 character(s)'
        }
      ]);

      handleValidationError(zodError);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Expected string, received number',
          code: 'VALIDATION_ERROR',
          details: {
            'email': ['Expected string, received number'],
            'password': ['String must contain at least 8 character(s)']
          }
        }),
        { status: 400 }
      );
    });

    it('should handle rate limit exceeded', async () => {
      const { handleRateLimitExceeded } = await import('../src/lib/api/utils.ts');
      
      const resetTime = Date.now() + 60000; // 1 minute from now
      
      // Mock response with proper headers object
      const mockResponse = {
        headers: {
          set: jest.fn()
        }
      };
      
      const { NextResponse } = require('next/server');
      NextResponse.json.mockReturnValue(mockResponse);
      
      const response = handleRateLimitExceeded(resetTime);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          details: { resetTime }
        }),
        { status: 429 }
      );

      // Check headers are set
      expect(response.headers.set).toHaveBeenCalledWith('Retry-After', expect.any(String));
      expect(response.headers.set).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
    });

    it('should handle auth error', async () => {
      const { handleAuthError } = await import('../src/lib/api/utils.ts');
      const { NextResponse } = require('next/server');
      
      handleAuthError('Custom auth message');

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Custom auth message',
          code: 'AUTHENTICATION_ERROR'
        }),
        { status: 401 }
      );
    });

    it('should handle authorization error', async () => {
      const { handleAuthorizationError } = await import('../src/lib/api/utils.ts');
      const { NextResponse } = require('next/server');
      
      handleAuthorizationError();

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Insufficient permissions',
          code: 'AUTHORIZATION_ERROR'
        }),
        { status: 403 }
      );
    });

    it('should handle not found error', async () => {
      const { handleNotFoundError } = await import('../src/lib/api/utils.ts');
      const { NextResponse } = require('next/server');
      
      handleNotFoundError('User');

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User not found',
          code: 'NOT_FOUND'
        }),
        { status: 404 }
      );
    });

    it('should handle internal error in development', async () => {
      process.env.NODE_ENV = 'development';
      jest.resetModules();
      const { handleInternalError } = await import('../src/lib/api/utils.ts');
      const { NextResponse } = require('next/server');
      
      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue('127.0.0.1') },
        method: 'GET',
        url: 'http://localhost:3000/api/test'
      };

      const error = new Error('Internal error message');
      handleInternalError(mockRequest, error);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Internal error message',
          code: 'INTERNAL_ERROR',
          details: expect.objectContaining({
            errorId: 'mock-uuid-1234',
            stack: expect.any(String)
          })
        }),
        { status: 500 }
      );
    });

    it('should handle internal error in production', async () => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      const { handleInternalError } = await import('../src/lib/api/utils.ts');
      const { NextResponse } = require('next/server');
      
      const mockRequest = {
        headers: { get: jest.fn().mockReturnValue('127.0.0.1') },
        method: 'GET',
        url: 'http://localhost:3000/api/test'
      };

      const error = new Error('Sensitive error details');
      handleInternalError(mockRequest, error);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'An internal error occurred',
          code: 'INTERNAL_ERROR',
          details: { errorId: 'mock-uuid-1234' }
        }),
        { status: 500 }
      );
    });
  });

  describe('Success Response Utilities', () => {
    beforeEach(() => {
      const { NextResponse } = require('next/server');
      NextResponse.json = jest.fn().mockImplementation((data, options) => ({
        ...data,
        status: options?.status
      }));
    });

    it('should create success response with data', async () => {
      const { createSuccessResponse } = await import('../src/lib/api/utils.ts');
      const { NextResponse } = require('next/server');
      
      const data = { user: { id: '1', email: 'test@example.com' } };
      createSuccessResponse(data, 'User retrieved', 200);

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User retrieved',
          data,
          timestamp: expect.any(String)
        }),
        { status: 200 }
      );
    });

    it('should create success response with defaults', async () => {
      const { createSuccessResponse } = await import('../src/lib/api/utils.ts');
      const { NextResponse } = require('next/server');
      
      createSuccessResponse({ result: 'ok' });

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Success',
          data: { result: 'ok' },
          timestamp: expect.any(String)
        }),
        { status: 200 }
      );
    });
  });

  describe('Request Processing Utilities', () => {
    it('should parse JSON request body', async () => {
      const { parseRequestBody } = await import('../src/lib/api/utils.ts');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ field: 'value' })
      };

      const result = await parseRequestBody(mockRequest);
      expect(result).toEqual({ field: 'value' });
    });

    it('should throw error for invalid JSON', async () => {
      const { parseRequestBody } = await import('../src/lib/api/utils.ts');
      
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      };

      await expect(parseRequestBody(mockRequest)).rejects.toThrow('Invalid JSON in request body');
    });

    it('should get query parameters', async () => {
      const { getQueryParams } = await import('../src/lib/api/utils.ts');
      
      const mockRequest = {
        url: 'http://localhost:3000/api/test?page=1&limit=10&sort=name'
      };

      const params = getQueryParams(mockRequest);
      expect(params).toEqual({
        page: '1',
        limit: '10',
        sort: 'name'
      });
    });
  });

  describe('Security Utilities', () => {
    it('should add security headers', async () => {
      const { addSecurityHeaders } = await import('../src/lib/api/utils.ts');
      
      const mockResponse = {
        headers: {
          set: jest.fn()
        }
      };

      const result = addSecurityHeaders(mockResponse);

      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockResponse.headers.set).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockResponse.headers.set).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(result).toBe(mockResponse);
    });

    it('should add timing delay', async () => {
      const { addTimingDelay } = await import('../src/lib/api/utils.ts');
      
      const startTime = Date.now();
      await addTimingDelay(100);
      const endTime = Date.now();

      // Should take at least 100ms, but allow some variance
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
      expect(endTime - startTime).toBeLessThan(300); // Max 200ms (100 base + 100 random)
    });

    it('should execute dummy operation', async () => {
      const bcrypt = await import('bcrypt');
      const { executeDummyOperation } = await import('../src/lib/api/utils.ts');
      
      await executeDummyOperation();

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'dummy-password',
        '$2b$12$dummy.hash.to.prevent.timing.attacks.against.user.enumeration'
      );
    });
  });

  describe('Pre-configured Rate Limiters', () => {
    it('should create login rate limiter with correct configuration', async () => {
      const { loginRateLimiter } = await import('../src/lib/api/utils.ts');
      
      // Test that it's a RateLimiter instance by checking methods exist
      expect(typeof loginRateLimiter.check).toBe('function');
      expect(typeof loginRateLimiter.recordAttempt).toBe('function');
      expect(typeof loginRateLimiter.clear).toBe('function');
    });

    it('should create general API rate limiter with correct configuration', async () => {
      const { generalAPIRateLimiter } = await import('../src/lib/api/utils.ts');
      
      // Test that it's a RateLimiter instance by checking methods exist
      expect(typeof generalAPIRateLimiter.check).toBe('function');
      expect(typeof generalAPIRateLimiter.recordAttempt).toBe('function');
      expect(typeof generalAPIRateLimiter.clear).toBe('function');
    });
  });
});