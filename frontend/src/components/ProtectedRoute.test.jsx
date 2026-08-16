import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Mock useAuth hook
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

describe('ProtectedRoute Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show loading state when authentication check is in progress', () => {
        useAuth.mockReturnValue({
            user: null,
            loading: true
        });

        render(
            <MemoryRouter>
                <ProtectedRoute allowedRoles={['admin']} />
            </MemoryRouter>
        );

        expect(screen.getByText(/Checking authentication.../i)).toBeInTheDocument();
    });

    it('should redirect to /login when user is not authenticated', () => {
        useAuth.mockReturnValue({
            user: null,
            loading: false
        });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/protected" element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="" element={<div>Protected Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
        expect(screen.queryByText(/Protected Content/i)).not.toBeInTheDocument();
    });

    it('should redirect to / when user does not have required role', () => {
        useAuth.mockReturnValue({
            user: { role: 'ngo' },
            loading: false
        });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/" element={<div>Home Page</div>} />
                    <Route path="/protected" element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="" element={<div>Protected Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
        expect(screen.queryByText(/Protected Content/i)).not.toBeInTheDocument();
    });

    it('should render children (Outlet) when user has allowed role', () => {
        useAuth.mockReturnValue({
            user: { role: 'admin' },
            loading: false
        });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route path="/protected" element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="" element={<div>Protected Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
    });
});
