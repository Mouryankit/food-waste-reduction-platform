import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Delivered from './Delivered';
import API from '../../../api';

// Mock API client
vi.mock('../../../api', () => ({
    default: {
        get: vi.fn()
    }
}));

describe('Delivered Page Component', () => {
    const mockDeliveredList = [
        {
            _id: 'donation-delivered-1',
            foodName: 'Old Bread Packets',
            deliveryStatus: 'Delivered',
            quantity: 15,
            unit: 'pieces',
            pickupAddress: 'Bakery Lane 55',
            description: 'Whole wheat bread',
            phone: '9998887776',
            createdAt: new Date().toISOString()
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
    });

    it('renders empty layout if no delivered donations exist', async () => {
        API.get.mockResolvedValue({
            data: { result: [] }
        });

        render(
            <BrowserRouter>
                <Delivered />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('No delivered donations')).toBeInTheDocument();
        });
    });

    it('renders delivered donations list successfully', async () => {
        API.get.mockResolvedValue({
            data: { result: mockDeliveredList }
        });

        render(
            <BrowserRouter>
                <Delivered />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Old Bread Packets')).toBeInTheDocument();
            expect(screen.getByText('15 pieces')).toBeInTheDocument();
            expect(screen.getByText('Bakery Lane 55')).toBeInTheDocument();
            expect(screen.getByText('Whole wheat bread')).toBeInTheDocument();
        });
    });

    it('handles api fetch error gracefully', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        API.get.mockRejectedValue(new Error('Fetch failed'));

        render(
            <BrowserRouter>
                <Delivered />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('some error occured');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });
});
