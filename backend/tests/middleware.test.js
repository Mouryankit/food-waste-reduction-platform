const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock User model
jest.mock('../models/User');

const verifyToken = require('../middleware/verifyToken');
const verifyUser = require('../middleware/verifyUser');
const checkEmailExist = require('../middleware/checkEmailExist');
const { checkAdmin, checkNgo, checkRestaurant } = require('../middleware/checkUserRoles');
const { checkBlockedUser } = require('../middleware/rateLimit');
const verifyPasswordResetToken = require('../middleware/verifyPasswordResetToken');

describe('Middleware Unit Tests', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        mockReq = {
            cookies: {},
            headers: {},
            body: {},
            ip: '127.0.0.1'
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });

    describe('verifyToken', () => {
        it('should return 401 if token is missing in cookies', () => {
            verifyToken(mockReq, mockRes, nextFunction);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access Denied: No token provided.' });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 403 if token verification fails', () => {
            mockReq.cookies.token = 'invalid-token';
            jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
                callback(new Error('Invalid token'), null);
            });

            verifyToken(mockReq, mockRes, nextFunction);
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access Denied: Invalid or expired token.' });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should decode token and call next() on success', () => {
            mockReq.cookies.token = 'valid-token';
            const decoded = { id: 'user-123', role: 'restaurant' };
            jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
                callback(null, decoded);
            });

            verifyToken(mockReq, mockRes, nextFunction);
            expect(mockReq.user).toEqual(decoded);
            expect(nextFunction).toHaveBeenCalled();
        });
    });

    describe('verifyUser', () => {
        it('should call next() if user is valid', async () => {
            mockReq.user = { id: 'user-123' };
            User.findOne.mockResolvedValue({ _id: 'user-123', valid: true });

            await verifyUser(mockReq, mockRes, nextFunction);
            expect(nextFunction).toHaveBeenCalled();
        });

        it('should return block message if user is blocked by admin', async () => {
            mockReq.user = { id: 'user-123' };
            User.findOne.mockResolvedValue({ _id: 'user-123', valid: false });

            await verifyUser(mockReq, mockRes, nextFunction);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'you are blocked by the Admin' });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('checkEmailExist', () => {
        it('should call next() if user exists with the email', async () => {
            mockReq.body.email = 'test@example.com';
            User.findOne.mockResolvedValue({ email: 'test@example.com' });

            await checkEmailExist(mockReq, mockRes, nextFunction);
            expect(nextFunction).toHaveBeenCalled();
        });

        it('should return 401 if user email does not exist', async () => {
            mockReq.body.email = 'nonexistent@example.com';
            User.findOne.mockResolvedValue(null);

            await checkEmailExist(mockReq, mockRes, nextFunction);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'user with this email does not exist' });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('checkUserRoles', () => {
        it('checkAdmin - should authorize admin and reject others', () => {
            mockReq.user = { role: 'admin' };
            checkAdmin(mockReq, mockRes, nextFunction);
            expect(nextFunction).toHaveBeenCalled();

            nextFunction.mockClear();
            mockReq.user = { role: 'ngo' };
            checkAdmin(mockReq, mockRes, nextFunction);
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('checkNgo - should authorize ngo and reject others', () => {
            mockReq.user = { role: 'ngo' };
            checkNgo(mockReq, mockRes, nextFunction);
            expect(nextFunction).toHaveBeenCalled();

            nextFunction.mockClear();
            mockReq.user = { role: 'restaurant' };
            checkNgo(mockReq, mockRes, nextFunction);
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('checkRestaurant - should authorize restaurant and reject others', () => {
            mockReq.user = { role: 'restaurant' };
            checkRestaurant(mockReq, mockRes, nextFunction);
            expect(nextFunction).toHaveBeenCalled();

            nextFunction.mockClear();
            mockReq.user = { role: 'ngo' };
            checkRestaurant(mockReq, mockRes, nextFunction);
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('rateLimit - checkBlockedUser', () => {
        let mapGetSpy;
        let mapDeleteSpy;

        beforeEach(() => {
            mapGetSpy = jest.spyOn(Map.prototype, 'get');
            mapDeleteSpy = jest.spyOn(Map.prototype, 'delete').mockImplementation(() => {});
        });

        afterEach(() => {
            mapGetSpy.mockRestore();
            mapDeleteSpy.mockRestore();
        });

        it('should call next() if user IP is not blocked', () => {
            mapGetSpy.mockReturnValue(undefined);

            checkBlockedUser(mockReq, mockRes, nextFunction);
            expect(nextFunction).toHaveBeenCalled();
        });

        it('should call next() and delete IP if block has expired', () => {
            // Block until a time in the past
            mapGetSpy.mockReturnValue(Date.now() - 10000);

            checkBlockedUser(mockReq, mockRes, nextFunction);
            expect(mapDeleteSpy).toHaveBeenCalledWith(mockReq.ip);
            expect(nextFunction).toHaveBeenCalled();
        });

        it('should return 429 status if user IP is blocked', () => {
            // Blocked until 10 seconds in the future
            mapGetSpy.mockReturnValue(Date.now() + 10000);

            checkBlockedUser(mockReq, mockRes, nextFunction);
            expect(mockRes.status).toHaveBeenCalledWith(429);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: true
            }));
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('verifyPasswordResetToken', () => {
        it('should return 401 if token is missing', () => {
            verifyPasswordResetToken(mockReq, mockRes, nextFunction);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Token missing.' });
        });

        it('should return 401 if token validation fails', () => {
            mockReq.headers.authorization = 'Bearer invalid-token';
            jest.spyOn(jwt, 'verify').mockImplementation(() => {
                throw new Error('jwt expired');
            });

            verifyPasswordResetToken(mockReq, mockRes, nextFunction);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'jwt expired'
            }));
        });

        it('should decode token and set email in body on success', () => {
            mockReq.headers.authorization = 'Bearer valid-token';
            jest.spyOn(jwt, 'verify').mockReturnValue({ email: 'test@example.com' });

            verifyPasswordResetToken(mockReq, mockRes, nextFunction);
            expect(mockReq.body.email).toBe('test@example.com');
            expect(nextFunction).toHaveBeenCalled();
        });
    });
});
