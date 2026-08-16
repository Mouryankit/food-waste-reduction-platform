import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

// Mock the AuthContext hook
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

describe('Navbar Component', () => {
    it('renders loader branding if auth is loading', () => {
        useAuth.mockReturnValue({
            user: null,
            setUser: vi.fn(),
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
            setUser: vi.fn(),
            loading: false
        });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText(/🌱 FWRP/i)).toBeInTheDocument();
        expect(screen.getByText(/Home/i)).toBeInTheDocument();
    });

    it('renders restaurant links when logged in user is a restaurant', () => {
        useAuth.mockReturnValue({
            user: { role: 'restaurant', name: 'The Bistro' },
            setUser: vi.fn(),
            loading: false
        });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText(/Add Donation/i)).toBeInTheDocument();
        expect(screen.getByText(/My Donations/i)).toBeInTheDocument();
    });
});
