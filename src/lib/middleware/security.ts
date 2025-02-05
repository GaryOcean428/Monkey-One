import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: [
        "'self'",
        'https://*.google-analytics.com',
        'https://*.googleapis.com',
        'https://*.supabase.co',
        'https://*.supabase.in',
        'https://*.pinecone.io',
        'wss://*.supabase.co',
      ],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
})

// Input sanitization middleware
export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .trim()
      }
    })
  }
  next()
}

// JWT authentication middleware
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    // Token verification is handled by Supabase Auth
    // This middleware just ensures the token is present
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Error handling middleware
export function errorHandler(err: Error, _req: Request, res: Response, next: NextFunction) {
  console.error(err.stack)

  if (res.headersSent) {
    return next(err)
  }

  res.status(500).json({
    error: import.meta.env.PROD ? 'Internal server error' : err.message,
  })
}
