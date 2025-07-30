#!/bin/bash

# 🧪 System Testing Script for Namplao Expense App

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# App URL (update this with your actual Vercel URL)
APP_URL="https://namplao-expense-app.vercel.app"

echo -e "${BLUE}🧪 Starting System Tests for Namplao Expense App${NC}"
echo "======================================================"
echo -e "${YELLOW}App URL: $APP_URL${NC}"
echo ""

# Test 1: Check if website is accessible
echo -e "${YELLOW}🌐 Test 1: Website Accessibility${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL")
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Website is accessible (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${RED}❌ Website not accessible (HTTP $HTTP_STATUS)${NC}"
fi
echo ""

# Test 2: Check if main pages load
echo -e "${YELLOW}📱 Test 2: Main Pages${NC}"
PAGES=("/auth" "/dashboard" "/joint-cars" "/income" "/expense")

for page in "${PAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL$page")
    if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✅ $page - OK (HTTP $STATUS)${NC}"
    else
        echo -e "${RED}❌ $page - Error (HTTP $STATUS)${NC}"
    fi
done
echo ""

# Test 3: Check for JavaScript errors (basic check)
echo -e "${YELLOW}🔍 Test 3: Basic HTML Structure${NC}"
CONTENT=$(curl -s "$APP_URL")
if echo "$CONTENT" | grep -q "<!DOCTYPE html>"; then
    echo -e "${GREEN}✅ Valid HTML document${NC}"
else
    echo -e "${RED}❌ Invalid HTML structure${NC}"
fi

if echo "$CONTENT" | grep -q "แอพ รายรับ"; then
    echo -e "${GREEN}✅ App title found${NC}"
else
    echo -e "${RED}❌ App title not found${NC}"
fi
echo ""

# Test 4: Check API endpoints
echo -e "${YELLOW}🔌 Test 4: API Endpoints${NC}"
API_ENDPOINTS=("/api/send-otp" "/api/verify-otp")

for endpoint in "${API_ENDPOINTS[@]}"; do
    # For API endpoints, we expect different status codes
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL$endpoint")
    if [ "$STATUS" = "405" ] || [ "$STATUS" = "400" ] || [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✅ $endpoint - Responding (HTTP $STATUS)${NC}"
    else
        echo -e "${RED}❌ $endpoint - Not responding (HTTP $STATUS)${NC}"
    fi
done
echo ""

# Test 5: Check for critical CSS/JS files
echo -e "${YELLOW}🎨 Test 5: Static Assets${NC}"
if echo "$CONTENT" | grep -q "_next/static"; then
    echo -e "${GREEN}✅ Next.js static assets loaded${NC}"
else
    echo -e "${RED}❌ Next.js static assets not found${NC}"
fi

if echo "$CONTENT" | grep -q "tailwind\|css"; then
    echo -e "${GREEN}✅ CSS styles loaded${NC}"
else
    echo -e "${RED}❌ CSS styles not found${NC}"
fi
echo ""

# Test 6: Performance check
echo -e "${YELLOW}⚡ Test 6: Performance${NC}"
RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null "$APP_URL")
echo -e "${BLUE}Response time: ${RESPONSE_TIME}s${NC}"

if (( $(echo "$RESPONSE_TIME < 3.0" | bc -l) )); then
    echo -e "${GREEN}✅ Good response time (<3s)${NC}"
else
    echo -e "${YELLOW}⚠️  Slow response time (>3s)${NC}"
fi
echo ""

# Summary
echo "======================================================"
echo -e "${BLUE}🎯 Test Summary${NC}"
echo -e "${GREEN}✅ Basic functionality tests completed${NC}"
echo -e "${YELLOW}📋 Manual tests needed:${NC}"
echo "   • User registration/login"
echo "   • Income/Expense CRUD operations"
echo "   • Joint Car Investment features"
echo "   • Dashboard analytics"
echo "   • Data export functionality"
echo ""
echo -e "${BLUE}🔗 Access your app: $APP_URL${NC}"
echo ""
