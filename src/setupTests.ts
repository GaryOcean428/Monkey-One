import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Run cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock TextDecoder
class CustomTextDecoder {
  decode(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
  }
}

global.TextDecoder = CustomTextDecoder as any;

// Mock canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
if (ctx) {
  Object.assign(ctx, {
    measureText: () => ({
      width: 100,
      actualBoundingBoxAscent: 10,
      actualBoundingBoxDescent: 10,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: 100,
      fontBoundingBoxAscent: 10,
      fontBoundingBoxDescent: 10,
      alphabeticBaseline: 0,
      emHeightAscent: 10,
      emHeightDescent: 10,
      hangingBaseline: 0,
      ideographicBaseline: 10,
    }),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  });
}
