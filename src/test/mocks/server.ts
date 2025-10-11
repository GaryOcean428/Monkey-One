import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// This configures a request mocking server with the given request handlers.
export const server = setupServer(...handlers)

// Make sure any unhandled requests are logged as errors
server.events.on('request:unhandled', ({ request, print }) => {
  if (request.url.includes('/api/') || request.url.includes('/redis/')) {
    print.error()
  }
})
