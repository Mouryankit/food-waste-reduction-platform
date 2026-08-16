import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { useAuth } from '../../context/AuthContext';
import API from '../../api';

// Mock react-router-dom useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

// Mock useAuth context hook
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

// Mock API client
vi.mock('../../api', () => ({
    default: {
        post: vi.fn()
    }
}));

describe('Login Page Component', () => {
    const mockCheckAuth = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({
            checkAuth: mockCheckAuth
        });
        // Mock global alert
        vi.stubGlobal('alert', vi.fn());
    });

    it('renders the login form elements correctly', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
    });

    it('toggles password visibility when the show/hide button is clicked', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
        const toggleBtn = screen.getByRole('button', { name: /show/i });

        expect(passwordInput.type).toBe('password');

        // Click to show password
        fireEvent.click(toggleBtn);
        expect(passwordInput.type).toBe('text');
        expect(toggleBtn.textContent).toBe('Hide');

        // Click to hide password
        fireEvent.click(toggleBtn);
        expect(passwordInput.type).toBe('password');
        expect(toggleBtn.textContent).toBe('show');
    });

    it('validates empty inputs and displays error messages', async () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const submitBtn = screen.getByRole('button', { name: /Submit/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
        });
    });

    it('submits form data successfully and navigates home', async () => {
        API.post.mockResolvedValue({
            data: { message: 'Login successful' }
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const emailInput = screen.getByPlaceholderText(/Enter your email/i);
        const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
        const submitBtn = screen.getByRole('button', { name: /Submit/i });

        fireEvent.change(emailInput, { target: { value: 'restaurant@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith(
                '/auth/login',
                { email: 'restaurant@example.com', password: 'password123', role: 'restaurant' },
                { withCredentials: true }
            );
            expect(mockCheckAuth).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });
});
