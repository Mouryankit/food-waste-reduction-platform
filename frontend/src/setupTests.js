import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Stub HTMLElement properties to prevent Leaflet from hanging in JSDOM
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 800 });
Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 600 });
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ width: 800, height: 600, top: 0, left: 0, bottom: 600, right: 800 })
});

afterEach(() => {
    cleanup();
});


