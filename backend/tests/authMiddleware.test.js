const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

describe('Auth Middleware Unit Tests', () => {
    let mockReq;
    let mockRes;
    let nextFunction;
    const originalSecret = process.env.JWT_SECRET;

    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret-key-12345';
        mockReq = {
            cookies: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    afterEach(() => {
        process.env.JWT_SECRET = originalSecret;
    });

    it('should return 401 status if token is missing in cookies', () => {
        authMiddleware(mockReq, mockRes, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Not authenticated'
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 status if token is invalid or expired', () => {
        mockReq.cookies.token = 'invalid-token-value';

        authMiddleware(mockReq, mockRes, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Invalid or expired token'
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should decode token and call next() if token is valid', () => {
        const payload = { id: 'user-id-123', role: 'ngo' };
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        mockReq.cookies.token = token;

        authMiddleware(mockReq, mockRes, nextFunction);

        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockReq.user).toBeDefined();
        expect(mockReq.user.id).toBe(payload.id);
        expect(mockReq.user.role).toBe(payload.role);
        expect(nextFunction).toHaveBeenCalled();
    });
});
