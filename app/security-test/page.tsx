'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SecurityTestIndexPage() {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            🔐 ระบบทดสอบรหัสปลอดภัย
          </h1>
          <p className="text-gray-600 text-lg">ทดสอบการสร้างและแสดงรหัสปลอดภัย 6 หลัก</p>
        </div>

        {/* ลิงก์หลักสำหรับทดสอบ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Link 
            href="/secure-cars/new"
            className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🚗</div>
              <h3 className="text-xl font-bold mb-2">สร้างรถใหม่</h3>
              <p className="text-blue-100 text-sm">หน้าหลักสำหรับทดสอบระบบ</p>
            </div>
          </Link>

          <Link 
            href="/quick-test"
            className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🧪</div>
              <h3 className="text-xl font-bold mb-2">ทดสอบอัตโนมัติ</h3>
              <p className="text-green-100 text-sm">ทดสอบระบบแบบครบวงจร</p>
            </div>
          </Link>

          <Link 
            href="/auth"
            className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🔑</div>
              <h3 className="text-xl font-bold mb-2">เข้าสู่ระบบ</h3>
              <p className="text-orange-100 text-sm">ล็อกอินเพื่อทดสอบ</p>
            </div>
          </Link>
        </div>

        {/* ปุ่มแสดงรายละเอียด */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {showDetails ? '🔼 ซ่อนรายละเอียด' : '🔽 แสดงลิงก์ทั้งหมด'}
          </button>
        </div>

        {showDetails && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">📋 ลิงก์ทดสอบทั้งหมด</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">💻 บนคอมพิวเตอร์ (localhost):</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-white rounded border">
                    <a href="http://localhost:3000/secure-cars/new" target="_blank" className="text-blue-600 hover:underline">
                      http://localhost:3000/secure-cars/new
                    </a>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <a href="http://localhost:3000/quick-test" target="_blank" className="text-green-600 hover:underline">
                      http://localhost:3000/quick-test
                    </a>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <a href="http://localhost:3000/auth" target="_blank" className="text-orange-600 hover:underline">
                      http://localhost:3000/auth
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3">📱 บนมือถือ (network):</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-white rounded border">
                    <a href="http://192.168.1.131:3000/secure-cars/new" target="_blank" className="text-blue-600 hover:underline">
                      http://192.168.1.131:3000/secure-cars/new
                    </a>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <a href="http://192.168.1.131:3000/quick-test" target="_blank" className="text-green-600 hover:underline">
                      http://192.168.1.131:3000/quick-test
                    </a>
                  </div>
                  <div className="p-2 bg-white rounded border">
                    <a href="http://192.168.1.131:3000/auth" target="_blank" className="text-orange-600 hover:underline">
                      http://192.168.1.131:3000/auth
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* คำแนะนำการทดสอบ */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-blue-800 mb-4">🎯 วิธีทดสอบระบบรหัสปลอดภัย</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <p className="text-blue-800 font-semibold">กดปุ่ม "สร้างรถใหม่"</p>
                <p className="text-blue-600 text-sm">เพื่อไปยังหน้าสร้างรถที่มีระบบรหัสปลอดภัย</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <p className="text-blue-800 font-semibold">กรอกข้อมูลรถ</p>
                <p className="text-blue-600 text-sm">ยี่ห้อ: Toyota, รุ่น: Vios, ปี: 2020, ราคาซื้อ: 400,000</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <p className="text-blue-800 font-semibold">กดปุ่ม "สร้างรถ"</p>
                <p className="text-blue-600 text-sm">และดูว่ามี <strong>Alert popup</strong> และ <strong>Toast notification</strong> แสดงรหัส 6 หลักหรือไม่</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">!</div>
              <div>
                <p className="text-yellow-800 font-semibold">หากไม่มีรหัสขึ้น</p>
                <p className="text-yellow-600 text-sm">แสดงว่าต้องรัน SQL script ใน Supabase Database ก่อน (ติดต่อ developer)</p>
              </div>
            </div>
          </div>
        </div>

        {/* สถานะระบบ */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="font-semibold text-green-800">เซิร์ฟเวอร์</div>
            <div className="text-green-600 text-sm">พร้อมใช้งาน</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="font-semibold text-green-800">โค้ดสร้างรหัส</div>
            <div className="text-green-600 text-sm">พร้อมใช้งาน</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <div className="text-2xl mb-2">✅</div>
            <div className="font-semibold text-green-800">Alert/Toast</div>
            <div className="text-green-600 text-sm">พร้อมใช้งาน</div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
            <div className="text-2xl mb-2">⚠️</div>
            <div className="font-semibold text-yellow-800">Database</div>
            <div className="text-yellow-600 text-sm">ต้องตรวจสอบ</div>
          </div>
        </div>
      </div>
    </div>
  )
}
