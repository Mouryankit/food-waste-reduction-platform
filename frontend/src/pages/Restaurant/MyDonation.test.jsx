import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import MyDonation from './MyDonation';
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
        delete: vi.fn()
    }
}));

describe('MyDonation Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
        vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    });

    it('renders empty state when there are no donations', async () => {
        API.get.mockResolvedValue({
            data: { result: [] }
        });

        render(
            <BrowserRouter>
                <MyDonation />
            </BrowserRouter>
        );

        expect(screen.getByText('Loading your donations...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('No donations found')).toBeInTheDocument();
            expect(screen.getByText("You don't have any donations created yet.")).toBeInTheDocument();
        });
    });

    it('fetches and renders donations list with correct stats', async () => {
        const mockDonations = [
            { _id: 'd1', foodName: 'Pizza Slice', deliveryStatus: 'pending', expiryDate: new Date(Date.now() + 86400000).toISOString() },
            { _id: 'd2', foodName: 'Veggies', deliveryStatus: 'accepted', expiryDate: new Date(Date.now() + 86400000).toISOString() }
        ];

        API.get.mockResolvedValue({
            data: { result: mockDonations }
        });

        render(
            <BrowserRouter>
                <MyDonation />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Pizza Slice')).toBeInTheDocument();
            expect(screen.getByText('Veggies')).toBeInTheDocument();
        });

        // Verifying stats display
        expect(screen.getByText('Total Donations')).toBeInTheDocument();
        expect(screen.getAllByText('1')).toHaveLength(2); // 1 Pending, 1 Accepted
    });

    it('deletes a donation when delete confirmation is accepted', async () => {
        const mockDonations = [
            { _id: 'd1', foodName: 'Donut Box', deliveryStatus: 'pending', expiryDate: new Date(Date.now() + 86400000).toISOString() }
        ];

        API.get.mockResolvedValue({
            data: { result: mockDonations }
        });
        API.delete.mockResolvedValue({
            data: { message: 'Donation deleted successfully' }
        });

        render(
            <BrowserRouter>
                <MyDonation />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Donut Box')).toBeInTheDocument();
        });

        const deleteBtn = screen.getByRole('button', { name: /Delete/i });
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(API.delete).toHaveBeenCalledWith('/restaurant/d1');
            expect(screen.queryByText('Donut Box')).not.toBeInTheDocument();
        });
    });
});
