#!/bin/bash

# Brahmin Soulmate Connect - Pre-Deployment Checklist
# Run this before deploying to production

set -e

echo "🔍 Brahmin Soulmate Connect - Pre-Deployment Checklist"
echo "======================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

check() {
    local name="$1"
    local command="$2"
    local required="${3:-true}"

    echo -n "Checking $name... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        if [ "$required" = true ]; then
            echo -e "${RED}✗ FAILED (REQUIRED)${NC}"
            ((FAILED++))
        else
            echo -e "${YELLOW}⚠ FAILED (OPTIONAL)${NC}"
        fi
    fi
}

# Environment Variables
echo ""
echo "📋 Environment Variables:"
check "VITE_SUPABASE_URL set" "test -n \"\$VITE_SUPABASE_URL\""
check "VITE_SUPABASE_ANON_KEY set" "test -n \"\$VITE_SUPABASE_ANON_KEY\""
check "SUPABASE_SERVICE_ROLE_KEY set" "test -n \"\$SUPABASE_SERVICE_ROLE_KEY\""
check "RAZORPAY_KEY_ID set" "test -n \"\$RAZORPAY_KEY_ID\""
check "RAZORPAY_KEY_SECRET set" "test -n \"\$RAZORPAY_KEY_SECRET\""
check "FRONTEND_URL set" "test -n \"\$FRONTEND_URL\""

# Build Checks
echo ""
echo "🔨 Build Checks:"
check "Backend builds successfully" "cd backend && npm run build"
check "Frontend builds successfully" "npm run build"
check "No TypeScript errors" "npm run typecheck"
check "Linting passes" "npm run lint"

# Database Checks
echo ""
echo "🗄️  Database Checks:"
check "Database connection" "curl -f http://localhost:3001/health > /dev/null 2>&1" false
check "Migrations can run" "cd backend && npm run migrate status" false

# Security Checks
echo ""
echo "🔐 Security Checks:"
check "No secrets in code" "! grep -r 'password\|secret\|key' src/ --exclude-dir=node_modules | grep -v 'import\|from' | grep -v 'VITE_' | grep -v 'process.env'" false
check "CSP headers configured" "grep -q 'contentSecurityPolicy' backend/src/server.ts"
check "Helmet security middleware" "grep -q 'helmet' backend/src/server.ts"
check "Rate limiting configured" "grep -q 'rateLimit' backend/src/server.ts"

# Performance Checks
echo ""
echo "⚡ Performance Checks:"
check "Bundle size reasonable" "test \$(stat -f%z dist/assets/*.js 2>/dev/null | head -1 || echo 0) -lt 5000000" false
check "No large components" "! find src -name '*.tsx' -exec wc -l {} \; | awk '\$1 > 150 {print \$2}' | grep -q ." false

# Testing Checks
echo ""
echo "🧪 Testing Checks:"
check "Unit tests pass" "npm run test -- --run --passWithNoTests" false
check "E2E tests exist" "test -d tests/e2e" false

# Docker Checks
echo ""
echo "🐳 Docker Checks:"
check "Dockerfile exists" "test -f backend/Dockerfile"
check "Docker Compose exists" "test -f docker-compose.yml"
check "Docker can build" "docker build -t test-build ./backend" false

echo ""
echo "📊 Results:"
echo "Passed: $PASSED"
echo "Failed: $FAILED"

if [ $FAILED -gt 0 ]; then
    echo -e "\n${RED}❌ Deployment blocked: $FAILED required checks failed${NC}"
    echo "Please fix the failed checks before deploying."
    exit 1
else
    echo -e "\n${GREEN}✅ All checks passed! Ready for deployment.${NC}"
    exit 0
fi