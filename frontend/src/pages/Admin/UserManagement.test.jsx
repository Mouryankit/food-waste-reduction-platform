import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import UserManagement from './UserManagement';
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

// Mock API client
vi.mock('../../api', () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn()
    }
}));

describe('UserManagement Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the header and table headers correctly', async () => {
        API.get.mockResolvedValue({
            data: { users: [] }
        });

        render(
            <BrowserRouter>
                <UserManagement />
            </BrowserRouter>
        );

        expect(screen.getByRole('heading', { name: /User Management/i })).toBeInTheDocument();
        expect(screen.getByText(/Manage, block, unblock, and edit registered platform users/i)).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Action')).toBeInTheDocument();
        expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('fetches and renders the list of users correctly', async () => {
        const mockUsers = [
            { _id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'restaurant', valid: true },
            { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'ngo', valid: false }
        ];

        API.get.mockResolvedValue({
            data: { users: mockUsers }
        });

        render(
            <BrowserRouter>
                <UserManagement />
            </BrowserRouter>
        );

        expect(API.get).toHaveBeenCalledWith('/admin/users');

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
            expect(screen.getByText('restaurant')).toBeInTheDocument();
            expect(screen.getByText('Active')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Block' })).toBeInTheDocument();

            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('jane@example.com')).toBeInTheDocument();
            expect(screen.getByText('ngo')).toBeInTheDocument();
            expect(screen.getByText('Blocked')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Unblock' })).toBeInTheDocument();
        });
    });

    it('calls blockUser API and refreshes the users list', async () => {
        const mockUsers = [
            { _id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'restaurant', valid: true }
        ];

        API.get.mockResolvedValueOnce({
            data: { users: mockUsers }
        });

        API.patch.mockResolvedValue({
            data: { message: 'User blocked' }
        });

        // After refresh, the user will be blocked
        API.get.mockResolvedValueOnce({
            data: { users: [{ ...mockUsers[0], valid: false }] }
        });

        render(
            <BrowserRouter>
                <UserManagement />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const blockBtn = screen.getByRole('button', { name: 'Block' });
        fireEvent.click(blockBtn);

        await waitFor(() => {
            expect(API.patch).toHaveBeenCalledWith('/admin/block-user/u1');
            expect(API.get).toHaveBeenCalledTimes(2);
            expect(screen.getByText('Blocked')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Unblock' })).toBeInTheDocument();
        });
    });

    it('calls unblockUser API and refreshes the users list', async () => {
        const mockUsers = [
            { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'ngo', valid: false }
        ];

        API.get.mockResolvedValueOnce({
            data: { users: mockUsers }
        });

        API.patch.mockResolvedValue({
            data: { message: 'User unblocked' }
        });

        // After refresh, the user will be active
        API.get.mockResolvedValueOnce({
            data: { users: [{ ...mockUsers[0], valid: true }] }
        });

        render(
            <BrowserRouter>
                <UserManagement />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        const unblockBtn = screen.getByRole('button', { name: 'Unblock' });
        fireEvent.click(unblockBtn);

        await waitFor(() => {
            expect(API.patch).toHaveBeenCalledWith('/admin/unblock-user/u2');
            expect(API.get).toHaveBeenCalledTimes(2);
            expect(screen.getByText('Active')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Block' })).toBeInTheDocument();
        });
    });

    it('navigates to the edit user page when the Edit button is clicked', async () => {
        const mockUsers = [
            { _id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'restaurant', valid: true }
        ];

        API.get.mockResolvedValue({
            data: { users: mockUsers }
        });

        render(
            <BrowserRouter>
                <UserManagement />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const editBtn = screen.getByRole('button', { name: 'Edit' });
        fireEvent.click(editBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/admin/edit-user/u1');
    });

    it('handles api fetch error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        API.get.mockRejectedValue(new Error('Network Error'));

        render(
            <BrowserRouter>
                <UserManagement />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith('/admin/users');
            expect(consoleSpy).toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });

    it('handles block/unblock errors gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const mockUsers = [
            { _id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'restaurant', valid: true }
        ];

        API.get.mockResolvedValue({
            data: { users: mockUsers }
        });

        API.patch.mockRejectedValue(new Error('Patch error'));

        render(
            <BrowserRouter>
                <UserManagement />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        const blockBtn = screen.getByRole('button', { name: 'Block' });
        fireEvent.click(blockBtn);

        await waitFor(() => {
            expect(API.patch).toHaveBeenCalledWith('/admin/block-user/u1');
            expect(consoleSpy).toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });
});
