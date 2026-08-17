import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import EditUser from './EditUser';
import API from '../../api.js';

// Mock useNavigate and useParams
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ id: 'u123' })
    };
});

// Mock Map component
vi.mock('../Map/Map.jsx', () => ({
    default: ({ location, setLocation }) => (
        <div data-testid="mock-map">
            <span>Mock Map</span>
            <button data-testid="set-location-btn" onClick={() => setLocation({ latitude: 12.34, longitude: 56.78 })}>
                Set Mock Location
            </button>
        </div>
    )
}));

// Mock API client
vi.mock('../../api.js', () => ({
    default: {
        get: vi.fn(),
        put: vi.fn()
    }
}));

describe('EditUser Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
    });

    it('fetches and displays user details on mount', async () => {
        const mockUser = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: 'ngo',
            location: { latitude: 12.12, longitude: 34.34 }
        };

        API.get.mockResolvedValue({
            data: { success: true, user: mockUser }
        });

        render(
            <BrowserRouter>
                <EditUser />
            </BrowserRouter>
        );

        expect(API.get).toHaveBeenCalledWith('/admin/user/u123');

        await waitFor(() => {
            expect(screen.getByText('Name')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
            expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
            expect(screen.getByDisplayValue('NGO')).toBeInTheDocument();
            expect(screen.getByText('Latitude:')).toBeInTheDocument();
            expect(screen.getByText('12.12')).toBeInTheDocument();
            expect(screen.getByText('Longitude:')).toBeInTheDocument();
            expect(screen.getByText('34.34')).toBeInTheDocument();
        });
    });

    it('alerts error if fetching user details fails', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        API.get.mockRejectedValue(new Error('Network error'));

        render(
            <BrowserRouter>
                <EditUser />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith('/admin/user/u123');
            expect(window.alert).toHaveBeenCalledWith('Failed to load user.');
            expect(consoleSpy).toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });

    it('updates state correctly when inputs are modified', async () => {
        const mockUser = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: 'ngo',
            location: null
        };

        API.get.mockResolvedValue({
            data: { success: true, user: mockUser }
        });

        render(
            <BrowserRouter>
                <EditUser />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
        });

        const nameInput = screen.getByDisplayValue('Jane Doe');
        const emailInput = screen.getByDisplayValue('jane@example.com');
        const roleSelect = screen.getByDisplayValue('NGO');

        fireEvent.change(nameInput, { target: { value: 'Jane Updated' } });
        fireEvent.change(emailInput, { target: { value: 'updated@example.com' } });
        fireEvent.change(roleSelect, { target: { value: 'restaurant' } });

        expect(nameInput.value).toBe('Jane Updated');
        expect(emailInput.value).toBe('updated@example.com');
        expect(roleSelect.value).toBe('restaurant');
    });

    it('updates location state when Map calls setLocation', async () => {
        const mockUser = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: 'ngo',
            location: null
        };

        API.get.mockResolvedValue({
            data: { success: true, user: mockUser }
        });

        render(
            <BrowserRouter>
                <EditUser />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
        });

        expect(screen.queryByText('Latitude:')).not.toBeInTheDocument();

        const setLocBtn = screen.getByTestId('set-location-btn');
        fireEvent.click(setLocBtn);

        await waitFor(() => {
            expect(screen.getByText('Latitude:')).toBeInTheDocument();
            expect(screen.getByText('12.34')).toBeInTheDocument();
            expect(screen.getByText('Longitude:')).toBeInTheDocument();
            expect(screen.getByText('56.78')).toBeInTheDocument();
        });
    });

    it('calls updateUser API, alerts success, and navigates back to user-management', async () => {
        const mockUser = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: 'ngo',
            location: { latitude: 12.12, longitude: 34.34 }
        };

        API.get.mockResolvedValue({
            data: { success: true, user: mockUser }
        });

        API.put.mockResolvedValue({
            data: { message: 'User updated successfully' }
        });

        render(
            <BrowserRouter>
                <EditUser />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
        });

        const updateBtn = screen.getByRole('button', { name: 'Update User' });
        fireEvent.click(updateBtn);

        await waitFor(() => {
            expect(API.put).toHaveBeenCalledWith('/admin/user/u123', {
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: 'ngo',
                location: { latitude: 12.12, longitude: 34.34 }
            });
            expect(window.alert).toHaveBeenCalledWith('User updated successfully');
            expect(mockNavigate).toHaveBeenCalledWith('/admin/user-management');
        });
    });

    it('alerts custom error message when updating fails', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const mockUser = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: 'ngo',
            location: null
        };

        API.get.mockResolvedValue({
            data: { success: true, user: mockUser }
        });

        const apiError = {
            response: {
                data: { message: 'Email already exists' }
            }
        };
        API.put.mockRejectedValue(apiError);

        render(
            <BrowserRouter>
                <EditUser />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
        });

        const updateBtn = screen.getByRole('button', { name: 'Update User' });
        fireEvent.click(updateBtn);

        await waitFor(() => {
            expect(API.put).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('Email already exists');
            expect(consoleSpy).toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });

    it('alerts generic error message when updating fails without response details', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const mockUser = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: 'ngo',
            location: null
        };

        API.get.mockResolvedValue({
            data: { success: true, user: mockUser }
        });

        API.put.mockRejectedValue(new Error('Network error'));

        render(
            <BrowserRouter>
                <EditUser />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
        });

        const updateBtn = screen.getByRole('button', { name: 'Update User' });
        fireEvent.click(updateBtn);

        await waitFor(() => {
            expect(API.put).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('Failed to update user.');
            expect(consoleSpy).toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });
});
