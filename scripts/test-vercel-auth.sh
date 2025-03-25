#!/bin/bash

# Script to test Vercel environment variables and protection bypass
# Usage: ./scripts/test-vercel-auth.sh [deploy_url]

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# If a URL is provided as an argument, use it; otherwise, use the default URL
DEPLOY_URL=${1:-"https://monkey-one.vercel.app"}
BYPASS_TOKEN="FprJbxxrfBtasFrrF8zgDb3axO66OPIt"

echo -e "${YELLOW}Testing Vercel deployment at:${NC} $DEPLOY_URL"
echo ""

# Test 1: Check if manifest.json is accessible without bypass
echo -e "${YELLOW}Test 1: Accessing manifest.json without protection bypass...${NC}"
MANIFEST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/manifest.json")

if [ "$MANIFEST_RESPONSE" == "200" ]; then
  echo -e "${GREEN}✓ Success!${NC} manifest.json is publicly accessible (HTTP $MANIFEST_RESPONSE)"
elif [ "$MANIFEST_RESPONSE" == "401" ]; then
  echo -e "${RED}✗ Failed!${NC} manifest.json requires authentication (HTTP $MANIFEST_RESPONSE)"
  echo "  → This indicates Vercel Authentication is enabled for this environment"
else
  echo -e "${RED}✗ Failed!${NC} Unexpected response code: HTTP $MANIFEST_RESPONSE"
fi
echo ""

# Test 2: Check if manifest.json is accessible with bypass token
echo -e "${YELLOW}Test 2: Accessing manifest.json with protection bypass token...${NC}"
MANIFEST_BYPASS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/manifest.json?x-vercel-protection-bypass=$BYPASS_TOKEN")

if [ "$MANIFEST_BYPASS_RESPONSE" == "200" ]; then
  echo -e "${GREEN}✓ Success!${NC} Protection bypass token works (HTTP $MANIFEST_BYPASS_RESPONSE)"
else
  echo -e "${RED}✗ Failed!${NC} Protection bypass did not work (HTTP $MANIFEST_BYPASS_RESPONSE)"
  echo "  → Check if the bypass token is correct and enabled for this environment"
fi
echo ""

# Test 3: Check OPTIONS request for manifest.json
echo -e "${YELLOW}Test 3: Testing OPTIONS preflight request for manifest.json...${NC}"
OPTIONS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$DEPLOY_URL/manifest.json")

if [ "$OPTIONS_RESPONSE" == "200" ] || [ "$OPTIONS_RESPONSE" == "204" ]; then
  echo -e "${GREEN}✓ Success!${NC} OPTIONS request succeeded (HTTP $OPTIONS_RESPONSE)"
  echo "  → This indicates the OPTIONS Allowlist is correctly configured"
else
  echo -e "${RED}✗ Failed!${NC} OPTIONS request failed (HTTP $OPTIONS_RESPONSE)"
  echo "  → You may need to add /manifest.json to the OPTIONS Allowlist"
fi
echo ""

# Test 4: Check CORS headers
echo -e "${YELLOW}Test 4: Checking CORS headers for manifest.json...${NC}"
CORS_HEADERS=$(curl -s -I "$DEPLOY_URL/manifest.json" | grep -i "Access-Control")

if [ -n "$CORS_HEADERS" ]; then
  echo -e "${GREEN}✓ Success!${NC} CORS headers are present:"
  echo "$CORS_HEADERS"
else
  echo -e "${RED}✗ Failed!${NC} No CORS headers found"
  echo "  → Check your vercel.json 'headers' configuration"
fi
echo ""

echo -e "${YELLOW}Summary:${NC}"
echo "1. Direct access to manifest.json: $([ "$MANIFEST_RESPONSE" == "200" ] && echo -e "${GREEN}OK${NC}" || echo -e "${RED}FAILED${NC}")"
echo "2. Access with protection bypass: $([ "$MANIFEST_BYPASS_RESPONSE" == "200" ] && echo -e "${GREEN}OK${NC}" || echo -e "${RED}FAILED${NC}")"
echo "3. OPTIONS preflight request: $([ "$OPTIONS_RESPONSE" == "200" ] || [ "$OPTIONS_RESPONSE" == "204" ] && echo -e "${GREEN}OK${NC}" || echo -e "${RED}FAILED${NC}")"
echo "4. CORS headers: $([ -n "$CORS_HEADERS" ] && echo -e "${GREEN}OK${NC}" || echo -e "${RED}FAILED${NC}")"
echo ""

echo "For more information on Vercel deployment protection, see:"
echo "https://vercel.com/docs/security/deployment-protection"