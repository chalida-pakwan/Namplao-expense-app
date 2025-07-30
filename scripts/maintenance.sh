#!/bin/bash

# 🧹 Maintenance Script
# รวม utilities สำหรับการดูแลระบบ

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_menu() {
    echo -e "${BLUE}🔧 Maintenance Menu${NC}"
    echo "=================="
    echo "1. 🧹 Clean build files"
    echo "2. 📦 Update dependencies"
    echo "3. 🔍 Security audit"
    echo "4. 📊 Project statistics"
    echo "5. 🗄️  Database backup"
    echo "6. 🚀 Pre-deployment check"
    echo "7. 📋 Generate project report"
    echo "0. Exit"
    echo
    read -p "Select option [0-7]: " choice
}

clean_build() {
    echo -e "${YELLOW}🧹 Cleaning build files...${NC}"
    rm -rf .next
    rm -rf out
    rm -rf dist
    rm -rf node_modules/.cache
    echo -e "${GREEN}✅ Build files cleaned${NC}"
}

update_dependencies() {
    echo -e "${YELLOW}📦 Updating dependencies...${NC}"
    npm update
    echo -e "${GREEN}✅ Dependencies updated${NC}"
    
    echo -e "${YELLOW}📋 Checking for outdated packages...${NC}"
    npm outdated
}

security_audit() {
    echo -e "${YELLOW}🔍 Running security audit...${NC}"
    npm audit
    
    echo -e "${YELLOW}🔧 Attempting to fix vulnerabilities...${NC}"
    npm audit fix
    
    echo -e "${GREEN}✅ Security audit completed${NC}"
}

project_stats() {
    echo -e "${BLUE}📊 Project Statistics${NC}"
    echo "===================="
    
    # Code lines
    echo -e "${YELLOW}📝 Code Statistics:${NC}"
    find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | xargs wc -l | tail -1
    
    # File counts
    echo -e "${YELLOW}📁 File Counts:${NC}"
    echo "TypeScript files: $(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l)"
    echo "JavaScript files: $(find . -name "*.js" -o -name "*.jsx" | grep -v node_modules | wc -l)"
    echo "CSS files: $(find . -name "*.css" | grep -v node_modules | wc -l)"
    
    # Dependencies
    echo -e "${YELLOW}📦 Dependencies:${NC}"
    echo "Production: $(jq '.dependencies | length' package.json)"
    echo "Development: $(jq '.devDependencies | length' package.json)"
    
    # Project size
    echo -e "${YELLOW}💽 Project Size:${NC}"
    du -sh . --exclude=node_modules 2>/dev/null || du -sk . | awk '{print $1/1024 " MB"}'
}

generate_report() {
    echo -e "${YELLOW}📋 Generating project report...${NC}"
    
    REPORT_FILE="project-report-$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# 📊 Project Report - $(date +"%Y-%m-%d %H:%M:%S")

## 📈 Overview
- **Project Name**: $(jq -r '.name' package.json)
- **Version**: $(jq -r '.version' package.json)
- **Description**: $(jq -r '.description' package.json)

## 🛠️ Technical Stack
- **Node.js**: $(node --version)
- **NPM**: $(npm --version)
- **Next.js**: $(jq -r '.dependencies.next' package.json)
- **React**: $(jq -r '.dependencies.react' package.json)
- **TypeScript**: $(jq -r '.devDependencies.typescript' package.json)

## 📊 Statistics
- **Total Lines of Code**: $(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | xargs wc -l | tail -1 | awk '{print $1}')
- **TypeScript Files**: $(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l)
- **Components**: $(find ./components -name "*.tsx" 2>/dev/null | wc -l)
- **Pages**: $(find ./app -name "page.tsx" 2>/dev/null | wc -l)

## 📦 Dependencies
- **Production Dependencies**: $(jq '.dependencies | length' package.json)
- **Development Dependencies**: $(jq '.devDependencies | length' package.json)

## 🗂️ Project Structure
\`\`\`
$(tree -I 'node_modules|.next|.git' -L 2 2>/dev/null || ls -la)
\`\`\`

## 🔍 Security Status
$(npm audit --audit-level moderate 2>/dev/null | grep -E "(found|vulnerabilities)" || echo "No known vulnerabilities")

## 📝 Recent Commits
\`\`\`
$(git log --oneline -5 2>/dev/null || echo "No git history found")
\`\`\`

## 🎯 Environment Status
- **NODE_ENV**: ${NODE_ENV:-"not set"}
- **Build Status**: $(npm run build >/dev/null 2>&1 && echo "✅ Success" || echo "❌ Failed")

---
*Report generated on $(date) by maintenance script*
EOF

    echo -e "${GREEN}✅ Report generated: $REPORT_FILE${NC}"
}

# Main script
while true; do
    show_menu
    
    case $choice in
        1)
            clean_build
            ;;
        2)
            update_dependencies
            ;;
        3)
            security_audit
            ;;
        4)
            project_stats
            ;;
        5)
            if [ -f "./scripts/backup.sh" ]; then
                ./scripts/backup.sh
            else
                echo -e "${RED}❌ Backup script not found${NC}"
            fi
            ;;
        6)
            if [ -f "./scripts/pre-deploy.sh" ]; then
                ./scripts/pre-deploy.sh
            else
                echo -e "${RED}❌ Pre-deploy script not found${NC}"
            fi
            ;;
        7)
            generate_report
            ;;
        0)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option${NC}"
            ;;
    esac
    
    echo
    read -p "Press Enter to continue..."
    echo
done
