#!/bin/bash

# 🔧 Database Backup Script
# สำหรับสำรองข้อมูลจาก Supabase

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🗄️  Starting Database Backup..."

# Check if required environment variables are set
if [ -z "$SUPABASE_PROJECT_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${RED}❌ Error: Please set SUPABASE_PROJECT_URL and SUPABASE_SERVICE_KEY environment variables${NC}"
    exit 1
fi

# Create backup directory
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📂 Backup directory: $BACKUP_DIR${NC}"

# Tables to backup
TABLES=("income_expense" "joint_cars" "car_investors" "additional_expenses" "post_sale_expenses")

# Function to backup a table
backup_table() {
    local table_name=$1
    echo -e "${YELLOW}📋 Backing up table: $table_name${NC}"
    
    curl -s "$SUPABASE_PROJECT_URL/rest/v1/$table_name?select=*" \
        -H "apikey: $SUPABASE_SERVICE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
        -H "Content-Type: application/json" \
        > "$BACKUP_DIR/${table_name}.json"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully backed up $table_name${NC}"
    else
        echo -e "${RED}❌ Failed to backup $table_name${NC}"
    fi
}

# Backup all tables
for table in "${TABLES[@]}"; do
    backup_table "$table"
done

# Create backup metadata
cat > "$BACKUP_DIR/metadata.json" << EOF
{
    "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "tables": $(printf '%s\n' "${TABLES[@]}" | jq -R . | jq -s .),
    "version": "1.0.0",
    "type": "supabase_backup"
}
EOF

# Compress backup
tar -czf "$BACKUP_DIR.tar.gz" -C "backups" "$(basename "$BACKUP_DIR")"
rm -rf "$BACKUP_DIR"

echo -e "${GREEN}🎉 Backup completed: $BACKUP_DIR.tar.gz${NC}"

# Optional: Upload to cloud storage
# aws s3 cp "$BACKUP_DIR.tar.gz" s3://your-backup-bucket/
# gsutil cp "$BACKUP_DIR.tar.gz" gs://your-backup-bucket/

echo -e "${GREEN}✨ Database backup finished successfully!${NC}"
