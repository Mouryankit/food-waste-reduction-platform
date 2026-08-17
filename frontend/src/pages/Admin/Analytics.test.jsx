import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Analytics from './Analytics';
import API from '../../api';

// Mock API client
vi.mock('../../api', () => ({
    default: {
        get: vi.fn()
    }
}));

describe('Analytics Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the header correctly', () => {
        API.get.mockResolvedValue({
            data: { analytics: {} }
        });

        render(<Analytics />);

        expect(screen.getByRole('heading', { name: /Analytics Dashboard/i })).toBeInTheDocument();
        expect(screen.getByText(/Monitor metrics, growth statistics, and system activity/i)).toBeInTheDocument();
    });

    it('fetches and renders analytics metrics correctly', async () => {
        const mockAnalytics = {
            totalUsers: 150,
            totalRestaurants: 60,
            totalNGOs: 90,
            totalDonations: 450,
            pending: 20,
            accepted: 30,
            delivered: 390,
            cancelled: 10,
            dailyDonations: 15,
            weeklyDonations: 95,
            monthlyDonations: 400
        };

        API.get.mockResolvedValue({
            data: { analytics: mockAnalytics }
        });

        render(<Analytics />);

        expect(API.get).toHaveBeenCalledWith('/admin/analytics');

        await waitFor(() => {
            // Verify and check rendering of mock metrics
            expect(screen.getByText('Total Users').nextSibling.textContent).toBe('150');
            expect(screen.getByText('Restaurants').nextSibling.textContent).toBe('60');
            expect(screen.getByText('NGOs').nextSibling.textContent).toBe('90');
            expect(screen.getByText('Total Donations').nextSibling.textContent).toBe('450');
            expect(screen.getByText('Pending').nextSibling.textContent).toBe('20');
            expect(screen.getByText('Accepted').nextSibling.textContent).toBe('30');
            expect(screen.getByText('Delivered').nextSibling.textContent).toBe('390');
            expect(screen.getByText('Cancelled').nextSibling.textContent).toBe('10');
            expect(screen.getByText("Today's Donations").nextSibling.textContent).toBe('15');
            expect(screen.getByText('Last 7 Days').nextSibling.textContent).toBe('95');
            expect(screen.getByText('Last 30 Days').nextSibling.textContent).toBe('400');
        });
    });

    it('handles api fetch error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        API.get.mockRejectedValue(new Error('Network Error'));

        render(<Analytics />);

        await waitFor(() => {
            expect(API.get).toHaveBeenCalledWith('/admin/analytics');
            expect(consoleSpy).toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });
});
