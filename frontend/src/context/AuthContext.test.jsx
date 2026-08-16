import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import API from '../api';

// Mock API
vi.mock('../api', () => ({
    default: {
        get: vi.fn()
    }
}));

// Test helper component
function TestComponent() {
    const { user, loading, checkAuth } = useAuth();
    if (loading) return <div>Loading...</div>;
    return (
        <div>
            <div data-testid="user">{user ? user.email : 'No User'}</div>
            <button onClick={checkAuth} data-testid="refetch-btn">Refetch</button>
        </div>
    );
}

describe('AuthContext Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with a null user and set loading to false on failed auth check', async () => {
        API.get.mockRejectedValue(new Error('Unauthorized'));

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Initially loading
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        // Wait for checkAuth to complete
        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('No User');
        });
    });

    it('should retrieve and set user successfully on mount', async () => {
        const mockUser = { email: 'restaurant@donor.org', role: 'restaurant' };
        API.get.mockResolvedValue({
            data: { user: mockUser }
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('restaurant@donor.org');
        });
        expect(API.get).toHaveBeenCalledWith('/auth/me');
    });
});
