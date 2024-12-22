#!/bin/bash

# Exit on error
set -e

# Function to safely read environment variables
load_env() {
    local line
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip comments and empty lines
        [[ $line =~ ^[[:space:]]*# ]] && continue
        [[ -z "${line// }" ]] && continue
        
        # Extract key and value, handling spaces around =
        if [[ $line =~ ^[[:space:]]*([^=]+)[[:space:]]*=[[:space:]]*(.*)[[:space:]]*$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            
            # Trim whitespace
            key="${key%"${key##*[![:space:]]}"}"
            value="${value%"${value##*[![:space:]]}"}"
            
            # Remove surrounding quotes if present
            value="${value#[\"\']}"
            value="${value%[\"\']}"
            
            # Remove any trailing comments
            value="${value%%#*}"
            value="${value%"${value##*[![:space:]]}"}"
            
            echo "Loading: $key = $value"
            
            # Export the variable
            export "$key=$value"
        fi
    done < "$1"
}

# Load environment variables
if [ -f .env ]; then
    echo "Loading environment variables..."
    load_env ".env"
else
    echo "Error: .env file not found"
    exit 1
fi

# Check required environment variables
required_vars=(
    "VITE_PINECONE_API_KEY"
    "VITE_PINECONE_ENVIRONMENT"
    "VITE_FIREBASE_API_KEY"
    "VITE_FIREBASE_PROJECT_ID"
    "GRAFANA_ADMIN_PASSWORD"
)

echo "Checking required variables..."
for var in "${required_vars[@]}"; do
    echo "Checking $var..."
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set"
        exit 1
    else
        echo "$var is set to: ${!var}"
    fi
done

# Create necessary directories
mkdir -p grafana/dashboards grafana/provisioning/datasources

# Create Grafana datasource configuration
cat > grafana/provisioning/datasources/prometheus.yml << EOF
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

# Build and deploy
echo "Building and deploying Monkey One..."

# Stop existing containers
docker-compose down

# Build new images
docker-compose build

# Start services
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check service health
services=("app" "prometheus" "grafana" "redis")
for service in "${services[@]}"; do
    if ! docker-compose ps | grep -q "$service.*Up"; then
        echo "Error: $service failed to start"
        docker-compose logs "$service"
        exit 1
    fi
done

# Initialize Prometheus alerts
curl -X POST http://localhost:9090/-/reload

# Test the application
echo "Running tests..."
npm test

# Run performance tests
echo "Running performance tests..."
npm run test:performance

# Output service URLs
echo "
Deployment complete! Services are available at:
- Application: http://localhost:3000
- Grafana: http://localhost:3001 (admin/password)
- Prometheus: http://localhost:9090

To view logs:
docker-compose logs -f

To stop services:
docker-compose down
"

# Monitor initial logs
docker-compose logs -f --tail=100
