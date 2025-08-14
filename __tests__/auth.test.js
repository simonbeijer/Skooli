// Mock jose library
jest.mock('jose', () => ({
  SignJWT: jest.fn(),
  jwtVerify: jest.fn(),
  errors: {
    JWTExpired: class JWTExpired extends Error {
      constructor(message) {
        super(message);
        this.name = 'JWTExpired';
      }
    },
    JWTInvalid: class JWTInvalid extends Error {
      constructor(message) {
        super(message);
        this.name = 'JWTInvalid';
      }
    }
  }
}));

describe('Auth Utilities', () => {
  let mockSignJWT, mockJwtVerify;
  let originalEnv;

  beforeAll(() => {
    // Store original env
    originalEnv = process.env.JWT_SECRET;
  });

  afterAll(() => {
    // Restore original env
    process.env.JWT_SECRET = originalEnv;
  });

  beforeEach(() => {
    // Set valid JWT_SECRET for tests
    process.env.JWT_SECRET = 'a'.repeat(32); // 32 character secret
    
    // Clear module cache to reload with new env
    jest.resetModules();
    
    // Setup mocks
    mockSignJWT = {
      setProtectedHeader: jest.fn().mockReturnThis(),
      setIssuedAt: jest.fn().mockReturnThis(),
      setExpirationTime: jest.fn().mockReturnThis(),
      sign: jest.fn().mockResolvedValue('mock.jwt.token')
    };
    
    mockJwtVerify = jest.fn();
    
    const jose = require('jose');
    jose.SignJWT.mockImplementation(() => mockSignJWT);
    jose.jwtVerify.mockImplementation(mockJwtVerify);
    
    jest.clearAllMocks();
  });

  describe('JWT Secret Validation', () => {
    it('should throw error when JWT_SECRET is missing', async () => {
      delete process.env.JWT_SECRET;
      jest.resetModules();
      
      await expect(async () => {
        const { createToken } = await import('../src/lib/auth.ts');
      }).rejects.toThrow('JWT_SECRET environment variable is required');
    });

    it('should throw error when JWT_SECRET is too short', async () => {
      process.env.JWT_SECRET = 'short';
      jest.resetModules();
      
      await expect(async () => {
        const { createToken } = await import('../src/lib/auth.ts');
      }).rejects.toThrow('JWT_SECRET must be at least 32 characters long');
    });
  });

  describe('createToken', () => {
    it('should create a valid JWT token for a user', async () => {
      const { createToken } = await import('../src/lib/auth.ts');
      const jose = require('jose');
      
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };

      const token = await createToken(mockUser);

      expect(token).toBe('mock.jwt.token');
      expect(jose.SignJWT).toHaveBeenCalledWith({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      });
      expect(mockSignJWT.setProtectedHeader).toHaveBeenCalledWith({ alg: 'HS256' });
      expect(mockSignJWT.setIssuedAt).toHaveBeenCalled();
      expect(mockSignJWT.setExpirationTime).toHaveBeenCalledWith('2h');
      expect(mockSignJWT.sign).toHaveBeenCalled();
    });

    it('should throw AuthError when token creation fails', async () => {
      const { createToken, AuthError } = await import('../src/lib/auth.ts');
      
      mockSignJWT.sign.mockRejectedValue(new Error('Signing failed'));
      
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };

      await expect(createToken(mockUser)).rejects.toThrow(AuthError);
      await expect(createToken(mockUser)).rejects.toThrow('Failed to create JWT token');
    });
  });

  describe('verifyAuth', () => {
    it('should verify a valid token and return payload', async () => {
      const { verifyAuth } = await import('../src/lib/auth.ts');
      const jose = require('jose');
      
      const mockPayload = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      };

      mockJwtVerify.mockResolvedValue({ payload: mockPayload });

      const result = await verifyAuth('valid.jwt.token');

      expect(result).toEqual(mockPayload);
      expect(jose.jwtVerify).toHaveBeenCalledWith('valid.jwt.token', expect.any(Object));
    });

    it('should throw AuthError for missing token', async () => {
      const { verifyAuth, AuthError } = await import('../src/lib/auth.ts');

      await expect(verifyAuth('')).rejects.toThrow(AuthError);
      await expect(verifyAuth('')).rejects.toThrow('Missing or invalid token');
    });

    it('should throw AuthError for invalid token type', async () => {
      const { verifyAuth, AuthError } = await import('../src/lib/auth.ts');

      await expect(verifyAuth(123)).rejects.toThrow(AuthError);
      await expect(verifyAuth(123)).rejects.toThrow('Missing or invalid token');
    });

    it('should handle expired token error', async () => {
      const { verifyAuth, AuthError } = await import('../src/lib/auth.ts');
      const jose = require('jose');
      
      mockJwtVerify.mockRejectedValue(new jose.errors.JWTExpired('Token expired'));

      await expect(verifyAuth('expired.token')).rejects.toThrow(AuthError);
      await expect(verifyAuth('expired.token')).rejects.toThrow('Token has expired');
    });

    it('should handle invalid token error', async () => {
      const { verifyAuth, AuthError } = await import('../src/lib/auth.ts');
      const jose = require('jose');
      
      mockJwtVerify.mockRejectedValue(new jose.errors.JWTInvalid('Invalid token'));

      await expect(verifyAuth('invalid.token')).rejects.toThrow(AuthError);
      await expect(verifyAuth('invalid.token')).rejects.toThrow('Invalid token signature');
    });

    it('should throw AuthError for invalid payload structure', async () => {
      const { verifyAuth, AuthError } = await import('../src/lib/auth.ts');
      
      const invalidPayload = { id: 'user123' }; // Missing required fields

      mockJwtVerify.mockResolvedValue({ payload: invalidPayload });

      await expect(verifyAuth('token.with.invalid.payload')).rejects.toThrow(AuthError);
      await expect(verifyAuth('token.with.invalid.payload')).rejects.toThrow('Invalid token payload structure');
    });
  });


  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer format', async () => {
      const { extractTokenFromHeader } = await import('../src/lib/auth.ts');
      
      const result = extractTokenFromHeader('Bearer valid.jwt.token');
      
      expect(result).toBe('valid.jwt.token');
    });

    it('should extract token from direct format', async () => {
      const { extractTokenFromHeader } = await import('../src/lib/auth.ts');
      
      const result = extractTokenFromHeader('direct.jwt.token');
      
      expect(result).toBe('direct.jwt.token');
    });

    it('should return null for null header', async () => {
      const { extractTokenFromHeader } = await import('../src/lib/auth.ts');
      
      const result = extractTokenFromHeader(null);
      
      expect(result).toBeNull();
    });

    it('should return null for empty header', async () => {
      const { extractTokenFromHeader } = await import('../src/lib/auth.ts');
      
      const result = extractTokenFromHeader('');
      
      expect(result).toBeNull();
    });
  });

  describe('extractTokenFromCookie', () => {
    it('should extract token from cookie string', async () => {
      const { extractTokenFromCookie } = await import('../src/lib/auth.ts');
      
      const cookieHeader = 'auth-token=jwt.token.here; other=value';
      const result = extractTokenFromCookie(cookieHeader);
      
      expect(result).toBe('jwt.token.here');
    });

    it('should extract token with custom cookie name', async () => {
      const { extractTokenFromCookie } = await import('../src/lib/auth.ts');
      
      const cookieHeader = 'custom-token=jwt.token.here; other=value';
      const result = extractTokenFromCookie(cookieHeader, 'custom-token');
      
      expect(result).toBe('jwt.token.here');
    });

    it('should return null for missing cookie', async () => {
      const { extractTokenFromCookie } = await import('../src/lib/auth.ts');
      
      const cookieHeader = 'other=value; another=data';
      const result = extractTokenFromCookie(cookieHeader);
      
      expect(result).toBeNull();
    });

    it('should return null for null cookie header', async () => {
      const { extractTokenFromCookie } = await import('../src/lib/auth.ts');
      
      const result = extractTokenFromCookie(null);
      
      expect(result).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid non-expired token', async () => {
      const { isTokenExpired } = await import('../src/lib/auth.ts');
      
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `header.${encodedPayload}.signature`;
      
      const result = isTokenExpired(mockToken);
      
      expect(result).toBe(false);
    });

    it('should return true for expired token', async () => {
      const { isTokenExpired } = await import('../src/lib/auth.ts');
      
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = { exp: pastTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `header.${encodedPayload}.signature`;
      
      const result = isTokenExpired(mockToken);
      
      expect(result).toBe(true);
    });

    it('should return true for malformed token', async () => {
      const { isTokenExpired } = await import('../src/lib/auth.ts');
      
      const result = isTokenExpired('invalid.token');
      
      expect(result).toBe(true);
    });

    it('should return undefined for token without exp claim', async () => {
      const { isTokenExpired } = await import('../src/lib/auth.ts');
      
      const payload = { id: 'user123' }; // No exp field
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `header.${encodedPayload}.signature`;
      
      const result = isTokenExpired(mockToken);
      
      // When no exp field, payload.exp && payload.exp < now returns undefined
      expect(result).toBeUndefined();
    });
  });

  describe('getTokenExpiration', () => {
    it('should return expiration date for valid token', async () => {
      const { getTokenExpiration } = await import('../src/lib/auth.ts');
      
      const expTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: expTime };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `header.${encodedPayload}.signature`;
      
      const result = getTokenExpiration(mockToken);
      
      expect(result).toEqual(new Date(expTime * 1000));
    });

    it('should return null for token without exp claim', async () => {
      const { getTokenExpiration } = await import('../src/lib/auth.ts');
      
      const payload = { id: 'user123' };
      const encodedPayload = btoa(JSON.stringify(payload));
      const mockToken = `header.${encodedPayload}.signature`;
      
      const result = getTokenExpiration(mockToken);
      
      expect(result).toBeNull();
    });

    it('should return null for malformed token', async () => {
      const { getTokenExpiration } = await import('../src/lib/auth.ts');
      
      const result = getTokenExpiration('invalid.token');
      
      expect(result).toBeNull();
    });
  });

  describe('AuthError', () => {
    it('should create AuthError with message and code', async () => {
      const { AuthError } = await import('../src/lib/auth.ts');
      
      const error = new AuthError('Test error', { code: 'INVALID_CREDENTIALS' });
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('INVALID_CREDENTIALS');
      expect(error.name).toBe('AuthError');
    });

    it('should create AuthError with default code', async () => {
      const { AuthError } = await import('../src/lib/auth.ts');
      
      const error = new AuthError('Test error');
      
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create AuthError with status code', async () => {
      const { AuthError } = await import('../src/lib/auth.ts');
      
      const error = new AuthError('Test error', { 
        code: 'TOKEN_EXPIRED', 
        statusCode: 401 
      });
      
      expect(error.statusCode).toBe(401);
    });
  });
});