'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

export default function QuickTestPage() {
  const router = useRouter()
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const quickTest = async () => {
    setIsLoading(true)
    setResult('กำลังทดสอบ...')

    try {
      // 1. ทดสอบการเชื่อมต่อ
      setResult('1. ทดสอบการเชื่อมต่อ...')
      const { data: connectionTest, error: connectionError } = await supabase
        .from('joint_cars')
        .select('count')
        .limit(1)

      if (connectionError) {
        setResult(`❌ การเชื่อมต่อล้มเหลว: ${connectionError.message}`)
        setIsLoading(false)
        return
      }

      // 2. ล็อกอิน
      setResult('2. กำลังล็อกอิน...')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      })

      if (authError) {
        setResult(`❌ ล็อกอินล้มเหลว: ${authError.message}`)
        setIsLoading(false)
        return
      }

      // 3. ทดสอบสร้างรถ
      setResult('3. กำลังสร้างรถทดสอบ...')
      const securityCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      const carData = {
        user_id: authData.user.id,
        date: new Date().toISOString().split('T')[0],
        brand: 'Toyota', 
        model: 'Vios',
        year: 2020,
        buy_price: 400000,
        sell_price: 0,
        status: 'กำลังหา',
        car_code: securityCode
      }

      const { data: carResult, error: carError } = await supabase
        .from('joint_cars')
        .insert(carData)
        .select()
        .single()

      if (carError) {
        // ถ้า car_code ไม่มี ลองสร้างโดยไม่ใส่ car_code
        if (carError.message.includes('car_code')) {
          setResult('4. ลองสร้างรถโดยไม่ใส่ car_code...')
          const { car_code, ...carDataWithoutCode } = carData
          
          const { data: carResult2, error: carError2 } = await supabase
            .from('joint_cars')
            .insert(carDataWithoutCode)
            .select()
            .single()

          if (carError2) {
            setResult(`❌ สร้างรถล้มเหลว: ${carError2.message}`)
          } else {
            setResult(`✅ สร้างรถสำเร็จ! (ไม่มี car_code)\n🆔 ID: ${carResult2.id}\n⚠️ ฟิลด์ car_code ยังไม่มีใน database`)
            
            toast.success('สร้างรถสำเร็จ! แต่ยังไม่มีรหัสปลอดภัย', {
              duration: 5000,
              style: {
                background: '#f59e0b',
                color: 'white',
                fontSize: '16px'
              }
            })
          }
        } else {
          setResult(`❌ สร้างรถล้มเหลว: ${carError.message}`)
        }
      } else {
        setResult(`✅ สร้างรถสำเร็จ!\n🆔 ID: ${carResult.id}\n🔐 รหัสปลอดภัย: ${carResult.car_code || securityCode}\n🚗 รถ: Toyota Vios 2020`)
        
        // แสดง Alert และ Toast
        alert(`✅ สร้างรถสำเร็จ!\n🔐 รหัสปลอดภัย: ${carResult.car_code || securityCode}`)
        
        toast.success(`รหัสปลอดภัย: ${carResult.car_code || securityCode}`, {
          duration: 10000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold'
          }
        })
      }

    } catch (error: any) {
      setResult(`❌ เกิดข้อผิดพลาด: ${error.message}`)
    }

    setIsLoading(false)
  }

  const runSQLFix = () => {
    setResult(`
📋 คำแนะนำการแก้ไข:

1. เปิด Supabase Dashboard
2. ไปที่ SQL Editor
3. รันคำสั่งนี้:

ALTER TABLE joint_cars ADD COLUMN IF NOT EXISTS car_code VARCHAR(6);
CREATE UNIQUE INDEX IF NOT EXISTS idx_joint_cars_car_code_unique 
ON joint_cars(car_code) WHERE car_code IS NOT NULL;

CREATE OR REPLACE FUNCTION generate_car_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        SELECT EXISTS(SELECT 1 FROM joint_cars WHERE car_code = code) INTO exists_check;
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN code;
END;
$$;

4. จากนั้นทดสอบอีกครั้ง
    `)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
          🚀 ทดสอบระบบรหัสปลอดภัยแบบด่วน
        </h1>

        <div className="space-y-4">
          <button
            onClick={quickTest}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors"
          >
            {isLoading ? '⏳ กำลังทดสอบ...' : '🔥 เริ่มทดสอบระบบ'}
          </button>

          <button
            onClick={runSQLFix}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            📋 แสดงคำแนะนำการแก้ไข SQL
          </button>

          <button
            onClick={() => router.push('/secure-cars/new')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            🚗 ไปหน้าสร้างรถ
          </button>
        </div>

        {result && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-gray-800 mb-3">📊 ผลการทดสอบ:</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 วิธีการทดสอบ:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>1. กดปุ่ม "เริ่มทดสอบระบบ" เพื่อทดสอบทุกอย่าง</li>
            <li>2. ดูผลลัพธ์ว่าระบบทำงานหรือมีข้อผิดพลาด</li>
            <li>3. ถ้ามีปัญหา กดปุ่ม "แสดงคำแนะนำการแก้ไข SQL"</li>
            <li>4. รันคำสั่ง SQL ใน Supabase แล้วทดสอบใหม่</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
