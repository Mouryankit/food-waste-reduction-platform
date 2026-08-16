import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Signup from './Signup';
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

// Mock API client
vi.mock('../../api', () => ({
    default: {
        post: vi.fn()
    }
}));

// Mock the Map component which uses Leaflet
vi.mock('../Map/Map.jsx', () => ({
    default: () => <div data-testid="mocked-map">Leaflet Proximity Map Mock</div>
}));

describe('Signup Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
    });

    it('renders the signup form elements correctly', () => {
        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );

        expect(screen.getByRole('heading', { name: /Sign Up/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/^Username$/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
        expect(screen.getByTestId('mocked-map')).toBeInTheDocument();
    });

    it('submits registration successfully and redirects', async () => {
        API.post.mockResolvedValue({
            data: { message: 'Signup successfull' }
        });

        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );

        const usernameInput = screen.getByPlaceholderText(/^Username$/i);
        const emailInput = screen.getByPlaceholderText(/Enter your email/i);
        const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
        const submitBtn = screen.getByRole('button', { name: /Submit/i });

        fireEvent.change(usernameInput, { target: { value: 'cooluser1' } });
        fireEvent.change(emailInput, { target: { value: 'cooluser@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'secretpwd123' } });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith(
                '/auth/signup',
                {
                    username: 'cooluser1',
                    email: 'cooluser@example.com',
                    password: 'secretpwd123',
                    role: 'restaurant',
                    location: null
                }
            );
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });
});
