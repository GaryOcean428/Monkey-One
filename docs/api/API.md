# API Documentation

## Overview
This document provides comprehensive documentation for the Monkey-One API endpoints, including request/response formats, authentication, and error handling.

## Base URL
```
Production: https://api.monkey-one.com/v1
Development: http://localhost:3000/v1
```

## Authentication
```typescript
// Bearer Token Authentication
headers: {
  'Authorization': 'Bearer <your_api_token>'
}
```

## Endpoints

### Agent Management

#### Create Agent
```http
POST /agents
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "string",
  "type": "Orchestrator | WebSurfer | FileSurfer",
  "capabilities": string[],
  "superiorId": "string?",
  "config": {
    "memoryLimit": number,
    "contextWindow": number,
    "modelPreference": string
  }
}

Response 201:
{
  "id": "string",
  "name": "string",
  "status": "active | inactive | error",
  "created": "ISO-8601 timestamp"
}
```

#### List Agents
```http
GET /agents
Authorization: Bearer <token>

Response 200:
{
  "agents": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "status": "string",
      "lastActive": "ISO-8601 timestamp"
    }
  ],
  "pagination": {
    "total": number,
    "page": number,
    "pageSize": number
  }
}
```

### Memory Management

#### Store Memory
```http
POST /memory
Content-Type: application/json
Authorization: Bearer <token>

{
  "agentId": "string",
  "content": {
    "type": "conversation | task | knowledge",
    "data": object,
    "metadata": {
      "timestamp": "ISO-8601 timestamp",
      "tags": string[]
    }
  }
}

Response 201:
{
  "id": "string",
  "status": "stored"
}
```

#### Query Memory
```http
GET /memory/search
Authorization: Bearer <token>

Query Parameters:
- q: string (search query)
- agentId: string
- type: string
- from: ISO-8601 timestamp
- to: ISO-8601 timestamp
- limit: number
- offset: number

Response 200:
{
  "results": [
    {
      "id": "string",
      "content": object,
      "relevance": number,
      "timestamp": "ISO-8601 timestamp"
    }
  ],
  "metadata": {
    "total": number,
    "processed": number
  }
}
```

### Task Management

#### Create Task
```http
POST /tasks
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "string",
  "description": "string",
  "priority": "high | medium | low",
  "assignedTo": "string" (agentId),
  "deadline": "ISO-8601 timestamp",
  "dependencies": string[] (task IDs)
}

Response 201:
{
  "id": "string",
  "status": "created",
  "estimatedCompletion": "ISO-8601 timestamp"
}
```

#### Update Task Status
```http
PATCH /tasks/{taskId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "in_progress | completed | failed",
  "progress": number,
  "notes": string
}

Response 200:
{
  "id": "string",
  "status": "string",
  "lastUpdated": "ISO-8601 timestamp"
}
```

### Document Processing

#### Upload Document
```http
POST /documents
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: File
- metadata: JSON string {
    "type": "string",
    "tags": string[],
    "description": "string"
  }

Response 201:
{
  "id": "string",
  "filename": "string",
  "url": "string",
  "metadata": object
}
```

#### Process Document
```http
POST /documents/{documentId}/process
Content-Type: application/json
Authorization: Bearer <token>

{
  "operations": [
    {
      "type": "extract_text | analyze | summarize",
      "config": object
    }
  ]
}

Response 202:
{
  "jobId": "string",
  "status": "processing",
  "estimatedCompletion": "ISO-8601 timestamp"
}
```

## Error Handling

### Error Response Format
```typescript
{
  "error": {
    "code": string,
    "message": string,
    "details": object?,
    "timestamp": string
  }
}
```

### Common Error Codes
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting
```typescript
headers: {
  'X-RateLimit-Limit': string,     // requests per window
  'X-RateLimit-Remaining': string, // remaining requests
  'X-RateLimit-Reset': string      // window reset time
}
```

## Webhooks

### Configure Webhook
```http
POST /webhooks
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "string",
  "events": string[],
  "secret": "string",
  "active": boolean
}

Response 201:
{
  "id": "string",
  "status": "active"
}
```

### Webhook Payload Format
```typescript
{
  "id": string,
  "event": string,
  "timestamp": string,
  "data": object,
  "signature": string
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { MonkeyOneClient } from '@monkey-one/sdk';

const client = new MonkeyOneClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Create an agent
const agent = await client.agents.create({
  name: 'TestAgent',
  type: 'Orchestrator',
  capabilities: ['text_processing', 'code_analysis']
});

// Query memory
const memories = await client.memory.search({
  query: 'project requirements',
  agentId: agent.id,
  limit: 10
});
```

## Testing

### Sandbox Environment
- Base URL: https://sandbox-api.monkey-one.com/v1
- Test API Key: Available in developer dashboard
- Reset daily at 00:00 UTC

### Test Data
```typescript
// Test user credentials
{
  "email": "test@example.com",
  "password": "test123"
}

// Test API key
"test_sk_1234567890"
```
