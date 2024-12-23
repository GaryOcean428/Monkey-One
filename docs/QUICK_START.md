# Quick Start Guide

## Prerequisites

- Node.js (v18 or higher)
- Python 3.9+
- Git
- API keys for:
  - Groq
  - Perplexity
  - XAI (Grok)
  - Huggingface

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/monkey-one.git
cd monkey-one
```

2. Install dependencies:
```bash
# Install Node dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

## Configuration

1. API Keys Setup:
   - Add your API keys to `.env`
   - Never commit API keys to version control
   - Use environment variables in production

2. Model Configuration:
   - Configure default models in `config/models.json`
   - Set resource limits in `config/resources.json`
   - Configure logging in `config/logging.json`

## Running the Project

1. Start the development server:
```bash
npm run dev
```

2. Start the ML pipeline:
```bash
python scripts/start_ml_pipeline.py
```

3. Run tests:
```bash
npm test
```

## Common Issues & Troubleshooting

### API Connection Issues
- Check API keys are correctly set in `.env`
- Verify network connectivity
- Ensure API service status is operational

### Memory Issues
- Check system has sufficient RAM (8GB+ recommended)
- Monitor memory usage with `npm run monitor`
- Clear cache if needed: `npm run clear-cache`

### Model Loading Issues
- Verify model checksums
- Check disk space for model storage
- Use `npm run validate-models` to verify integrity

## Development Workflow

1. Create feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make changes and test:
```bash
npm run lint
npm test
```

3. Submit PR:
- Follow PR template
- Ensure CI passes
- Request review

## Need Help?

- Check [troubleshooting guide](./TROUBLESHOOTING.md)
- Review [common issues](./COMMON_ISSUES.md)
- Join our [Discord community](https://discord.gg/monkey-one)
- Open an issue on GitHub
