import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import DonationForm from './DonationForm';
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

describe('DonationForm Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('alert', vi.fn());
    });

    it('renders donation form inputs correctly', () => {
        render(
            <BrowserRouter>
                <DonationForm />
            </BrowserRouter>
        );

        expect(screen.getByText('Donate Food')).toBeInTheDocument();
        expect(screen.getByLabelText(/Food Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Unit/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Pickup Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Expiry Date/i)).toBeInTheDocument();
    });

    it('validates empty inputs and shows error messages', async () => {
        render(
            <BrowserRouter>
                <DonationForm />
            </BrowserRouter>
        );

        const submitBtn = screen.getByRole('button', { name: /Submit/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('Food name is required')).toBeInTheDocument();
            expect(screen.getByText('Quantity is required')).toBeInTheDocument();
            expect(screen.getByText('Description is required')).toBeInTheDocument();
            expect(screen.getByText('Phone number is required')).toBeInTheDocument();
            expect(screen.getByText('Pickup address is required')).toBeInTheDocument();
            expect(screen.getByText('date is required')).toBeInTheDocument();
        });
    });

    it('shows alert if trying to submit without map location', async () => {
        render(
            <BrowserRouter>
                <DonationForm />
            </BrowserRouter>
        );

        // Fill out valid inputs
        fireEvent.change(screen.getByLabelText(/Food Name/i), { target: { value: 'Hot Soup' } });
        fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '5' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Freshly cooked' } });
        fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '9876543210' } });
        fireEvent.change(screen.getByLabelText(/Pickup Address/i), { target: { value: '123 Test Street' } });
        
        // Expiry Date (future date)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        fireEvent.change(screen.getByLabelText(/Expiry Date/i), { target: { value: tomorrowStr } });

        const submitBtn = screen.getByRole('button', { name: /Submit/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Please select pickup location on the map');
        });
    });

    it('submits form successfully when all details and map location are provided', async () => {
        API.post.mockResolvedValue({
            data: { message: 'Donation Added successfully' }
        });

        render(
            <BrowserRouter>
                <DonationForm />
            </BrowserRouter>
        );

        // Select map location
        const mapBtn = screen.getByTestId('mock-map');
        fireEvent.click(mapBtn);

        // Fill out inputs
        fireEvent.change(screen.getByLabelText(/Food Name/i), { target: { value: 'Hot Soup' } });
        fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '5' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Freshly cooked' } });
        fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '9876543210' } });
        fireEvent.change(screen.getByLabelText(/Pickup Address/i), { target: { value: '123 Test Street' } });
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        fireEvent.change(screen.getByLabelText(/Expiry Date/i), { target: { value: tomorrowStr } });

        const submitBtn = screen.getByRole('button', { name: /Submit/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(API.post).toHaveBeenCalledWith('/restaurant', expect.objectContaining({
                foodName: 'Hot Soup',
                pickupLocation: { latitude: 12.34, longitude: 56.78 }
            }));
            expect(window.alert).toHaveBeenCalledWith('Donation Added successfully');
            expect(mockNavigate).toHaveBeenCalledWith('/restaurant/my-donation');
        });
    });

    it('handles api post rejection gracefully', async () => {
        const consoleDirSpy = vi.spyOn(console, 'dir').mockImplementation(() => {});
        API.post.mockRejectedValue(new Error('Network Error'));

        render(
            <BrowserRouter>
                <DonationForm />
            </BrowserRouter>
        );

        // Select map location
        const mapBtn = screen.getByTestId('mock-map');
        fireEvent.click(mapBtn);

        // Fill out inputs
        fireEvent.change(screen.getByLabelText(/Food Name/i), { target: { value: 'Hot Soup' } });
        fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '5' } });
        fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Freshly cooked' } });
        fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '9876543210' } });
        fireEvent.change(screen.getByLabelText(/Pickup Address/i), { target: { value: '123 Test Street' } });
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        fireEvent.change(screen.getByLabelText(/Expiry Date/i), { target: { value: tomorrowStr } });

        const submitBtn = screen.getByRole('button', { name: /Submit/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(consoleDirSpy).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith('Data not saved');
        });

        consoleDirSpy.mockRestore();
    });
});
