import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from './ResetPassword';
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

describe('ResetPassword Flow Component Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
    });

    it('navigates the entire reset password workflow step-by-step successfully', async () => {
        render(
            <BrowserRouter>
                <ResetPassword />
            </BrowserRouter>
        );

        // Step 1: Generate OTP Form
        expect(screen.getByText('Reset Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Please Enter a valid existing email/i)).toBeInTheDocument();

        // Trigger Validation error
        const generateBtn = screen.getByRole('button', { name: /Generate OTP/i });
        fireEvent.click(generateBtn);
        await waitFor(() => {
            expect(screen.getByText('Email is required')).toBeInTheDocument();
        });

        // Input valid email
        fireEvent.change(screen.getByPlaceholderText(/Please Enter a valid existing email/i), { target: { value: 'user@example.com' } });
        
        API.post.mockResolvedValueOnce({
            data: { message: 'OTP sent successfully' }
        });

        fireEvent.click(generateBtn);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith('/auth/generate-otp', { email: 'user@example.com' });
            expect(window.alert).toHaveBeenCalledWith('OTP sent successfully');
        });

        // Step 2: Verify OTP Form should now render
        expect(screen.getByText('Verify OTP')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter OTP received via email/i)).toBeInTheDocument();

        // Trigger validation error (too short OTP)
        fireEvent.change(screen.getByPlaceholderText(/Enter OTP received via email/i), { target: { value: '123' } });
        const verifyBtn = screen.getByRole('button', { name: /Submit/i });
        fireEvent.click(verifyBtn);
        await waitFor(() => {
            expect(screen.getByText('otp must be at least 6 characters')).toBeInTheDocument();
        });

        // Input correct length OTP
        fireEvent.change(screen.getByPlaceholderText(/Enter OTP received via email/i), { target: { value: '123456' } });
        
        API.post.mockResolvedValueOnce({
            data: { message: 'OTP verified successfully', token: 'mock-reset-token' }
        });

        fireEvent.click(verifyBtn);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith('/auth/verify-otp', { email: 'user@example.com', otp: '123456' });
            expect(window.alert).toHaveBeenCalledWith('OTP verified successfully');
        });

        // Step 3: Password Form should now render
        expect(screen.getByText('New Password')).toBeInTheDocument();
        const passwordInput = screen.getByLabelText('Enter Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');

        // Test password visibility toggling
        const showPasswordBtn = screen.getAllByRole('button', { name: 'Show' })[0];
        fireEvent.click(showPasswordBtn);
        expect(showPasswordBtn).toHaveTextContent('Hide');
        fireEvent.click(showPasswordBtn);
        expect(showPasswordBtn).toHaveTextContent('Show');

        // Try mismatched passwords
        fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'mismatchpwd' } });
        
        const submitBtn = screen.getByRole('button', { name: /Submit/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Password do not match');
        });

        // Match passwords and submit
        fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
        
        API.post.mockResolvedValueOnce({
            data: { message: 'Password reset successfully' }
        });

        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith(
                '/auth/reset-password',
                { password: 'newpassword123' },
                {
                    headers: {
                        'Authorization': 'Bearer mock-reset-token',
                        'Content-Type': 'application/json'
                    }
                }
            );
            expect(window.alert).toHaveBeenCalledWith('Password reset successfully');
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('handles generate OTP error flow gracefully', async () => {
        render(
            <BrowserRouter>
                <ResetPassword />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Please Enter a valid existing email/i), { target: { value: 'fail@example.com' } });
        
        API.post.mockRejectedValueOnce({
            response: { data: { message: 'Email does not exist' } }
        });

        const generateBtn = screen.getByRole('button', { name: /Generate OTP/i });
        fireEvent.click(generateBtn);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Email does not exist');
            // Remains on generate otp form
            expect(screen.getByText('Reset Password')).toBeInTheDocument();
        });
    });

    it('handles verify OTP error flow gracefully', async () => {
        render(
            <BrowserRouter>
                <ResetPassword />
            </BrowserRouter>
        );

        // Pre-set OTP sent to render verify form
        fireEvent.change(screen.getByPlaceholderText(/Please Enter a valid existing email/i), { target: { value: 'user@example.com' } });
        API.post.mockResolvedValueOnce({ data: { message: 'OTP sent' } });
        fireEvent.click(screen.getByRole('button', { name: /Generate OTP/i }));

        await waitFor(() => {
            expect(screen.getByText('Verify OTP')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText(/Enter OTP received via email/i), { target: { value: '111111' } });
        
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        API.post.mockRejectedValueOnce(new Error('Incorrect OTP'));
        
        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

        await waitFor(() => {
            expect(logSpy).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('OTP not verified', expect.any(Object));
        });
        logSpy.mockRestore();
    });

    it('handles password reset failure gracefully', async () => {
        render(
            <BrowserRouter>
                <ResetPassword />
            </BrowserRouter>
        );

        // Advance to verify form
        fireEvent.change(screen.getByPlaceholderText(/Please Enter a valid existing email/i), { target: { value: 'user@example.com' } });
        API.post.mockResolvedValueOnce({ data: { message: 'OTP sent' } });
        fireEvent.click(screen.getByRole('button', { name: /Generate OTP/i }));

        await waitFor(() => {
            expect(screen.getByText('Verify OTP')).toBeInTheDocument();
        });

        // Advance to password reset form
        fireEvent.change(screen.getByPlaceholderText(/Enter OTP received via email/i), { target: { value: '123456' } });
        API.post.mockResolvedValueOnce({ data: { message: 'Verified', token: 'token123' } });
        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

        await waitFor(() => {
            expect(screen.getByText('New Password')).toBeInTheDocument();
        });

        const passwordInput = screen.getByLabelText('Enter Password');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password');
        fireEvent.change(passwordInput, { target: { value: 'new123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'new123' } });

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        API.post.mockRejectedValueOnce(new Error('Network reset timeout'));

        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('Enter valid userId and password');
        });
        consoleErrorSpy.mockRestore();
    });
});
