import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AcceptedDonations from './AcceptedDonations';

// Mock Accepted and Delivered child components
vi.mock('./AcceptedDonations/Accepted.jsx', () => ({
    default: () => <div data-testid="accepted-mock">Mocked Accepted Component</div>
}));

vi.mock('./AcceptedDonations/Delivered.jsx', () => ({
    default: () => <div data-testid="delivered-mock">Mocked Delivered Component</div>
}));

describe('AcceptedDonations Page Component', () => {
    it('renders heading and tabs correctly', () => {
        render(<AcceptedDonations />);
        
        expect(screen.getByText('Donation History')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Accepted/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Delivered/i })).toBeInTheDocument();
    });

    it('displays Accepted component by default and toggles to Delivered component on tab click', () => {
        render(<AcceptedDonations />);

        // Default tab
        expect(screen.getByTestId('accepted-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('delivered-mock')).not.toBeInTheDocument();

        // Click Delivered tab
        const deliveredBtn = screen.getByRole('button', { name: /Delivered/i });
        fireEvent.click(deliveredBtn);

        expect(screen.queryByTestId('accepted-mock')).not.toBeInTheDocument();
        expect(screen.getByTestId('delivered-mock')).toBeInTheDocument();

        // Click back to Accepted tab
        const acceptedBtn = screen.getByRole('button', { name: /Accepted/i });
        fireEvent.click(acceptedBtn);

        expect(screen.getByTestId('accepted-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('delivered-mock')).not.toBeInTheDocument();
    });
});
