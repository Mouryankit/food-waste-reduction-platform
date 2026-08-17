import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import EditDonation from './EditDonation';
import API from '../../api.js';

// Mock useNavigate and useParams
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ id: 'd123' })
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
        patch: vi.fn()
    }
}));

describe('EditDonation Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
    });

    const mockDonation = {
        foodName: 'Pizza Slice',
        quantity: 5,
        unit: 'kg',
        description: 'Fresh slices of cheese pizza',
        phone: '9876543210',
        pickupAddress: '123 Main St',
        deliveryStatus: 'pending',
        expiryDate: '2026-08-20T00:00:00.000Z',
        pickupLocation: { latitude: 12.12, longitude: 34.34 }
    };

    it('fetches and displays donation details on mount', async () => {
        API.get.mockResolvedValue({
            data: { success: true, donation: mockDonation }
        });

        render(
            <BrowserRouter>
                <EditDonation />
            </BrowserRouter>
        );

        expect(API.get).toHaveBeenCalledWith('/admin/donation/d123');

        await waitFor(() => {
            expect(screen.getByDisplayValue('Pizza Slice')).toBeInTheDocument();
            expect(screen.getByDisplayValue('5')).toBeInTheDocument();
            expect(screen.getByDisplayValue('kg')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Fresh slices of cheese pizza')).toBeInTheDocument();
            expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
            expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Pending')).toBeInTheDocument();
            expect(screen.getByDisplayValue('2026-08-20')).toBeInTheDocument();
            expect(screen.getByText('12.12')).toBeInTheDocument();
            expect(screen.getByText('34.34')).toBeInTheDocument();
        });
    });

    it('shows validation errors for invalid inputs', async () => {
        API.get.mockResolvedValue({
            data: { success: true, donation: mockDonation }
        });

        render(
            <BrowserRouter>
                <EditDonation />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Pizza Slice')).toBeInTheDocument();
        });

        const foodNameInput = screen.getByDisplayValue('Pizza Slice');
        const phoneInput = screen.getByDisplayValue('9876543210');
        const qtyInput = screen.getByDisplayValue('5');

        // Clear or make invalid
        fireEvent.change(foodNameInput, { target: { value: 'A' } }); // min 2
        fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } }); // fails regex
        fireEvent.change(qtyInput, { target: { value: '-2' } }); // must be positive

        const submitBtn = screen.getByRole('button', { name: 'Update Donation' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('Food name must be at least 2 characters')).toBeInTheDocument();
            expect(screen.getByText('Enter a valid phone number')).toBeInTheDocument();
            expect(screen.getByText('Quantity must be greater than 0')).toBeInTheDocument();
        });
    });

    it('updates coordinates using Map component', async () => {
        API.get.mockResolvedValue({
            data: { success: true, donation: mockDonation }
        });

        render(
            <BrowserRouter>
                <EditDonation />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Pizza Slice')).toBeInTheDocument();
        });

        // Click set location button on mock map
        const setLocBtn = screen.getByTestId('set-location-btn');
        fireEvent.click(setLocBtn);

        await waitFor(() => {
            expect(screen.getByText('12.34')).toBeInTheDocument();
            expect(screen.getByText('56.78')).toBeInTheDocument();
        });
    });

    it('submits valid form values successfully and redirects to all-donations', async () => {
        API.get.mockResolvedValue({
            data: { success: true, donation: mockDonation }
        });

        API.patch.mockResolvedValue({
            data: { message: 'Donation updated successfully' }
        });

        render(
            <BrowserRouter>
                <EditDonation />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Pizza Slice')).toBeInTheDocument();
        });

        const submitBtn = screen.getByRole('button', { name: 'Update Donation' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(API.patch).toHaveBeenCalledWith('/admin/donation/d123', {
                foodName: 'Pizza Slice',
                quantity: 5,
                unit: 'kg',
                description: 'Fresh slices of cheese pizza',
                phone: '9876543210',
                pickupAddress: '123 Main St',
                deliveryStatus: 'pending',
                expiryDate: '2026-08-20',
                pickupLocation: { latitude: 12.12, longitude: 34.34 }
            });
            expect(window.alert).toHaveBeenCalledWith('Donation updated successfully');
            expect(mockNavigate).toHaveBeenCalledWith('/admin/all-donations');
        });
    });

    it('alerts error if form submission fails', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        API.get.mockResolvedValue({
            data: { success: true, donation: mockDonation }
        });

        API.patch.mockRejectedValue(new Error('Update failed'));

        render(
            <BrowserRouter>
                <EditDonation />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Pizza Slice')).toBeInTheDocument();
        });

        const submitBtn = screen.getByRole('button', { name: 'Update Donation' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(API.patch).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('Failed to update donation');
            expect(consoleSpy).toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });
});
