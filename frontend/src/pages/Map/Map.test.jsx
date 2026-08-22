import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MapComponent from './Map';

// Stub map interactions
let mockMapClickCallback = null;
let mockSetView = vi.fn();
const mockMapInstance = {
    setView: (...args) => mockSetView(...args)
};

vi.mock('react-leaflet', () => {
    return {
        MapContainer: ({ children, style }) => (
            <div data-testid="mock-map-container" style={style}>
                {children}
            </div>
        ),
        TileLayer: ({ url }) => <div data-testid="mock-tile-layer" data-url={url} />,
        Marker: ({ position }) => <div data-testid="mock-marker" data-position={JSON.stringify(position)} />,
        useMap: () => mockMapInstance,
        useMapEvents: (events) => {
            mockMapClickCallback = events.click;
        }
    };
});

vi.mock('leaflet', () => {
    return {
        default: {
            Icon: vi.fn()
        }
    };
});

describe('MapComponent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMapClickCallback = null;
    });

    it('renders map container and TileLayer', () => {
        render(<MapComponent height="200px" width="100%" />);

        const mapContainer = screen.getByTestId('mock-map-container');
        expect(mapContainer).toBeInTheDocument();
        expect(mapContainer).toHaveStyle({ height: '200px', width: '100%' });

        const tileLayer = screen.getByTestId('mock-tile-layer');
        expect(tileLayer).toBeInTheDocument();
    });

    it('updates position and centers map when location prop is provided', () => {
        const locationProp = { latitude: 35.6895, longitude: 139.6917 };
        
        const { rerender } = render(<MapComponent location={null} />);
        expect(screen.queryByTestId('mock-marker')).not.toBeInTheDocument();

        // Rerender with location
        rerender(<MapComponent location={locationProp} />);

        const marker = screen.getByTestId('mock-marker');
        expect(marker).toBeInTheDocument();
        expect(marker.getAttribute('data-position')).toBe(JSON.stringify([35.6895, 139.6917]));
        expect(mockSetView).toHaveBeenCalledWith([35.6895, 139.6917], 13);
    });

    it('triggers setLocation prop when map click event is fired', () => {
        const setLocationMock = vi.fn();
        render(<MapComponent setLocation={setLocationMock} />);

        expect(mockMapClickCallback).not.toBeNull();

        // Fire simulated leaflet click
        act(() => {
            mockMapClickCallback({
                latlng: { lat: 40.7128, lng: -74.0060 }
            });
        });

        expect(setLocationMock).toHaveBeenCalledWith({
            latitude: 40.7128,
            longitude: -74.0060
        });

        // The marker should now be visible at clicked position
        const marker = screen.getByTestId('mock-marker');
        expect(marker).toBeInTheDocument();
        expect(marker.getAttribute('data-position')).toBe(JSON.stringify([40.7128, -74.0060]));
    });
});
