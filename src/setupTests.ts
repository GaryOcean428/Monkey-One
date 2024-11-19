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
    arcTo: jest.fn(),
    
    // Transformation methods
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    transform: jest.fn(),
    setTransform: jest.fn(),
    resetTransform: jest.fn(),
    
    // Compositing and clipping
    save: jest.fn(),
    restore: jest.fn(),
    clip: jest.fn(),
    isPointInPath: jest.fn(),
    isPointInStroke: jest.fn(),
    
    // Drawing images and text
    drawImage: jest.fn(),
    createLinearGradient: jest.fn(),
    createRadialGradient: jest.fn(),
    createConicGradient: jest.fn(),
    createPattern: jest.fn(),
    measureText: jest.fn((text: string) => createTextMetricsMock(text)),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    
    // Additional methods
    getContextAttributes: jest.fn(),
    getLineDash: jest.fn(),
    setLineDash: jest.fn(),
    createImageData: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    
    // More path methods
    quadraticCurveTo: jest.fn(),
    bezierCurveTo: jest.fn(),
    
    // Additional clipping and path methods
    ellipse: jest.fn(),
    
    // Gradient and pattern methods
    addColorStop: jest.fn(),
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
    clear: jest.fn(),
    clearColor: jest.fn(),
    clearDepth: jest.fn(),
    clearStencil: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    
    // Shader and program methods
    createShader: jest.fn(),
    shaderSource: jest.fn(),
    compileShader: jest.fn(),
    createProgram: jest.fn(),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    
    // Attribute and uniform methods
    getAttribLocation: jest.fn(),
    getUniformLocation: jest.fn(),
    vertexAttribPointer: jest.fn(),
    enableVertexAttribArray: jest.fn(),
    
    // Drawing methods
    drawArrays: jest.fn(),
    drawElements: jest.fn(),
    
    // Texture methods
    createTexture: jest.fn(),
    bindTexture: jest.fn(),
    texImage2D: jest.fn(),
    texParameteri: jest.fn(),
    
    // Viewport and scissor
    viewport: jest.fn(),
    scissor: jest.fn(),
    
    // Miscellaneous
    getError: jest.fn(),
    getContextAttributes: jest.fn(),
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
const mockGetContext = jest.fn((contextId: string, options?: unknown) => {
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
