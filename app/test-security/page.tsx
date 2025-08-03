'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'

export default function TestSecuritySystemPage() {
  const [results, setResults] = useState({
    connection: '',
    tables: '',
    codeGeneration: '',
    carCreation: '',
    auth: 'ยังไม่ได้ล็อกอิน'
  })
  
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ตรวจสอบสถานะการล็อกอิน
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        setResults(prev => ({ ...prev, auth: `✅ ล็อกอินอยู่: ${user.email}` }))
      }
    }
    checkUser()
  }, [])

  // 1. ทดสอบการเชื่อมต่อ Database
  const testConnection = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('joint_cars').select('count').limit(1)
      if (error) {
        setResults(prev => ({ ...prev, connection: `❌ เชื่อมต่อไม่สำเร็จ: ${error.message}` }))
      } else {
        setResults(prev => ({ ...prev, connection: '✅ เชื่อมต่อ Database สำเร็จ!' }))
      }
    } catch (err: any) {
      setResults(prev => ({ ...prev, connection: `❌ ข้อผิดพลาด: ${err.message}` }))
    }
    setIsLoading(false)
  }

  // 2. ตรวจสอบโครงสร้าง Database
  const checkTables = async () => {
    setIsLoading(true)
    try {
      // ตรวจสอบตาราง joint_cars
      const { data: carsData, error: carsError } = await supabase
        .from('joint_cars')
        .select('id, car_code')
        .limit(1)

      // ตรวจสอบตาราง car_members
      const { data: membersData, error: membersError } = await supabase
        .from('car_members')
        .select('id')
        .limit(1)

      let result = 'สถานะตาราง:\n'
      
      if (carsError) {
        result += `❌ joint_cars: ${carsError.message}\n`
      } else {
        result += '✅ joint_cars: พร้อมใช้งาน\n'
        // ตรวจสอบว่ามีฟิลด์ car_code หรือไม่
        if (carsData && carsData.length > 0) {
          if ('car_code' in carsData[0]) {
            result += '✅ ฟิลด์ car_code: มีอยู่ในระบบ\n'
          } else {
            result += '⚠️ ฟิลด์ car_code: ยังไม่มีในโครงสร้าง\n'
          }
        } else {
          result += '⚠️ ไม่มีข้อมูลในตาราง joint_cars\n'
        }
      }

      if (membersError) {
        result += `❌ car_members: ${membersError.message}\n`
      } else {
        result += '✅ car_members: พร้อมใช้งาน\n'
      }

      setResults(prev => ({ ...prev, tables: result }))
    } catch (err: any) {
      setResults(prev => ({ ...prev, tables: `❌ ข้อผิดพลาด: ${err.message}` }))
    }
    setIsLoading(false)
  }

  // 3. ทดสอบการสร้างรหัสปลอดภัย
  const testCodeGeneration = async () => {
    setIsLoading(true)
    try {
      // ทดสอบเรียกฟังก์ชั่น generate_car_code
      const { data, error } = await supabase.rpc('generate_car_code')
      
      if (error) {
        const jsCode = Math.floor(100000 + Math.random() * 900000).toString()
        setResults(prev => ({ 
          ...prev, 
          codeGeneration: `❌ ฟังก์ชั่น generate_car_code ยังไม่พร้อม: ${error.message}\n🔧 รหัสที่สร้างด้วย JS: ${jsCode}\n💡 ต้องรันไฟล์ database/quick_fix_security_code_clean.sql ก่อน` 
        }))
      } else {
        setResults(prev => ({ 
          ...prev, 
          codeGeneration: `✅ สร้างรหัสสำเร็จ: ${data}` 
        }))
      }
    } catch (err) {
      const jsCode = Math.floor(100000 + Math.random() * 900000).toString()
      setResults(prev => ({ 
        ...prev, 
        codeGeneration: `⚠️ ฟังก์ชั่น generate_car_code ยังไม่พร้อม\n🔧 รหัสที่สร้างด้วย JS: ${jsCode}` 
      }))
    }
    setIsLoading(false)
  }

  // 4. ล็อกอิน
  const login = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword123'
      })

      if (error) {
        setResults(prev => ({ ...prev, auth: `❌ เข้าสู่ระบบไม่สำเร็จ: ${error.message}` }))
      } else {
        setUser(data.user)
        setResults(prev => ({ ...prev, auth: `✅ เข้าสู่ระบบสำเร็จ: ${data.user.email}` }))
      }
    } catch (err: any) {
      setResults(prev => ({ ...prev, auth: `❌ ข้อผิดพลาด: ${err.message}` }))
    }
    setIsLoading(false)
  }

  // 5. ทดสอบสร้างรถใหม่
  const testCreateCar = async () => {
    if (!user) {
      setResults(prev => ({ ...prev, carCreation: '❌ กรุณาเข้าสู่ระบบก่อน' }))
      return
    }

    setIsLoading(true)
    try {
      // สร้างรหัสปลอดภัย
      const securityCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      const carData = {
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        brand: 'Toyota',
        model: 'Vios',
        year: 2020,
        buy_price: 400000,
        sell_price: 0,
        status: 'กำลังหา',
        car_code: securityCode
      }

      console.log('🚀 Attempting to create car with data:', carData)

      const { data, error } = await supabase
        .from('joint_cars')
        .insert(carData)
        .select()
        .single()

      if (error) {
        console.error('❌ Car creation error:', error)
        setResults(prev => ({ 
          ...prev, 
          carCreation: `❌ สร้างรถไม่สำเร็จ: ${error.message}\n💡 ${error.hint || ''}` 
        }))
      } else {
        console.log('✅ Car created successfully:', data)
        
        let result = `✅ สร้างรถสำเร็จ!\n🆔 ID: ${data.id}\n🔐 รหัสปลอดภัย: ${data.car_code || securityCode}\n🚗 รถ: Toyota Vios 2020`
        
        // ลองเพิ่มเป็นสมาชิก
        try {
          const { error: memberError } = await supabase.from('car_members').insert({
            car_id: data.id,
            user_id: user.id,
            user_email: user.email,
            user_name: user.user_metadata?.name || user.email,
            role: 'owner'
          })
          
          if (!memberError) {
            result += '\n✅ เพิ่มเป็นสมาชิกสำเร็จ'
          }
        } catch (memberError) {
          result += '\n⚠️ ไม่สามารถเพิ่มสมาชิกได้'
        }
        
        setResults(prev => ({ ...prev, carCreation: result }))
      }
    } catch (err: any) {
      console.error('❌ Unexpected error:', err)
      setResults(prev => ({ ...prev, carCreation: `❌ ข้อผิดพลาดไม่คาดคิด: ${err.message}` }))
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-orange-600">
          🔐 ทดสอบระบบรหัสปลอดภัย
        </h1>

        {isLoading && (
          <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-lg text-center">
            ⏳ กำลังประมวลผล...
          </div>
        )}

        {/* 1. ทดสอบการเชื่อมต่อ */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">1. ทดสอบการเชื่อมต่อ Database</h3>
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg mr-2"
          >
            ทดสอบการเชื่อมต่อ
          </button>
          {results.connection && (
            <div className="mt-2 p-3 bg-gray-100 rounded-lg whitespace-pre-line">
              {results.connection}
            </div>
          )}
        </div>

        {/* 2. ตรวจสอบโครงสร้าง Database */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">2. ตรวจสอบโครงสร้าง Database</h3>
          <button
            onClick={checkTables}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg mr-2"
          >
            ตรวจสอบตาราง
          </button>
          {results.tables && (
            <div className="mt-2 p-3 bg-gray-100 rounded-lg whitespace-pre-line">
              {results.tables}
            </div>
          )}
        </div>

        {/* 3. ทดสอบการสร้างรหัส */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">3. ทดสอบการสร้างรหัสปลอดภัย</h3>
          <button
            onClick={testCodeGeneration}
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg mr-2"
          >
            ทดสอบสร้างรหัส
          </button>
          {results.codeGeneration && (
            <div className="mt-2 p-3 bg-gray-100 rounded-lg whitespace-pre-line">
              {results.codeGeneration}
            </div>
          )}
        </div>

        {/* 4. การล็อกอิน */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">4. การล็อกอิน</h3>
          <button
            onClick={login}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg mr-2"
          >
            เข้าสู่ระบบ (test@example.com)
          </button>
          <div className="mt-2 p-3 bg-gray-100 rounded-lg">
            {results.auth}
          </div>
        </div>

        {/* 5. ทดสอบสร้างรถ */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">5. ทดสอบสร้างรถใหม่</h3>
          <button
            onClick={testCreateCar}
            disabled={isLoading || !user}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg mr-2"
          >
            สร้างรถทดสอบ (Toyota Vios 2020)
          </button>
          {results.carCreation && (
            <div className="mt-2 p-3 bg-gray-100 rounded-lg whitespace-pre-line">
              {results.carCreation}
            </div>
          )}
        </div>

        {/* สรุปผล */}
        <div className="mt-8 p-4 bg-orange-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-orange-700">📋 คำแนะนำ</h3>
          <ul className="text-sm text-orange-600 space-y-1">
            <li>• ถ้าฟิลด์ car_code ยังไม่มี ต้องรันไฟล์ SQL ใน Supabase</li>
            <li>• ถ้าฟังก์ชั่น generate_car_code ยังไม่พร้อม ต้องรันไฟล์ database/quick_fix_security_code_clean.sql</li>
            <li>• ถ้าสร้างรถได้แต่ไม่แสดงรหัสใน Frontend ปัญหาอยู่ที่หน้า secure-cars/new</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
