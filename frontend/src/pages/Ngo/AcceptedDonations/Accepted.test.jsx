import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Accepted from './Accepted';
import API from '../../../api';

// Mock API client
vi.mock('../../../api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

describe('Accepted Page Component', () => {
    const mockAcceptedList = [
        {
            _id: 'donation-accepted-1',
            foodName: 'Leftover Biryani',
            deliveryStatus: 'Accepted',
            quantity: 20,
            unit: 'plates',
            pickupAddress: 'Restaurant A Road',
            description: 'Mild spice',
            phone: '9876543210',
            createdAt: new Date().toISOString()
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
    });

    it('renders empty layout if no accepted donations exist', async () => {
        API.get.mockResolvedValue({
            data: { result: [] }
        });

        render(
            <BrowserRouter>
                <Accepted />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('No accepted donations')).toBeInTheDocument();
        });
    });

    it('renders accepted donations list and marks an item as delivered successfully', async () => {
        API.get.mockResolvedValueOnce({
            data: { result: mockAcceptedList }
        });
        API.post.mockResolvedValue({
            data: { message: 'Donation status updated to delivered' }
        });
        // Mock get fetch after delivered post
        API.get.mockResolvedValueOnce({
            data: { result: [] }
        });

        render(
            <BrowserRouter>
                <Accepted />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Leftover Biryani')).toBeInTheDocument();
            expect(screen.getByText('20 plates')).toBeInTheDocument();
        });

        const deliverBtn = screen.getByRole('button', { name: /Mark Delivered/i });
        fireEvent.click(deliverBtn);

        expect(API.post).toHaveBeenCalledWith('/ngo/deliver-donation', { donationId: 'donation-accepted-1' });
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Donation status updated to delivered');
            expect(API.get).toHaveBeenCalledTimes(2);
        });
    });

    it('handles api fetch error gracefully', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        API.get.mockRejectedValue(new Error('Fetch failed'));

        render(
            <BrowserRouter>
                <Accepted />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('some error occured');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    it('handles deliver post error gracefully', async () => {
        API.get.mockResolvedValue({
            data: { result: mockAcceptedList }
        });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        API.post.mockRejectedValue(new Error('Network error'));

        render(
            <BrowserRouter>
                <Accepted />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Leftover Biryani')).toBeInTheDocument();
        });

        const deliverBtn = screen.getByRole('button', { name: /Mark Delivered/i });
        fireEvent.click(deliverBtn);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Error : Network error');
            expect(consoleLogSpy).toHaveBeenCalled();
        });

        consoleLogSpy.mockRestore();
    });
});
