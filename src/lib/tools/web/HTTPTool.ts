import { FunctionTool } from '../FunctionTool';
import { Tool } from '../../../types';
import { ToolExecutionError } from '../../errors/AgentErrors';
import { ToolResultHandling } from '../ToolResultHandling';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type ContentType = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';

interface HTTPRequest {
  method: HTTPMethod;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  contentType?: ContentType;
  timeout?: number;
  retries?: number;
  auth?: {
    type: 'basic' | 'bearer';
    credentials: string;
  };
}

interface HTTPResponse extends Record<string, unknown> {
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

export class HTTPTool {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly DEFAULT_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  static create(): Tool {
    return ToolResultHandling.withObjectResult<HTTPResponse>(
      FunctionTool.withValidation(
        async (args: Record<string, unknown>) => {
          const request = args.request as HTTPRequest;
          const startTime = new Date();

          try {
            const response = await HTTPTool.executeRequest(request);
            const endTime = new Date();

            return {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              data: response.data,
              timing: {
                started: startTime.toISOString(),
                ended: endTime.toISOString(),
                duration: endTime.getTime() - startTime.getTime()
              },
              request: {
                method: request.method,
                url: request.url,
                headers: request.headers || {}
              }
            } as HTTPResponse;
          } catch (error) {
            throw new ToolExecutionError(
              `HTTP request failed: ${error instanceof Error ? error.message : String(error)}`,
              {
                toolName: 'http',
                method: request.method,
                url: request.url,
                errorType: error instanceof Error ? error.constructor.name : typeof error
              }
            );
          }
        },
        {
          name: 'http',
          description: 'Makes HTTP requests to web APIs',
          required: ['request'],
          validate: (args: Record<string, unknown>) => {
            const request = args.request as HTTPRequest;
            
            if (!request || !request.method || !request.url) {
              throw new Error('Request must include method and URL');
            }

            if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(request.method)) {
              throw new Error(`Invalid HTTP method: ${request.method}`);
            }

            if (!request.url.match(/^https?:\/\/.+/)) {
              throw new Error('URL must start with http:// or https://');
            }

            if (request.timeout !== undefined && (typeof request.timeout !== 'number' || request.timeout <= 0)) {
              throw new Error('Timeout must be a positive number');
            }

            if (request.retries !== undefined && (typeof request.retries !== 'number' || request.retries < 0)) {
              throw new Error('Retries must be a non-negative number');
            }

            if (request.auth) {
              if (!['basic', 'bearer'].includes(request.auth.type)) {
                throw new Error('Invalid auth type');
              }
              if (!request.auth.credentials) {
                throw new Error('Auth credentials required');
              }
            }
          }
        }
      ),
      {
        status: (value): boolean => typeof value === 'number',
        statusText: (value): boolean => typeof value === 'string',
        headers: (value): boolean => typeof value === 'object' && value !== null,
        timing: (value): boolean => 
          typeof value === 'object' && 
          value !== null &&
          typeof (value as HTTPResponse['timing']).started === 'string' &&
          typeof (value as HTTPResponse['timing']).ended === 'string' &&
          typeof (value as HTTPResponse['timing']).duration === 'number',
        request: (value): boolean =>
          typeof value === 'object' &&
          value !== null &&
          typeof (value as HTTPResponse['request']).method === 'string' &&
          typeof (value as HTTPResponse['request']).url === 'string'
      }
    );
  }

  private static async executeRequest(request: HTTPRequest): Promise<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: unknown;
  }> {
    const timeout = request.timeout || HTTPTool.DEFAULT_TIMEOUT;
    const retries = request.retries ?? HTTPTool.DEFAULT_RETRIES;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const headers = new Headers(request.headers || {});
        
        if (request.contentType) {
          headers.set('Content-Type', request.contentType);
        }

        if (request.auth) {
          switch (request.auth.type) {
            case 'basic':
              headers.set('Authorization', `Basic ${request.auth.credentials}`);
              break;
            case 'bearer':
              headers.set('Authorization', `Bearer ${request.auth.credentials}`);
              break;
          }
        }

        const response = await fetch(request.url, {
          method: request.method,
          headers,
          body: request.body ? 
            request.contentType === 'application/json' ? 
              JSON.stringify(request.body) : 
              String(request.body) : 
            undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        let data: unknown;
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        return {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          data
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          // Network error, can retry
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, HTTPTool.RETRY_DELAY * (attempt + 1)));
            continue;
          }
        }
        
        throw lastError;
      }
    }

    throw lastError || new Error('Request failed after retries');
  }
}
