import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';
import { vi } from '@vitest/globals';  // Update this import

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
    randomUUID: () => 'test-uuid'
  }
});

// Create a comprehensive mock for TextMetrics
function createTextMetricsMock(text: string): TextMetrics {
  return {
    width: text.length * 10, // Approximate width
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
    
    // Drawing state
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
    
    // Additional properties
    filter: 'none',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    
    // Path methods
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
    
    // Transformation methods
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    
    // Compositing and clipping
    save: vi.fn(),
    restore: vi.fn(),
    clip: vi.fn(),
    isPointInPath: vi.fn(),
    isPointInStroke: vi.fn(),
    
    // Drawing images and text
    drawImage: vi.fn(),
    createLinearGradient: vi.fn(),
    createRadialGradient: vi.fn(),
    createConicGradient: vi.fn(),
    createPattern: vi.fn(),
    measureText: vi.fn((text: string) => createTextMetricsMock(text)),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    
    // Additional methods
    getContextAttributes: vi.fn(),
    getLineDash: vi.fn(),
    setLineDash: vi.fn(),
    createImageData: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    
    // More path methods
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    
    // Additional clipping and path methods
    ellipse: vi.fn(),
    
    // Gradient and pattern methods
    addColorStop: vi.fn(),
  } as unknown as CanvasRenderingContext2D;

  return mockContext;
}

// Comprehensive mock for WebGLRenderingContext
function createWebGLContextMock(): WebGLRenderingContext {
  return {
    canvas: document.createElement('canvas'),
    drawingBufferWidth: 300,
    drawingBufferHeight: 150,
    
    // WebGL-specific methods
    clear: vi.fn(),
    clearColor: vi.fn(),
    clearDepth: vi.fn(),
    clearStencil: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    
    // Shader and program methods
    createShader: vi.fn(),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    createProgram: vi.fn(),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    
    // Attribute and uniform methods
    getAttribLocation: vi.fn(),
    getUniformLocation: vi.fn(),
    vertexAttribPointer: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    
    // Drawing methods
    drawArrays: vi.fn(),
    drawElements: vi.fn(),
    
    // Texture methods
    createTexture: vi.fn(),
    bindTexture: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    
    // Viewport and scissor
    viewport: vi.fn(),
    scissor: vi.fn(),
    
    // Miscellaneous
    getError: vi.fn(),
    getContextAttributes: vi.fn(),
  } as unknown as WebGLRenderingContext;
}

// Precise type definition for GetContextFn
type GetContextFn = {
  (contextId: '2d', options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D | null;
  (contextId: 'webgl', options?: WebGLContextAttributes): WebGLRenderingContext | null;
  (contextId: 'webgl2', options?: WebGLContextAttributes): WebGLRenderingContext | null;
  (contextId: 'bitmaprenderer', options?: ImageBitmapRenderingContextSettings): ImageBitmapRenderingContext | null;
  (contextId: string, options?: unknown): RenderingContext | null;
};

// Define a union type for all possible rendering contexts
type RenderingContext = 
  | CanvasRenderingContext2D 
  | WebGLRenderingContext 
  | ImageBitmapRenderingContext 
  | GPUCanvasContext 
  | null;

// Create mock implementation with precise typing
const mockGetContext = vi.fn((contextId: string, options?: unknown) => {
  switch (contextId) {
    case '2d':
      return createCanvasContextMock();
    case 'webgl':
    case 'webgl2':
      return createWebGLContextMock();
    case 'bitmaprenderer':
      return null; // Simplified mock for bitmap renderer
    default:
      return null;
  }
}) as GetContextFn;

// Extend HTMLCanvasElement prototype with precise type
interface HTMLCanvasElement {
  getContext(contextId: '2d', options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D | null;
  getContext(contextId: 'webgl', options?: WebGLContextAttributes): WebGLRenderingContext | null;
  getContext(contextId: 'webgl2', options?: WebGLContextAttributes): WebGLRenderingContext | null;
  getContext(contextId: 'bitmaprenderer', options?: ImageBitmapRenderingContextSettings): ImageBitmapRenderingContext | null;
  getContext(contextId: string, options?: unknown): RenderingContext | null;
}

// Explicitly type the prototype assignment
(HTMLCanvasElement.prototype.getContext as any) = mockGetContext;
