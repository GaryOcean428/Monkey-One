import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;

// Replace the TextDecoder mock with a more compatible version
class CustomTextDecoder extends TextDecoder {
  decode(input?: ArrayBuffer | ArrayBufferView | null, options?: { stream?: boolean }): string {
    return super.decode(input as ArrayBuffer, options);
  }
}
global.TextDecoder = CustomTextDecoder as typeof global.TextDecoder;

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 0);
};

// Mock cancelAnimationFrame
global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid'
  }
});

// Mock WebGL context
HTMLCanvasElement.prototype.getContext = jest.fn((contextId) => {
  if (contextId === '2d') {
    return {
      canvas: document.createElement('canvas'),
      getContextAttributes: jest.fn(),
      globalAlpha: 1.0,
      globalCompositeOperation: 'source-over',
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineCap: 'butt',
      lineJoin: 'miter',
      lineWidth: 1.0,
      miterLimit: 10.0,
      shadowBlur: 0,
      shadowColor: 'rgba(0,0,0,0)',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      rect: jest.fn(),
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      arc: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      translate: jest.fn(),
      transform: jest.fn(),
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      drawImage: jest.fn(),
      createLinearGradient: jest.fn(),
      createPattern: jest.fn(),
      createRadialGradient: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      fillText: jest.fn(),
      strokeText: jest.fn()
    };
  }
  return null;
});