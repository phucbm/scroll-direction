// Test setup for DOM testing
// This file runs before each test file

// Mock window.matchMedia for responsive design testing
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];

    constructor(
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit
    ) {
        // Store callback and options if needed for testing
    }

    observe(): void {
        return;
    }

    disconnect(): void {
        return;
    }

    unobserve(): void {
        return;
    }

    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
} as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(callback, 0);
};

global.cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
};