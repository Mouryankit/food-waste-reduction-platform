const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

// Mock the User model
jest.mock('../models/User');

describe('Auth Endpoints (Mocked DB)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
            // Mock saved user behavior
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
            // Mock save rejection
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
        it('should reject login with invalid credentials', async () => {
            // Mock findOne to return null (user not found)
            User.findOne = jest.fn().mockResolvedValue(null);

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'wrong@gmail.com',
                    password: 'wrongpassword',
                    role: 'restaurant' // login requires a role
                });

            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Invalid email or password');
        });
    });
});
