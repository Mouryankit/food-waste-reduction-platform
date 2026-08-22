const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Mock User and bcrypt
jest.mock('../models/User');
jest.mock('bcrypt');

describe('Auth Endpoints (Mocked DB)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret-key-12345';
    });

    describe('POST /auth/signup', () => {
        it('should return 401 if data is missing', async () => {
            const res = await request(app)
                .post('/auth/signup')
                .send({
                    email: 'test@example.com'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('data is missing');
        });

        it('should successfully signup a user', async () => {
            User.prototype.save = jest.fn().mockResolvedValue({
                _id: 'mock-user-id',
                name: 'testuser',
                email: 'test@example.com',
                role: 'restaurant'
            });

            const res = await request(app)
                .post('/auth/signup')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'restaurant',
                    location: { latitude: 12.34, longitude: 56.78 }
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Signup sucessfull');
        });

        it('should return 400 if user registration throws an error (e.g. duplicate email)', async () => {
            User.prototype.save = jest.fn().mockRejectedValue(new Error('User already exists'));

            const res = await request(app)
                .post('/auth/signup')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'restaurant',
                    location: { latitude: 12.34, longitude: 56.78 }
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('user already exist');
        });
    });

    describe('POST /auth/login', () => {
        it('should reject login if fields are missing', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@example.com' });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Email, password and role are required');
        });

        it('should reject login with invalid credentials (user not found)', async () => {
            User.findOne = jest.fn().mockResolvedValue(null);

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'wrong@gmail.com',
                    password: 'wrongpassword',
                    role: 'restaurant'
                });

            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Invalid email or password');
        });

        it('should reject login if user is locked', async () => {
            const lockedTime = new Date(Date.now() + 60000); // locked until 1 minute from now
            User.findOne = jest.fn().mockResolvedValue({
                email: 'locked@example.com',
                loginLockedUntil: lockedTime,
                save: jest.fn().mockResolvedValue({})
            });

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'locked@example.com', password: 'pass', role: 'restaurant' });

            expect(res.statusCode).toBe(429);
            expect(res.body.message).toContain('Too many failed login attempts');
        });

        it('should reset lock stats if lock duration has expired', async () => {
            const expiredLockTime = new Date(Date.now() - 60000); // expired 1 minute ago
            const mockSave = jest.fn().mockResolvedValue({});
            User.findOne = jest.fn().mockResolvedValue({
                email: 'expired-lock@example.com',
                loginLockedUntil: expiredLockTime,
                failedLoginAttempts: 2,
                password: 'hashed_password',
                role: 'restaurant',
                save: mockSave
            });
            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'expired-lock@example.com', password: 'pass', role: 'restaurant' });

            expect(mockSave).toHaveBeenCalled();
            expect(res.statusCode).toBe(200);
        });

        it('should increment failed attempts and lock account on 3rd failure', async () => {
            const mockSave = jest.fn().mockResolvedValue({});
            User.findOne = jest.fn().mockResolvedValue({
                email: 'fail@example.com',
                password: 'hashed_password',
                role: 'restaurant',
                failedLoginAttempts: 2,
                loginLockLevel: 0,
                save: mockSave
            });
            bcrypt.compare.mockResolvedValue(false);

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'fail@example.com', password: 'wrong', role: 'restaurant' });

            expect(mockSave).toHaveBeenCalled();
            expect(res.statusCode).toBe(429);
            expect(res.body.message).toContain('Too many failed attempts. Account locked');
        });

        it('should increment failed attempts and return 401 on 1st/2nd failure', async () => {
            const mockSave = jest.fn().mockResolvedValue({});
            User.findOne = jest.fn().mockResolvedValue({
                email: 'fail@example.com',
                password: 'hashed_password',
                role: 'restaurant',
                failedLoginAttempts: 0,
                save: mockSave
            });
            bcrypt.compare.mockResolvedValue(false);

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'fail@example.com', password: 'wrong', role: 'restaurant' });

            expect(mockSave).toHaveBeenCalled();
            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Invalid email or password');
        });

        it('should return 500 status on database failure', async () => {
            User.findOne = jest.fn().mockRejectedValue(new Error('DB failure'));

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'error@example.com', password: 'pass', role: 'restaurant' });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Internal server error');
        });
    });

    describe('POST /auth/logout', () => {
        it('should successfully clear token cookie and log out', async () => {
            const res = await request(app)
                .post('/auth/logout');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Logout successful');
        });
    });
});
