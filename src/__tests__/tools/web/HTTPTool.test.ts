import { HTTPTool } from '../../../lib/tools/web/HTTPTool';
import { ToolExecutionError } from '../../../lib/errors/AgentErrors';

interface HTTPResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  timing: {
    started: string;
    ended: string;
    duration: number;
  };
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
  };
}

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type AuthType = 'basic' | 'bearer' | 'invalid';

describe('HTTPTool', () => {
  const http = HTTPTool.create();
  let originalFetch: typeof global.fetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'content-type': 'application/json'
      }),
      json: () => Promise.resolve({ data: 'test' }),
      text: () => Promise.resolve('test')
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('request validation', () => {
    it('should require method and URL', async () => {
      await expect(http.execute({
        request: {}
      })).rejects.toThrow('Request must include method and URL');
    });

    it('should validate HTTP method', async () => {
      const invalidMethod = 'INVALID' as string;
      await expect(http.execute({
        request: {
          method: invalidMethod as HTTPMethod,
          url: 'https://api.example.com'
        }
      })).rejects.toThrow('Invalid HTTP method');
    });

    it('should validate URL format', async () => {
      await expect(http.execute({
        request: {
          method: 'GET',
          url: 'invalid-url'
        }
      })).rejects.toThrow('URL must start with http');
    });

    it('should validate timeout value', async () => {
      await expect(http.execute({
        request: {
          method: 'GET',
          url: 'https://api.example.com',
          timeout: -1
        }
      })).rejects.toThrow('Timeout must be a positive number');
    });

    it('should validate retries value', async () => {
      await expect(http.execute({
        request: {
          method: 'GET',
          url: 'https://api.example.com',
          retries: -1
        }
      })).rejects.toThrow('Retries must be a non-negative number');
    });

    it('should validate auth configuration', async () => {
      const invalidAuthType = 'invalid' as AuthType;
      await expect(http.execute({
        request: {
          method: 'GET',
          url: 'https://api.example.com',
          auth: {
            type: invalidAuthType,
            credentials: 'token'
          }
        }
      })).rejects.toThrow('Invalid auth type');
    });
  });

  describe('request execution', () => {
    it('should make successful GET request', async () => {
      const result = await http.execute({
        request: {
          method: 'GET',
          url: 'https://api.example.com'
        }
      }) as HTTPResponse;

      expect(result).toMatchObject({
        status: 200,
        statusText: 'OK',
        data: { data: 'test' },
        request: {
          method: 'GET',
          url: 'https://api.example.com'
        }
      });
      expect(result.timing).toBeDefined();
    });

    it('should handle POST request with JSON body', async () => {
      const body = { test: true };
      await http.execute({
        request: {
          method: 'POST',
          url: 'https://api.example.com',
          body,
          contentType: 'application/json'
        }
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
          body: JSON.stringify(body)
        })
      );
    });

    it('should handle basic auth', async () => {
      await http.execute({
        request: {
          method: 'GET',
          url: 'https://api.example.com',
          auth: {
            type: 'basic',
            credentials: 'dXNlcjpwYXNz'
          }
        }
      });

      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[1].headers as Headers;
      expect(headers.get('Authorization')).toBe('Basic dXNlcjpwYXNz');
    });

    it('should handle bearer auth', async () => {
      await http.execute({
        request: {
          method: 'GET',
          url: 'https://api.example.com',
          auth: {
            type: 'bearer',
            credentials: 'token123'
          }
        }
      });

      const fetchCall = (fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[1].headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer token123');
    });
  });

  describe('response handling', () => {
    it('should parse JSON response', async () => {
      const mockJsonResponse = { data: 'test' };
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Headers({
          'content-type': 'application/json'
        }),
        json: () => Promise.resolve(mockJsonResponse),
        text: () => Promise.resolve(JSON.stringify(mockJsonResponse))
      });

      const result = await http.execute({
        request: {
          method: 'GET',
          url: 'https://api.example.com'
        }
      }) as HTTPResponse;

      expect(result.data).toEqual(mockJsonResponse);
    });

    it('should handle text response', async () => {
      const textResponse = 'Plain text response';
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Headers({
          'content-type': 'text/plain'
        }),
        json: () => Promise.reject(new Error('Invalid JSON')),
        text: () => Promise.resolve(textResponse)
      });

      const result = await http.execute({
        request: {
          method: 'GET',
          url: 'https://api.example.com'
        }
      }) as HTTPResponse;

      expect(result.data).toBe(textResponse);
    });
  });

  describe('error handling and retries', () => {
    it('should retry on network errors', async () => {
      const networkError = new TypeError('Failed to fetch');
      global.fetch = jest.fn()
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: () => Promise.resolve({ success: true }),
          text: () => Promise.resolve('success')
        });

      const result = await http.execute({
        request: {
          method: 'GET',
          url: 'https://api.example.com',
          retries: 2
        }
      }) as HTTPResponse;

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(result.status).toBe(200);
    });

    it('should handle timeout', async () => {
      global.fetch = jest.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Timeout'));
          }, 1000);
        });
      });

      await expect(http.execute({
        request: {
          method: 'GET',
          url: 'https://api.example.com',
          timeout: 500
        }
      })).rejects.toThrow(ToolExecutionError);

      jest.runAllTimers();
    });

    it('should include error details in ToolExecutionError', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      try {
        await http.execute({
          request: {
            method: 'GET',
            url: 'https://api.example.com'
          }
        });
      } catch (error) {
        if (error instanceof ToolExecutionError) {
          expect(error.details).toMatchObject({
            toolName: 'http',
            method: 'GET',
            url: 'https://api.example.com',
            errorType: 'Error'
          });
        }
      }
    });
  });
});
