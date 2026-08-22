import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';
import API from '../../api';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

// Mock AuthContext hook
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

// Mock API client
vi.mock('../../api', () => ({
    default: {
        post: vi.fn()
    }
}));

describe('Navbar Component', () => {
    const mockSetUser = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
    });

    it('renders loader branding if auth is loading', () => {
        useAuth.mockReturnValue({
            user: null,
            setUser: mockSetUser,
            loading: true
        });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText(/🌱 FWRP/i)).toBeInTheDocument();
    });

    it('renders normal branding and Home link when user is not logged in', () => {
        useAuth.mockReturnValue({
            user: null,
            setUser: mockSetUser,
            loading: false
        });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText(/🌱 FWRP/i)).toBeInTheDocument();
        expect(screen.getByText(/Home/i)).toBeInTheDocument();
        expect(screen.getByText(/Login/i)).toBeInTheDocument();
        expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    });

    it('toggles mobile menu state when toggle button is clicked', () => {
        useAuth.mockReturnValue({
            user: null,
            setUser: mockSetUser,
            loading: false
        });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        const toggleBtn = screen.getByLabelText(/Toggle navigation menu/i);
        expect(toggleBtn).toHaveTextContent('☰');

        fireEvent.click(toggleBtn);
        expect(toggleBtn).toHaveTextContent('✕');

        fireEvent.click(toggleBtn);
        expect(toggleBtn).toHaveTextContent('☰');
    });

    it('renders restaurant links when logged in user is a restaurant', () => {
        useAuth.mockReturnValue({
            user: { role: 'restaurant', name: 'The Bistro' },
            setUser: mockSetUser,
            loading: false
        });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText(/Add Donation/i)).toBeInTheDocument();
        expect(screen.getByText(/My Donations/i)).toBeInTheDocument();
        expect(screen.getByText(/The Bistro/i)).toBeInTheDocument();
        expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    });

    it('renders NGO links when logged in user is an NGO', () => {
        useAuth.mockReturnValue({
            user: { role: 'ngo', name: 'Save Food NGO' },
            setUser: mockSetUser,
            loading: false
        });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText(/Available Donations/i)).toBeInTheDocument();
        expect(screen.getByText(/Accepted Donations/i)).toBeInTheDocument();
    });

    it('renders admin links when logged in user is an admin', () => {
        useAuth.mockReturnValue({
            user: { role: 'admin', name: 'Site Admin' },
            setUser: mockSetUser,
            loading: false
        });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText(/Donations/i)).toBeInTheDocument();
        expect(screen.getByText(/Users/i)).toBeInTheDocument();
        expect(screen.getByText(/Analytics/i)).toBeInTheDocument();
    });

    it('navigates to signup page when guest sign up is clicked', () => {
        useAuth.mockReturnValue({
            user: null,
            setUser: mockSetUser,
            loading: false
        });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        const signUpBtn = screen.getByRole('button', { name: /Sign Up/i });
        fireEvent.click(signUpBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    it('logs out successfully when logout is clicked', async () => {
        useAuth.mockReturnValue({
            user: { role: 'restaurant', name: 'The Bistro' },
            setUser: mockSetUser,
            loading: false
        });

        API.post.mockResolvedValue({});

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        const logoutBtn = screen.getByRole('button', { name: /Logout/i });
        fireEvent.click(logoutBtn);

        expect(API.post).toHaveBeenCalledWith('/auth/logout');
        await waitFor(() => {
            expect(mockSetUser).toHaveBeenCalledWith(null);
            expect(window.alert).toHaveBeenCalledWith('Logout successful');
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('handles error gracefully when logout api fails', async () => {
        useAuth.mockReturnValue({
            user: { role: 'restaurant', name: 'The Bistro' },
            setUser: mockSetUser,
            loading: false
        });

        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        API.post.mockRejectedValue(new Error('Logout failed'));

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        const logoutBtn = screen.getByRole('button', { name: /Logout/i });
        fireEvent.click(logoutBtn);

        await waitFor(() => {
            expect(logSpy).toHaveBeenCalled();
            expect(mockSetUser).not.toHaveBeenCalled();
        });
        logSpy.mockRestore();
    });
});
