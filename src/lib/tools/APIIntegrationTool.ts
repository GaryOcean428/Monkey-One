import type { Tool } from '../../types'

export class APIIntegrationTool implements Tool {
  name = 'api-integration'
  description = 'Handles API integrations with authentication and data transformation'

  async execute(args: {
    endpoint: string
    method: string
    headers?: Record<string, string>
    body?: unknown
    auth?: {
      type: 'basic' | 'bearer' | 'oauth2'
      credentials: Record<string, string>
    }
  }): Promise<unknown> {
    const headers = new Headers(args.headers)

    if (args.auth) {
      await this.addAuthHeaders(headers, args.auth)
    }

    const response = await fetch(args.endpoint, {
      method: args.method,
      headers,
      body: args.body ? JSON.stringify(args.body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  private async addAuthHeaders(
    headers: Headers,
    auth: {
      type: 'basic' | 'bearer' | 'oauth2'
      credentials: Record<string, string>
    }
  ): Promise<void> {
    switch (auth.type) {
      case 'basic':
        const { username, password } = auth.credentials
        const basic = btoa(`${username}:${password}`)
        headers.set('Authorization', `Basic ${basic}`)
        break

      case 'bearer':
        headers.set('Authorization', `Bearer ${auth.credentials.token}`)
        break

      case 'oauth2':
        // Implement OAuth2 flow
        break
    }
  }
}
