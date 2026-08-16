const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

describe('Generate Token Utility Unit Test', () => {
    const originalSecret = process.env.JWT_SECRET;

    beforeAll(() => {
        process.env.JWT_SECRET = 'test-secret-key-12345';
    });

    afterAll(() => {
        process.env.JWT_SECRET = originalSecret;
    });

    it('should generate a valid JWT with correct payload and expiration', () => {
        const email = 'ngo@example.com';
        const token = generateToken(email);

        expect(token).toBeDefined();
        
        // Decode and verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.email).toBe(email);
        expect(decoded.allowPasswordReset).toBe(true);
        // Expiration check (should be defined)
        expect(decoded.exp).toBeDefined();
    });
});
