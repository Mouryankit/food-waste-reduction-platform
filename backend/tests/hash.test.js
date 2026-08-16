const plainToHashPassword = require('../utils/hash');
const bcrypt = require('bcrypt');

describe('Password Hash Unit Test', () => {
    it('should successfully hash a plain text password', async () => {
        const password = 'mySecurePassword123';
        const hash = await plainToHashPassword(password);
        
        expect(hash).toBeDefined();
        expect(hash).not.toBe(password);
        
        // Verify that the hash matches the password when using bcrypt
        const match = await bcrypt.compare(password, hash);
        expect(match).toBe(true);
    });
});
