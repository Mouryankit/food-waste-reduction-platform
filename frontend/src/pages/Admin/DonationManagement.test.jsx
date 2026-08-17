import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import DonationManagement from './DonationManagement';
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
        get: vi.fn(),
        patch: vi.fn()
    }
}));

describe('DonationManagement Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the header and table headers correctly', async () => {
        API.get.mockResolvedValue({
            data: { donations: [] }
        });

        render(
            <BrowserRouter>
                <DonationManagement />
            </BrowserRouter>
        );

        expect(screen.getByRole('heading', { name: /Donation Management/i })).toBeInTheDocument();
        expect(screen.getByText(/Track, verify, and update status of all platform donations/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Status :/i)).toBeInTheDocument();

        expect(screen.getByText('Food')).toBeInTheDocument();
        expect(screen.getByText('Quantity')).toBeInTheDocument();
        expect(screen.getByText('Restaurant')).toBeInTheDocument();
        expect(screen.getByText('NGO')).toBeInTheDocument();
        expect(screen.getByText('Expiry')).toBeInTheDocument();
    });

    it('fetches and displays donations correctly', async () => {
        const mockDonations = [
            {
                _id: 'd1',
                foodName: 'Pizza Box',
                quantity: 5,
                unit: 'kg',
                userObjectId: { name: 'Dominos' },
                ngoObjectId: null,
                deliveryStatus: 'pending',
                expiryDate: '2026-08-20T00:00:00.000Z'
            },
            {
                _id: 'd2',
                foodName: 'Rice Bowl',
                quantity: 10,
                unit: 'plates',
                userObjectId: { name: 'Paradise' },
                ngoObjectId: { name: 'Feeding India' },
                deliveryStatus: 'accepted',
                expiryDate: '2026-08-21T00:00:00.000Z'
            }
        ];

        API.get.mockResolvedValue({
            data: { donations: mockDonations }
        });

        render(
            <BrowserRouter>
                <DonationManagement />
            </BrowserRouter>
        );

        expect(API.get).toHaveBeenCalledWith('/admin/donations');

        await waitFor(() => {
            expect(screen.getByText('Pizza Box')).toBeInTheDocument();
            expect(screen.getByText('5 kg')).toBeInTheDocument();
            expect(screen.getByText('Dominos')).toBeInTheDocument();
            expect(screen.getByText('Not Accepted')).toBeInTheDocument();

            expect(screen.getByText('Rice Bowl')).toBeInTheDocument();
            expect(screen.getByText('10 plates')).toBeInTheDocument();
            expect(screen.getByText('Paradise')).toBeInTheDocument();
            expect(screen.getByText('Feeding India')).toBeInTheDocument();
        });
    });

    it('filters donations by status select dropdown', async () => {
        API.get.mockResolvedValue({
            data: { donations: [] }
        });

        render(
            <BrowserRouter>
                <DonationManagement />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(API.get).toHaveBeenLastCalledWith('/admin/donations');
        });

        const statusSelect = screen.getByLabelText(/Status :/i);
        fireEvent.change(statusSelect, { target: { value: 'accepted' } });

        await waitFor(() => {
            expect(API.get).toHaveBeenLastCalledWith('/admin/donations?status=accepted');
        });
    });

    it('updates donation status and refreshes list', async () => {
        const mockDonations = [
            {
                _id: 'd1',
                foodName: 'Pizza Box',
                quantity: 5,
                unit: 'kg',
                userObjectId: { name: 'Dominos' },
                ngoObjectId: null,
                deliveryStatus: 'pending',
                expiryDate: '2026-08-20T00:00:00.000Z'
            }
        ];

        API.get.mockResolvedValueOnce({
            data: { donations: mockDonations }
        });

        API.patch.mockResolvedValue({
            data: { message: 'Status updated' }
        });

        // After refresh status becomes accepted
        API.get.mockResolvedValueOnce({
            data: {
                donations: [
                    { ...mockDonations[0], deliveryStatus: 'accepted' }
                ]
            }
        });

        render(
            <BrowserRouter>
                <DonationManagement />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Pizza Box')).toBeInTheDocument();
        });

        // Find status dropdown in the row (not the filter one)
        const rowSelect = screen.getByDisplayValue('Pending');
        fireEvent.change(rowSelect, { target: { value: 'accepted' } });

        await waitFor(() => {
            expect(API.patch).toHaveBeenCalledWith('/admin/donation-status/d1', {
                deliveryStatus: 'accepted'
            });
            expect(API.get).toHaveBeenCalledTimes(2);
            expect(screen.getByDisplayValue('Accepted')).toBeInTheDocument();
        });
    });

    it('navigates to edit-donation page when edit button is clicked', async () => {
        const mockDonations = [
            {
                _id: 'd1',
                foodName: 'Pizza Box',
                quantity: 5,
                unit: 'kg',
                userObjectId: { name: 'Dominos' },
                ngoObjectId: null,
                deliveryStatus: 'pending',
                expiryDate: '2026-08-20T00:00:00.000Z'
            }
        ];

        API.get.mockResolvedValue({
            data: { donations: mockDonations }
        });

        render(
            <BrowserRouter>
                <DonationManagement />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Pizza Box')).toBeInTheDocument();
        });

        const editBtn = screen.getByRole('button', { name: 'Edit' });
        fireEvent.click(editBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/admin/edit-donation/d1');
    });

    it('handles API get error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        API.get.mockRejectedValue(new Error('Network error'));

        render(
            <BrowserRouter>
                <DonationManagement />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(API.get).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });

    it('handles status update error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        const mockDonations = [
            {
                _id: 'd1',
                foodName: 'Pizza Box',
                quantity: 5,
                unit: 'kg',
                userObjectId: { name: 'Dominos' },
                ngoObjectId: null,
                deliveryStatus: 'pending',
                expiryDate: '2026-08-20T00:00:00.000Z'
            }
        ];

        API.get.mockResolvedValue({
            data: { donations: mockDonations }
        });

        API.patch.mockRejectedValue(new Error('Patch error'));

        render(
            <BrowserRouter>
                <DonationManagement />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Pizza Box')).toBeInTheDocument();
        });

        const rowSelect = screen.getByDisplayValue('Pending');
        fireEvent.change(rowSelect, { target: { value: 'accepted' } });

        await waitFor(() => {
            expect(API.patch).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });
});
