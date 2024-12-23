# Security Guidelines

## API Key Management

### Storage
1. **Environment Variables**
   - Store API keys in `.env`
   - Never commit `.env` to version control
   - Use different keys for development/production

2. **Secret Management**
   - Use a secret manager in production
   - Rotate keys regularly
   - Limit key permissions

### Usage
```typescript
// Good - Load from environment
const apiKey = process.env.API_KEY;

// Bad - Hardcoded keys
const apiKey = "sk-1234567890";
```

## Authentication & Authorization

### JWT Implementation
```typescript
// Token generation
const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Token verification
const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
```

### Role-Based Access Control
```typescript
enum Role {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

const checkPermission = (
  requiredRole: Role,
  userRole: Role
): boolean => {
  const roleHierarchy = {
    [Role.ADMIN]: 3,
    [Role.USER]: 2,
    [Role.GUEST]: 1
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
```

## Data Protection

### Encryption
```typescript
// Data encryption
const encrypt = (data: string): string => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
};

// Data decryption
const decrypt = (encryptedData: string): string => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return decipher.update(encryptedData, 'hex', 'utf8') + decipher.final('utf8');
};
```

### Data Sanitization
```typescript
// Input sanitization
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim() // Remove whitespace
    .slice(0, MAX_INPUT_LENGTH); // Limit length
};
```

## Network Security

### HTTPS Configuration
```typescript
const httpsOptions = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem'),
  minVersion: 'TLSv1.2'
};
```

### CORS Setup
```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(','),
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};
```

## Error Handling

### Secure Error Messages
```typescript
// Good - Generic error
throw new Error('Authentication failed');

// Bad - Detailed error
throw new Error('Invalid password for user: john@example.com');
```

### Rate Limiting
```typescript
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later'
});
```

## Dependency Management

### Package Auditing
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Version Pinning
```json
{
  "dependencies": {
    "express": "4.18.2",
    "jsonwebtoken": "9.0.0"
  }
}
```

## Monitoring & Logging

### Security Logging
```typescript
const logSecurityEvent = (
  event: string,
  severity: 'low' | 'medium' | 'high',
  details: object
) => {
  logger.log({
    level: severity,
    message: event,
    timestamp: new Date().toISOString(),
    ...details
  });
};
```

### Alert Configuration
```typescript
const configureAlerts = () => {
  monitor.on('bruteForceAttempt', (details) => {
    alert.send('Brute force attempt detected', details);
    blockIP(details.ip);
  });
};
```

## Security Headers

### Header Configuration
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  referrerPolicy: { policy: 'same-origin' }
}));
```

## Best Practices

1. **Code Security**
   - Use parameterized queries
   - Validate all inputs
   - Implement proper error handling
   - Keep dependencies updated

2. **Infrastructure Security**
   - Regular security updates
   - Firewall configuration
   - Network segmentation
   - Backup strategy

3. **Access Control**
   - Principle of least privilege
   - Regular access review
   - Strong password policy
   - MFA where possible

4. **Monitoring**
   - Security logging
   - Alert configuration
   - Regular audits
   - Incident response plan
