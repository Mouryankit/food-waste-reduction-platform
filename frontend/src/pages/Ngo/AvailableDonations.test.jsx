import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AvailableDonations from './AvailableDonations';
import API from '../../api';

// Mock react-leaflet
vi.mock('react-leaflet', () => {
    return {
        MapContainer: ({ children }) => <div data-testid="mock-map-container">{children}</div>,
        TileLayer: () => <div data-testid="mock-tile-layer" />,
        Marker: ({ children, position }) => <div data-testid="mock-marker" data-position={JSON.stringify(position)}>{children}</div>,
        Popup: ({ children }) => <div data-testid="mock-popup">{children}</div>
    };
});

vi.mock('leaflet', () => {
    return {
        default: {
            Icon: vi.fn()
        }
    };
});

// Mock AuthContext hook
const mockUser = {
    id: 'ngo-123',
    name: 'Save Food NGO',
    location: { latitude: 22.7, longitude: 75.8 } // Indore center approx
};

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser
    })
}));

// Mock API client
vi.mock('../../api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

describe('AvailableDonations Page Component', () => {
    const mockDonations = [
        {
            _id: 'donation-1',
            foodName: 'Fresh Apples',
            quantity: 50,
            unit: 'kg',
            description: 'Organic apples',
            phone: '9876543210',
            pickupAddress: 'Address 1',
            pickupLocation: { latitude: 22.71, longitude: 75.81 }, // Close (approx 1.5 km)
            expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days left
            createdAt: new Date().toISOString(),
            deliveryStatus: 'Pending'
        },
        {
            _id: 'donation-2',
            foodName: 'Rice Bowl',
            quantity: 10,
            unit: 'pieces',
            description: 'Cooked rice',
            phone: '1234567890',
            pickupAddress: 'Address 2',
            pickupLocation: { latitude: 23.0, longitude: 76.0 }, // Far (approx 38 km)
            expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days left
            createdAt: new Date().toISOString(),
            deliveryStatus: 'Pending'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
    });

    it('loads and renders available donations and map markers', async () => {
        API.get.mockResolvedValue({
            data: { result: mockDonations }
        });

        render(
            <BrowserRouter>
                <AvailableDonations />
            </BrowserRouter>
        );

        expect(API.get).toHaveBeenCalledWith('/ngo');

        await waitFor(() => {
            expect(screen.getByText('Fresh Apples')).toBeInTheDocument();
            expect(screen.getByText('Rice Bowl')).toBeInTheDocument();
        });

        // Open map modal to render markers
        const mapBtn = screen.getByRole('button', { name: /View on Map/i });
        fireEvent.click(mapBtn);

        // 2 donations markers + 1 NGO marker = 3 markers
        const markers = screen.getAllByTestId('mock-marker');
        expect(markers).toHaveLength(3);
    });

    it('filters donations by food name search', async () => {
        API.get.mockResolvedValue({
            data: { result: mockDonations }
        });

        render(
            <BrowserRouter>
                <AvailableDonations />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Fresh Apples')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/Search food name/i);
        fireEvent.change(searchInput, { target: { value: 'rice' } });

        expect(screen.getByText('Rice Bowl')).toBeInTheDocument();
        expect(screen.queryByText('Fresh Apples')).not.toBeInTheDocument();
    });

    it('filters donations by distance range', async () => {
        API.get.mockResolvedValue({
            data: { result: mockDonations }
        });

        render(
            <BrowserRouter>
                <AvailableDonations />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Fresh Apples')).toBeInTheDocument();
            expect(screen.getByText('Rice Bowl')).toBeInTheDocument();
        });

        // Filter within 5km (closes rice bowl)
        const distanceSelect = screen.getByLabelText(/^Distance$/i);
        fireEvent.change(distanceSelect, { target: { value: '5' } });

        expect(screen.getByText('Fresh Apples')).toBeInTheDocument();
        expect(screen.queryByText('Rice Bowl')).not.toBeInTheDocument();
    });

    it('filters donations by freshness (expiry date)', async () => {
        API.get.mockResolvedValue({
            data: { result: mockDonations }
        });

        render(
            <BrowserRouter>
                <AvailableDonations />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Fresh Apples')).toBeInTheDocument();
            expect(screen.getByText('Rice Bowl')).toBeInTheDocument();
        });

        // Filter: Expiry within 3 days (closes Rice Bowl, which has 5 days)
        const freshnessSelect = screen.getByLabelText(/Freshness/i);
        fireEvent.change(freshnessSelect, { target: { value: '3days' } });

        expect(screen.getByText('Fresh Apples')).toBeInTheDocument();
        expect(screen.queryByText('Rice Bowl')).not.toBeInTheDocument();
    });

    it('claims a donation successfully', async () => {
        API.get.mockResolvedValue({
            data: { result: mockDonations }
        });
        API.post.mockResolvedValue({
            data: { message: 'Donation claimed successfully' }
        });

        render(
            <BrowserRouter>
                <AvailableDonations />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Fresh Apples')).toBeInTheDocument();
        });

        const acceptBtn = screen.getAllByRole('button', { name: /Accept/i })[0];
        fireEvent.click(acceptBtn);

        expect(API.post).toHaveBeenCalledWith('/ngo/accept-donation', { donationId: 'donation-1' });
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Donation claimed successfully');
            // Re-fetches list
            expect(API.get).toHaveBeenCalledTimes(2);
        });
    });

    it('handles api fetch error gracefully', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        API.get.mockRejectedValue(new Error('API failure'));

        render(
            <BrowserRouter>
                <AvailableDonations />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('some error occured');
            expect(consoleErrorSpy).toHaveBeenCalled();
        });
        consoleErrorSpy.mockRestore();
    });

    it('handles api claim error gracefully', async () => {
        API.get.mockResolvedValue({
            data: { result: mockDonations }
        });
        const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        API.post.mockRejectedValue(new Error('Post failure'));

        render(
            <BrowserRouter>
                <AvailableDonations />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Fresh Apples')).toBeInTheDocument();
        });

        const acceptBtn = screen.getAllByRole('button', { name: /Accept/i })[0];
        fireEvent.click(acceptBtn);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Error : Post failure');
            expect(consoleLogSpy).toHaveBeenCalled();
        });
        consoleLogSpy.mockRestore();
    });
});
