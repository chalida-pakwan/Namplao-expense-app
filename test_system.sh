#!/bin/bash

# สคริปต์ทดสอบระบบรหัสปลอดภัย

echo "🔍 กำลังตรวจสอบระบบรหัสปลอดภัย..."
echo ""

# ตรวจสอบว่าเซิร์ฟเวอร์ทำงานหรือไม่
echo "1. ตรวจสอบเซิร์ฟเวอร์..."
if curl -s http://localhost:3000/ > /dev/null; then
    echo "✅ เซิร์ฟเวอร์ทำงานปกติ"
else
    echo "❌ เซิร์ฟเวอร์ไม่ทำงาน"
    exit 1
fi

echo ""
echo "2. ตรวจสอบหน้าสร้างรถ..."
if curl -s http://localhost:3000/secure-cars/new | grep -q "brand\|model"; then
    echo "✅ หน้าสร้างรถโหลดได้"
else
    echo "❌ หน้าสร้างรถมีปัญหา"
fi

echo ""
echo "3. ตรวจสอบการคอมไพล์..."
if [ -d ".next" ]; then
    echo "✅ โฟลเดอร์ .next มีอยู่"
else
    echo "❌ ไม่พบโฟลเดอร์ .next"
fi

echo ""
echo "📋 สรุปผล:"
echo "- เซิร์ฟเวอร์: http://localhost:3000/"
echo "- หน้าทดสอบ: http://localhost:3000/quick-test"
echo "- หน้าสร้างรถ: http://localhost:3000/secure-cars/new"
echo ""
echo "💡 ถ้าเข้าเว็บไซต์ไม่ได้ ให้ลองใช้:"
echo "   - ⌘ + Shift + R (รีเฟรชแบบ hard reload)"
echo "   - เปิด Incognito/Private Mode"
echo "   - ลองใช้ browser อื่น"
