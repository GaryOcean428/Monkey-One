import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// This configures a request mocking server with the given request handlers.
export const server = setupServer(...handlers)

// Make sure any unhandled requests are logged as errors
server.events.on('unhandledRequest', (req, print) => {
  if (req.url.href.includes('/api/') || req.url.href.includes('/redis/')) {
    print.error()
  }
})
