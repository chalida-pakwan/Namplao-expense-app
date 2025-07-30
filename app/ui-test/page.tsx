'use client'

import { useState } from 'react'
import { Plus, BarChart3, History, Car, Users, TrendingUp } from 'lucide-react'
import AddExpenseModal from '../../components/modals/AddExpenseModal'
import ChartModal from '../../components/modals/ChartModal'
import EditLogModal from '../../components/modals/EditLogModal'

export default function UITestPage() {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [showChartModal, setShowChartModal] = useState(false)
  const [showEditLogModal, setShowEditLogModal] = useState(false)

  // Mock car data for testing
  const mockCar = {
    id: 'test-car-123',
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    buy_price: 800000,
    sell_price: 950000,
    target_profit: 150000,
    profit: 150000,
    total_investment: 800000,
    status: 'ขายแล้ว',
    created_by: 'user-123',
    investors: [
      { name: 'สมชาย ใจดี', email: 'somchai@example.com', amount: 400000, share_percentage: 50 },
      { name: 'สมหญิง รักษ์ดี', email: 'somying@example.com', amount: 250000, share_percentage: 31.25 },
      { name: 'สมศักดิ์ มั่นใจ', email: 'somsak@example.com', amount: 150000, share_percentage: 18.75 },
    ],
    additional_expenses: [
      { description: 'ซ่อมเครื่องยนต์', amount: 25000, date: '2024-01-15' },
      { description: 'ประกันภัย', amount: 15000, date: '2024-01-20' },
      { description: 'ค่าจดทะเบียน', amount: 5000, date: '2024-01-25' },
    ],
    images: []
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH').format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">UI Test Page</h1>
                <p className="text-gray-600">ทดสอบปุ่มและ Modal ใหม่</p>
              </div>
            </div>
          </div>

          {/* Action Buttons Demo */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🎨 ปุ่มใหม่ที่เพิ่มเข้ามา</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Add Expense Button */}
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-orange-200 hover:border-orange-400 transition-colors">
                <h3 className="font-medium text-gray-800 mb-2">💰 เพิ่มค่าใช้จ่าย</h3>
                <p className="text-sm text-gray-600 mb-4">เพิ่มรายการค่าใช้จ่ายใหม่ พร้อมหมวดหมู่และวันที่</p>
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="w-full bg-orange-300 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มค่าใช้จ่าย</span>
                </button>
              </div>

              {/* Chart Button */}
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-orange-200 hover:border-orange-400 transition-colors">
                <h3 className="font-medium text-gray-800 mb-2">📊 กราฟกำไร</h3>
                <p className="text-sm text-gray-600 mb-4">ดูกราฟเส้น, แท่ง, และวงกลม แสดงข้อมูลการเงิน</p>
                <button
                  onClick={() => setShowChartModal(true)}
                  className="w-full bg-white text-orange-500 border border-orange-300 hover:bg-orange-100 font-semibold py-2 px-4 rounded flex items-center justify-center space-x-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>ดูกราฟ</span>
                </button>
              </div>

              {/* Edit Log Button */}
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-orange-200 hover:border-orange-400 transition-colors">
                <h3 className="font-medium text-gray-800 mb-2">🕵️‍♀️ ประวัติการแก้ไข</h3>
                <p className="text-sm text-gray-600 mb-4">ดูประวัติการเปลี่ยนแปลงทั้งหมด</p>
                <button
                  onClick={() => setShowEditLogModal(true)}
                  className="w-full bg-white text-orange-500 border border-orange-300 hover:bg-orange-100 font-semibold py-2 px-4 rounded flex items-center justify-center space-x-2"
                >
                  <History className="w-4 h-4" />
                  <span>ดูประวัติ</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mock Car Data Display */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🚗 ข้อมูลรถทดสอบ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Car className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">รถยนต์</span>
                </div>
                <div className="text-lg font-semibold">{mockCar.brand} {mockCar.model}</div>
                <div className="text-sm text-gray-500">ปี {mockCar.year}</div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">ราคาขาย</span>
                </div>
                <div className="text-lg font-semibold text-green-600">{formatCurrency(mockCar.sell_price)}</div>
                <div className="text-sm text-gray-500">บาท</div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">ผู้ลงทุน</span>
                </div>
                <div className="text-lg font-semibold">{mockCar.investors.length} คน</div>
                <div className="text-sm text-gray-500">ร่วมลงทุน</div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-600">กำไร</span>
                </div>
                <div className="text-lg font-semibold text-orange-600">{formatCurrency(mockCar.profit)}</div>
                <div className="text-sm text-gray-500">บาท</div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">📝 วิธีทดสอบ</h3>
            <ul className="space-y-2 text-blue-700">
              <li>• คลิกปุ่ม "เพิ่มค่าใช้จ่าย" เพื่อเปิด Modal เพิ่มค่าใช้จ่าย</li>
              <li>• คลิกปุ่ม "ดูกราฟ" เพื่อดูกราฟแสดงข้อมูลการเงิน</li>
              <li>• คลิกปุ่ม "ดูประวัติ" เพื่อดูประวัติการแก้ไข (Mock data)</li>
              <li>• ทดสอบการทำงานของ Modal ทั้ง 3 แบบ</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        carId={mockCar.id}
        onExpenseAdded={() => {
          console.log('Expense added!')
          setShowAddExpenseModal(false)
        }}
      />

      <ChartModal
        isOpen={showChartModal}
        onClose={() => setShowChartModal(false)}
        car={mockCar}
      />

      <EditLogModal
        isOpen={showEditLogModal}
        onClose={() => setShowEditLogModal(false)}
        carId={mockCar.id}
      />
    </div>
  )
}
