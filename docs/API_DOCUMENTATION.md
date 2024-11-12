# API Documentation

## Authentication Services

### Firebase Authentication

- Documentation: [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- Setup Guide: [Firebase Setup Guide](https://firebase.google.com/docs/web/setup)
- Custom Domain Setup: [Custom Auth Domain Guide](https://firebase.google.com/docs/auth/custom-domain)
- Security Best Practices: [Firebase Security Guide](https://firebase.google.com/docs/auth/web/password-auth#security_concerns)
- OAuth Configuration: [OAuth Setup Guide](https://firebase.google.com/docs/auth/web/google-signin)
- Service Account Setup: [Service Account Guide](https://cloud.google.com/iam/docs/service-account-overview)
- Workload Identity Federation: [Identity Federation Guide](https://cloud.google.com/iam/docs/workload-identity-federation)

## AI Models & Services

### X.AI (Grok)

- API Documentation: [X.AI API Reference](https://docs.x.ai/api)
- Model Cards: [X.AI Model Documentation](https://docs.x.ai/docs/models)
- Authentication: [X.AI Authentication Guide](https://docs.x.ai/docs/authentication)
- Rate Limits: [X.AI Rate Limits](https://docs.x.ai/docs/rate-limits)

### Groq

- API Documentation: [Groq API Reference](https://console.groq.com/docs/quickstart)
- Models Available:
  - `llama-3.2-3b-preview`: [Model Details](https://console.groq.com/docs/models/llama-3.2-3b)
  - `llama-3.2-7b-preview`: [Model Details](https://console.groq.com/docs/models/llama-3.2-7b)
  - `llama-3.2-70b-preview`: [Model Details](https://console.groq.com/docs/models/llama-3.2-70b)
  - `llama3-groq-8b-8192-tool-use-preview`: [Tool Use Model](https://console.groq.com/docs/models/tool-use)
  - `llama3-groq-70b-8192-tool-use-preview`: [Large Tool Use Model](https://console.groq.com/docs/models/tool-use-large)

### Perplexity

- API Documentation: [Perplexity API Reference](https://docs.perplexity.ai/reference/post_chat_completions)
- Model Cards: [Perplexity Model Documentation](https://docs.perplexity.ai/docs/model-cards)
- Models Available:
  - `llama-3.1-sonar-small-128k-online` (8B parameters)
  - `llama-3.1-sonar-large-128k-online` (70B parameters)
  - `llama-3.1-sonar-huge-128k-online` (405B parameters)

### IBM Granite

- Documentation: [IBM Granite Documentation](https://www.ibm.com/products/watsonx-ai/granite)
- Model Hub: [Hugging Face Model Card](https://huggingface.co/collections/ibm-granite/granite-code-models-6624c5cec322e4c148c8b330)
- API Reference: [Hugging Face Inference API](https://huggingface.co/docs/api-inference/index)

### Pinecone

- Documentation: [Pinecone Documentation](https://docs.pinecone.io/docs/overview)
- Assistant Guide: [Pinecone Assistant Documentation](https://docs.pinecone.io/guides/assistant/understanding-assistant)
- API Reference: [Pinecone API Reference](https://docs.pinecone.io/reference/query)
- Vector DB Guide: [Vector Database Guide](https://docs.pinecone.io/docs/vector-database)

## Environment Variables

```env
# Authentication
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=agent-one.skillhiregto.com.au
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_FIREBASE_CLIENT_ID=your_oauth_client_id
VITE_FIREBASE_CLIENT_SECRET=your_oauth_client_secret

# AI Services
VITE_XAI_API_KEY=your_xai_api_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key
VITE_PINECONE_API_KEY=your_pinecone_api_key
VITE_PINECONE_ASSISTANT_NAME=your_assistant_name

# Additional Services
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_GITHUB_TOKEN=your_github_token
VITE_SERP_API_KEY=your_serp_api_key
```

## Service Endpoints

```env
# Base URLs
XAI_BASE_URL=https://api.x.ai/v1
GROQ_BASE_URL=https://api.groq.com/openai/v1
PERPLEXITY_BASE_URL=https://api.perplexity.ai
PINECONE_BASE_URL=https://prod-1-data.ke.pinecone.io/assistant
```

## Rate Limits & Quotas

- X.AI: [Rate Limits Documentation](https://docs.x.ai/docs/rate-limits)
- Groq: [Usage Quotas](https://console.groq.com/docs/quotas)
- Perplexity: [Rate Limiting](https://docs.perplexity.ai/docs/rate-limits)
- Pinecone: [Usage Limits](https://docs.pinecone.io/docs/limits)

## Firebase Configuration

### Custom Domain Setup

1. [Custom Domain Guide](https://firebase.google.com/docs/auth/custom-domain)
2. [DNS Configuration](https://firebase.google.com/docs/hosting/custom-domain)
3. [SSL Certificates](https://firebase.google.com/docs/hosting/custom-domain-ssl)

### Security Rules

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Authentication Rules](https://firebase.google.com/docs/auth/web/password-auth#security_concerns)

### Performance Optimization

- [Offline Persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Query Optimization](https://firebase.google.com/docs/firestore/query-data/queries#query_optimization)
- [Index Management](https://firebase.google.com/docs/firestore/query-data/indexing)

## Error Handling

Refer to each service's error documentation:

- [Firebase Error Codes](https://firebase.google.com/docs/auth/admin/errors)
- [X.AI Error Codes](https://docs.x.ai/docs/errors)
- [Groq Error Reference](https://console.groq.com/docs/errors)
- [Perplexity Error Handling](https://docs.perplexity.ai/docs/error-handling)
- [Pinecone Error Codes](https://docs.pinecone.io/docs/error-codes)

## Additional Resources

### Firebase

- [Firebase Console](https://console.firebase.google.com)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Firebase Performance Monitoring](https://firebase.google.com/docs/perf-mon)

### Development Tools

- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/reference/react)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Testing

- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Firebase Testing Guide](https://firebase.google.com/docs/rules/unit-tests)

### Deployment

- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [GitHub Actions Integration](https://firebase.google.com/docs/hosting/github-integration)
- [Custom Domain Configuration](https://firebase.google.com/docs/hosting/custom-domain)
