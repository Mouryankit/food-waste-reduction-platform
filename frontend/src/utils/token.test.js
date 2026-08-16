import { describe, it, expect, beforeEach } from 'vitest';
import { getToken } from './token';

describe('Token Utility', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should return null when token is not present in localStorage', () => {
        expect(getToken()).toBeNull();
    });

    it('should retrieve the token when present in localStorage', () => {
        localStorage.setItem('token', 'sample-jwt-token-xyz');
        expect(getToken()).toBe('sample-jwt-token-xyz');
    });
});
