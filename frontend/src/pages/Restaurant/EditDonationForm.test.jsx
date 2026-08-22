import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import EditDonationForm from './EditDonationForm';
import API from '../../api';

// Mock useNavigate and useParams
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ id: 'donation-123' })
    };
});

// Mock API client
vi.mock('../../api', () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn()
    }
}));

// Mock MapComponent to avoid Leaflet rendering in jsdom
vi.mock('../Map/Map.jsx', () => ({
    default: ({ setLocation }) => (
        <button
            type="button"
            data-testid="mock-map"
            onClick={() => setLocation({ latitude: 12.34, longitude: 56.78 })}
        >
            Mock Map Select Location
        </button>
    )
}));

describe('EditDonationForm Page Component', () => {
    const mockDonation = {
        foodName: 'Old Apples',
        quantity: 10,
        unit: 'kg',
        description: 'Older but good',
        phone: '9876543210',
        pickupAddress: 'Old Street 123',
        pickupLocation: { latitude: 1.2, longitude: 3.4 },
        expiryDate: '2026-12-31T00:00:00.000Z'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
    });

    it('loads and pre-populates form fields with existing data on mount', async () => {
        API.get.mockResolvedValue({
            data: { data: mockDonation }
        });

        render(
            <BrowserRouter>
                <EditDonationForm />
            </BrowserRouter>
        );

        expect(API.get).toHaveBeenCalledWith('/restaurant/donation/donation-123');

        await waitFor(() => {
            expect(screen.getByLabelText(/Food Name/i)).toHaveValue('Old Apples');
            expect(screen.getByLabelText(/Quantity/i)).toHaveValue(10);
            expect(screen.getByLabelText(/Description/i)).toHaveValue('Older but good');
            expect(screen.getByLabelText(/Phone/i)).toHaveValue('9876543210');
            expect(screen.getByLabelText(/Pickup Address/i)).toHaveValue('Old Street 123');
            expect(screen.getByLabelText(/Expiry Date/i)).toHaveValue('2026-12-31');
        });
    });

    it('submits updated donation successfully', async () => {
        API.get.mockResolvedValue({
            data: { data: mockDonation }
        });
        API.patch.mockResolvedValue({
            data: { message: 'Donation updated successfully' }
        });

        render(
            <BrowserRouter>
                <EditDonationForm />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/Food Name/i)).toHaveValue('Old Apples');
        });

        // Modify food name
        fireEvent.change(screen.getByLabelText(/Food Name/i), { target: { value: 'New Apples' } });

        const submitBtn = screen.getByRole('button', { name: /Submit/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(API.patch).toHaveBeenCalledWith('/restaurant/donation/donation-123', expect.objectContaining({
                foodName: 'New Apples',
                pickupLocation: { latitude: 1.2, longitude: 3.4 }
            }));
            expect(window.alert).toHaveBeenCalledWith('Donation updated successfully');
            expect(mockNavigate).toHaveBeenCalledWith('/restaurant/my-donation');
        });
    });

    it('handles api fetch error gracefully', async () => {
        const consoleDirSpy = vi.spyOn(console, 'dir').mockImplementation(() => {});
        API.get.mockRejectedValue(new Error('Fetch failed'));

        render(
            <BrowserRouter>
                <EditDonationForm />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(consoleDirSpy).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('Data not saved');
        });

        consoleDirSpy.mockRestore();
    });

    it('handles api patch save error gracefully', async () => {
        API.get.mockResolvedValue({
            data: { data: mockDonation }
        });
        const consoleDirSpy = vi.spyOn(console, 'dir').mockImplementation(() => {});
        API.patch.mockRejectedValue(new Error('Patch failed'));

        render(
            <BrowserRouter>
                <EditDonationForm />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByLabelText(/Food Name/i)).toHaveValue('Old Apples');
        });

        const submitBtn = screen.getByRole('button', { name: /Submit/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(consoleDirSpy).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('Data not saved');
        });

        consoleDirSpy.mockRestore();
    });
});
