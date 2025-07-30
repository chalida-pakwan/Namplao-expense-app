#!/bin/bash

# 🚀 Deploy Secure Car System to Supabase
# วันที่: 31 กรกฎาคม 2568

echo "🔐 เริ่มการติดตั้งระบบหารรถแบบปลอดภัย..."
echo ""

# ตรวจสอบว่ามี Supabase CLI หรือไม่
if ! command -v supabase &> /dev/null; then
    echo "❌ ไม่พบ Supabase CLI"
    echo "📦 กรุณาติดตั้ง Supabase CLI ก่อน:"
    echo "    npm install -g supabase"
    echo "    หรือ"
    echo "    brew install supabase/tap/supabase"
    echo ""
    echo "🌐 หรือคัดลอกโค้ดจากไฟล์ sql/complete-secure-car-setup.sql"
    echo "    ไปรันใน Supabase Dashboard > SQL Editor"
    exit 1
fi

# ตรวจสอบว่า login แล้วหรือยัง
if ! supabase status &> /dev/null; then
    echo "🔑 กรุณา login Supabase ก่อน:"
    echo "    supabase login"
    exit 1
fi

echo "✅ Supabase CLI พร้อมใช้งาน"
echo ""

# รันคำสั่ง SQL
echo "📊 กำลังรัน SQL Script..."
echo "   ไฟล์: sql/complete-secure-car-setup.sql"
echo ""

# เช็คว่าไฟล์มีอยู่หรือไม่
if [ ! -f "sql/complete-secure-car-setup.sql" ]; then
    echo "❌ ไม่พบไฟล์ sql/complete-secure-car-setup.sql"
    exit 1
fi

# รัน SQL script
supabase db reset --linked
if [ $? -eq 0 ]; then
    echo "✅ Reset database สำเร็จ"
else
    echo "⚠️  ไม่สามารถ reset database ได้ (อาจไม่จำเป็น)"
fi

# Apply migrations
echo "📋 กำลังรัน SQL Script..."
cat sql/complete-secure-car-setup.sql | supabase db exec --linked

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ติดตั้งระบบหารรถแบบปลอดภัยสำเร็จ!"
    echo ""
    echo "📋 สิ่งที่ได้ติดตั้ง:"
    echo "   ✅ ตาราง: joint_cars (พร้อม car_code)"
    echo "   ✅ ตาราง: car_members (สมาชิกรถ)"
    echo "   ✅ ตาราง: car_expenses (รายจ่ายรถ)"
    echo "   ✅ ฟังก์ชั่น: generate_car_code()"
    echo "   ✅ ฟังก์ชั่น: join_car_with_code()"
    echo "   ✅ ฟังก์ชั่น: get_car_with_code()"
    echo "   ✅ View: joint_cars_member_view"
    echo "   ✅ RLS Policies: ความปลอดภัยครบถ้วน"
    echo "   ✅ Triggers: สร้างรหัสรรอัตโนมัติ"
    echo ""
    echo "🔐 ระบบพร้อมใช้งาน!"
    echo "   👑 เฉพาะเจ้าของเท่านั้นที่เห็นและแชร์รหัสได้"
    echo "   👤 สมาชิกเข้าร่วมได้แต่ไม่เห็นรหัส"
    echo ""
    echo "🚀 เริ่มใช้งาน: npm run dev"
else
    echo ""
    echo "❌ เกิดข้อผิดพลาดในการติดตั้ง"
    echo ""
    echo "🛠️  วิธีแก้ไข:"
    echo "   1. ตรวจสอบการเชื่อมต่อ Supabase"
    echo "   2. คัดลอกโค้ดจาก sql/complete-secure-car-setup.sql"
    echo "   3. ไปรันใน Supabase Dashboard > SQL Editor"
    exit 1
fi
