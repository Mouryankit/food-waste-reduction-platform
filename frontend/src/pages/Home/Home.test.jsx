import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
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
        get: vi.fn()
    }
}));

describe('Home Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the hero section titles and badges', async () => {
        API.get.mockRejectedValue(new Error('Fetch failed'));

        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByText('🌱 Food Waste Reduction')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Reduce Food Waste. Feed People./i })).toBeInTheDocument();
    });

    it('navigates to Restaurant and NGO pages on CTA click', async () => {
        API.get.mockRejectedValue(new Error('Fetch failed'));

        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        const donateBtn = screen.getAllByRole('button', { name: /Donate Food/i })[0];
        const findBtn = screen.getAllByRole('button', { name: /Find Food/i })[0];

        fireEvent.click(donateBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/restaurant/add-donation');

        fireEvent.click(findBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/ngo/available-donations');

        // Click other navigation CTA buttons to cover lines
        const startDonatingBtn = screen.getByRole('button', { name: /Start Donating/i });
        fireEvent.click(startDonatingBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/restaurant/add-donation');

        const findDonationsBtn = screen.getByRole('button', { name: /Find Donations/i });
        fireEvent.click(findDonationsBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/ngo/available-donations');

        const joinNgoBtn = screen.getByRole('button', { name: /Join as NGO/i });
        fireEvent.click(joinNgoBtn);
        expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    it('fetches analytics stats and displays them', async () => {
        API.get.mockResolvedValue({
            data: {
                analytics: {
                    totalDonations: 999,
                    delivered: 888,
                    totalRestaurants: 77,
                    totalNGOs: 66
                }
            }
        });

        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('999')).toBeInTheDocument();
            expect(screen.getByText('888')).toBeInTheDocument();
            expect(screen.getByText('77')).toBeInTheDocument();
            expect(screen.getByText('66')).toBeInTheDocument();
        });
    });
});
