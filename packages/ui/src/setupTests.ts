import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import {
    afterEach,
    vi,
} from 'vitest';

// React Testing Library does not auto-clean when `globals` is off.
afterEach(() => {
    cleanup();
});

// --- happy-dom polyfills for browser APIs the components rely on ---

globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: () => undefined,
    unobserve: () => undefined,
    disconnect: () => undefined,
})) as unknown as typeof ResizeObserver;

if (typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
}

if (typeof window.HTMLElement.prototype.scrollIntoView !== 'function') {
    window.HTMLElement.prototype.scrollIntoView = () => undefined;
}
