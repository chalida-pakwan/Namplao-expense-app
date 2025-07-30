#!/bin/bash

# 🔄 Restore Script สำหรับระบบหารรถแบบปลอดภัย
# วันที่สร้าง: 30 กรกฎาคม 2568

echo "🔄 เริ่มกระบวนการ Restore ระบบหารรถแบบปลอดภัย..."

# ตรวจสอบว่ามีไฟล์ backup หรือไม่
if [ ! -d "backup" ]; then
    echo "❌ ไม่พบโฟลเดอร์ backup!"
    exit 1
fi

echo "📁 พบโฟลเดอร์ backup แล้ว"

# สร้างโฟลเดอร์เป้าหมายหากไม่มี
mkdir -p components app/secure-cars app/joint-cars app/dashboard sql

echo "📋 กำลัง restore ไฟล์..."

# Restore Components
echo "  📦 Restore components..."
cp backup/components/* components/ 2>/dev/null
if [ $? -eq 0 ]; then
    echo "  ✅ Components restored successfully"
else
    echo "  ⚠️  No components to restore or error occurred"
fi

# Restore Secure Cars Pages
echo "  🔐 Restore secure cars pages..."
cp -r backup/app/secure-cars/* app/secure-cars/ 2>/dev/null
if [ $? -eq 0 ]; then
    echo "  ✅ Secure cars pages restored successfully"
else
    echo "  ⚠️  No secure cars pages to restore or error occurred"
fi

# Restore Joint Cars Pages  
echo "  🚗 Restore joint cars pages..."
cp -r backup/app/joint-cars/* app/joint-cars/ 2>/dev/null
if [ $? -eq 0 ]; then
    echo "  ✅ Joint cars pages restored successfully"
else
    echo "  ⚠️  No joint cars pages to restore or error occurred"
fi

# Restore Dashboard
echo "  📊 Restore dashboard..."
cp backup/app/dashboard/* app/dashboard/ 2>/dev/null
if [ $? -eq 0 ]; then
    echo "  ✅ Dashboard restored successfully"
else  
    echo "  ⚠️  No dashboard files to restore or error occurred"
fi

# Restore SQL Scripts
echo "  🗄️  Restore SQL scripts..."
cp backup/sql/* sql/ 2>/dev/null
if [ $? -eq 0 ]; then
    echo "  ✅ SQL scripts restored successfully"
else
    echo "  ⚠️  No SQL scripts to restore or error occurred"
fi

echo ""
echo "🎉 Restore เสร็จสิ้น!"
echo ""
echo "📋 ขั้นตอนถัดไป:"
echo "  1. รัน SQL scripts ใน Supabase SQL Editor (หากจำเป็น):"
echo "     - sql/secure-car-system.sql"
echo "     - sql/secure-car-code-protection.sql"
echo "  2. Restart development server: npm run dev"
echo "  3. ทดสอบระบบหารรถแบบปลอดภัย"
echo ""
echo "💡 หมายเหตุ: ระบบจะกลับไปสู่สถานะที่เซฟไว้ในวันที่ 30 กรกฎาคม 2568"
