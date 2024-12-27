import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
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
const mockTextDecoder = vi.fn().mockImplementation(() => ({
  decode: vi.fn().mockReturnValue('mocked text')
}));

global.TextDecoder = mockTextDecoder;

// Mock canvas context methods
const mockCanvasContext = {
  measureText: () => ({ width: 100 }),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  setTransform: vi.fn(),
  transform: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  clip: vi.fn(),
  drawImage: vi.fn(),
  createLinearGradient: vi.fn(),
  createPattern: vi.fn(),
  createRadialGradient: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  isPointInPath: vi.fn(),
  isPointInStroke: vi.fn(),
};

// Mock getContext
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => mockCanvasContext);
