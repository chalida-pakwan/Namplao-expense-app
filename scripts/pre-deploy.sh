#!/bin/bash

# 🚀 Pre-deployment checks
# ตรวจสอบความพร้อมก่อน Deploy

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Pre-deployment Checks${NC}"
echo "================================"

ERROR_COUNT=0

# Function to check and report
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        ((ERROR_COUNT++))
    fi
}

# 1. Check if .env.local exists
echo -e "${YELLOW}🔍 Checking environment files...${NC}"
if [ -f ".env.local" ]; then
    check_status 0 ".env.local exists"
else
    check_status 1 ".env.local not found - create from .env.local.example"
fi

# 2. Check Node.js version
echo -e "${YELLOW}🔍 Checking Node.js version...${NC}"
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    check_status 0 "Node.js version $NODE_VERSION (>= $REQUIRED_VERSION)"
else
    check_status 1 "Node.js version $NODE_VERSION (requires >= $REQUIRED_VERSION)"
fi

# 3. Install dependencies
echo -e "${YELLOW}🔍 Installing dependencies...${NC}"
npm install --silent
check_status $? "Dependencies installed"

# 4. TypeScript check
echo -e "${YELLOW}🔍 Checking TypeScript...${NC}"
npm run type-check 2>/dev/null
check_status $? "TypeScript compilation"

# 5. Linting
echo -e "${YELLOW}🔍 Running ESLint...${NC}"
npm run lint 2>/dev/null
check_status $? "ESLint passed"

# 6. Build test
echo -e "${YELLOW}🔍 Testing build...${NC}"
npm run build 2>/dev/null
check_status $? "Build successful"

# 7. Check for secrets in code
echo -e "${YELLOW}🔍 Checking for exposed secrets...${NC}"
SECRETS_FOUND=$(grep -r "sk_" src/ app/ components/ --exclude-dir=node_modules 2>/dev/null | wc -l)
if [ "$SECRETS_FOUND" -eq 0 ]; then
    check_status 0 "No exposed secrets found"
else
    check_status 1 "Found potential secrets in code"
fi

# 8. Check package.json scripts
echo -e "${YELLOW}🔍 Checking package.json scripts...${NC}"
REQUIRED_SCRIPTS=("build" "start" "dev")
for script in "${REQUIRED_SCRIPTS[@]}"; do
    if npm run-script --silent "$script" --if-present 2>/dev/null | grep -q "missing script"; then
        check_status 1 "Missing script: $script"
    else
        check_status 0 "Script exists: $script"
    fi
done

# 9. Check for TODO/FIXME comments
echo -e "${YELLOW}🔍 Checking for TODO/FIXME comments...${NC}"
TODO_COUNT=$(grep -r "TODO\|FIXME" src/ app/ components/ --exclude-dir=node_modules 2>/dev/null | wc -l)
if [ "$TODO_COUNT" -eq 0 ]; then
    check_status 0 "No TODO/FIXME comments found"
else
    echo -e "${YELLOW}⚠️  Found $TODO_COUNT TODO/FIXME comments${NC}"
fi

# 10. Check Git status
echo -e "${YELLOW}🔍 Checking Git status...${NC}"
if git diff-index --quiet HEAD --; then
    check_status 0 "No uncommitted changes"
else
    check_status 1 "Uncommitted changes found"
fi

# Summary
echo ""
echo "================================"
if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for deployment.${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERROR_COUNT checks failed. Please fix before deploying.${NC}"
    exit 1
fi
