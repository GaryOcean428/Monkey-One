import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { TextDecoder, TextEncoder } from 'util';

// Run cleanup after each test case
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Provide jest compatibility
global.jest = {
  ...vi,
  fn: vi.fn,
  spyOn: vi.spyOn,
  mock: vi.mock,
  setTimeout: setTimeout,
  useFakeTimers: vi.useFakeTimers,
  useRealTimers: vi.useRealTimers,
  runAllTimers: vi.runAllTimers,
  advanceTimersByTime: vi.advanceTimersByTime
};

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
    randomUUID: () => 'test-uuid',
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  }
});

// Create a comprehensive mock for TextMetrics
function createTextMetricsMock(text: string): TextMetrics {
  return {
    width: text.length * 10,
    actualBoundingBoxAscent: 10,
    actualBoundingBoxDescent: 5,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: text.length * 10,
    fontBoundingBoxAscent: 12,
    fontBoundingBoxDescent: 6,
    emHeightAscent: 10,
    emHeightDescent: 5,
    hangingBaseline: 8,
    alphabeticBaseline: 10,
    ideographicBaseline: 12
  };
}

// Comprehensive mock for CanvasRenderingContext2D
function createCanvasContextMock(): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  
  const mockContext: CanvasRenderingContext2D = {
    canvas,
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
    filter: 'none',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    rect: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    clip: vi.fn(),
    isPointInPath: vi.fn(),
    isPointInStroke: vi.fn(),
    drawImage: vi.fn(),
    createLinearGradient: vi.fn(),
    createRadialGradient: vi.fn(),
    createConicGradient: vi.fn(),
    createPattern: vi.fn(),
    measureText: vi.fn((text: string) => createTextMetricsMock(text)),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    getContextAttributes: vi.fn(),
    getLineDash: vi.fn(),
    setLineDash: vi.fn(),
    createImageData: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    ellipse: vi.fn(),
  } as unknown as CanvasRenderingContext2D;

  return mockContext;
}

// Mock canvas getContext
(HTMLCanvasElement.prototype.getContext as any) = function(contextId: string) {
  switch (contextId) {
    case '2d':
      return createCanvasContextMock();
    default:
      return null;
  }
};
