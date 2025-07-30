'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'

interface Investor {
  name: string
  amount: string
}

interface Expense {
  description: string
  cost: string
}

interface CarData {
  date: string
  brand: string
  model: string
  year: string
  sellPrice: string
  buyPrice: string
  status: string
  investors: Investor[]
  expenses: Expense[]
  images: string[]
  notes: string
}

export default function NewJointCar() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const [carData, setCarData] = useState<CarData>({
    date: new Date().toISOString().split('T')[0],
    brand: '',
    model: '',
    year: '',
    sellPrice: '',
    buyPrice: '',
    status: 'กำลังหา',
    investors: [
      { name: '', amount: '' }
    ],
    expenses: [
      { description: 'ค่าซ่อม', cost: '' },
      { description: 'ค่าส่ง', cost: '' },
      { description: 'ค่านายหน้า', cost: '' }
    ],
    images: [],
    notes: ''
  })

  const handleChange = (field: keyof CarData, value: string) => {
    setCarData({ ...carData, [field]: value })
  }

  const handleInvestorChange = (index: number, field: keyof Investor, value: string) => {
    const updated = [...carData.investors]
    updated[index][field] = value
    setCarData({ ...carData, investors: updated })
  }

  const handleExpenseChange = (index: number, field: keyof Expense, value: string) => {
    const updated = [...carData.expenses]
    updated[index][field] = value
    setCarData({ ...carData, expenses: updated })
  }

  const addInvestor = () => {
    setCarData({ 
      ...carData, 
      investors: [...carData.investors, { name: '', amount: '' }] 
    })
  }

  const removeInvestor = (index: number) => {
    if (carData.investors.length > 1) {
      const updated = carData.investors.filter((_, i) => i !== index)
      setCarData({ ...carData, investors: updated })
    }
  }

  const addExpense = () => {
    setCarData({ 
      ...carData, 
      expenses: [...carData.expenses, { description: '', cost: '' }] 
    })
  }

  const removeExpense = (index: number) => {
    const updated = carData.expenses.filter((_, i) => i !== index)
    setCarData({ ...carData, expenses: updated })
  }

  // คำนวณต้นทุนรวม
  const calculateTotalCost = () => {
    const buyPrice = parseFloat(carData.buyPrice) || 0
    const totalExpenses = carData.expenses.reduce((sum, exp) => 
      sum + (parseFloat(exp.cost) || 0), 0
    )
    return buyPrice + totalExpenses
  }

  // คำนวณกำไร
  const calculateProfit = () => {
    const sellPrice = parseFloat(carData.sellPrice) || 0
    const totalCost = calculateTotalCost()
    return sellPrice - totalCost
  }

  // คำนวณเงินลงทุนรวม
  const calculateTotalInvestment = () => {
    return carData.investors.reduce((sum, inv) => 
      sum + (parseFloat(inv.amount) || 0), 0
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // ตรวจสอบ user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage('กรุณาเข้าสู่ระบบ')
        setIsLoading(false)
        return
      }

      // เตรียมข้อมูลสำหรับบันทึก
      const totalCost = calculateTotalCost()
      const profit = calculateProfit()
      const totalInvestment = calculateTotalInvestment()

      const jointCarData = {
        user_id: user.id,
        date: carData.date,
        brand: carData.brand,
        model: carData.model,
        year: parseInt(carData.year) || null,
        buy_price: parseFloat(carData.buyPrice) || 0,
        sell_price: parseFloat(carData.sellPrice) || 0,
        total_cost: totalCost,
        profit: profit,
        total_investment: totalInvestment,
        status: carData.status,
        notes: carData.notes,
        investors: carData.investors.filter(inv => inv.name && inv.amount),
        expenses: carData.expenses.filter(exp => exp.description && exp.cost),
        created_at: new Date().toISOString()
      }

      // บันทึกลง Supabase
      const { error } = await supabase
        .from('joint_cars')
        .insert([jointCarData])

      if (error) {
        console.error('Error:', error)
        setMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      } else {
        setMessage('บันทึกข้อมูลสำเร็จ!')
        setTimeout(() => router.push('/joint-cars'), 1500)
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('เกิดข้อผิดพลาด')
    }

    setIsLoading(false)
  }

  return (
    <div className="p-4 pb-20 bg-pastel-cream min-h-screen font-prompt">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-orange-800 mb-2">🚗 เพิ่มข้อมูลรถร่วมลงทุน</h1>
          <p className="text-orange-700">บันทึกข้อมูลการลงทุนซื้อรถร่วมกัน</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ข้อมูลรถ */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 ข้อมูลรถ</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่</label>
                <input
                  type="date"
                  value={carData.date}
                  onChange={e => handleChange('date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                <select
                  value={carData.status}
                  onChange={e => handleChange('status', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="กำลังหา">🔍 กำลังหา</option>
                  <option value="ซื้อแล้ว">✅ ซื้อแล้ว</option>
                  <option value="ขายแล้ว">💰 ขายแล้ว</option>
                  <option value="ยกเลิก">❌ ยกเลิก</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ</label>
                <input
                  type="text"
                  placeholder="Toyota, Honda, Mazda..."
                  value={carData.brand}
                  onChange={e => handleChange('brand', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รุ่น</label>
                <input
                  type="text"
                  placeholder="Vios, City, Mazda2..."
                  value={carData.model}
                  onChange={e => handleChange('model', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ปี</label>
                <input
                  type="number"
                  placeholder="2020"
                  value={carData.year}
                  onChange={e => handleChange('year', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="1990"
                  max="2030"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ราคาซื้อ (บาท)</label>
                <input
                  type="number"
                  placeholder="500000"
                  value={carData.buyPrice}
                  onChange={e => handleChange('buyPrice', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ราคาขาย (บาท)</label>
                <input
                  type="number"
                  placeholder="600000"
                  value={carData.sellPrice}
                  onChange={e => handleChange('sellPrice', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
              <textarea
                placeholder="รายละเอียดเพิ่มเติม..."
                value={carData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
              />
            </div>
          </div>

          {/* ผู้ร่วมลงทุน */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">👥 ผู้ร่วมลงทุน</h2>
            
            {carData.investors.map((investor, idx) => (
              <div key={idx} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="ชื่อผู้ลงทุน"
                  value={investor.name}
                  onChange={e => handleInvestorChange(idx, 'name', e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
                <input
                  type="number"
                  placeholder="จำนวนเงิน"
                  value={investor.amount}
                  onChange={e => handleInvestorChange(idx, 'amount', e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="0"
                  required
                />
                {carData.investors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInvestor(idx)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addInvestor}
              className="text-orange-600 hover:text-orange-800 font-medium"
            >
              + เพิ่มผู้ลงทุน
            </button>

            {/* แสดงเงินลงทุนรวม */}
            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-800">
                💰 เงินลงทุนรวม: {calculateTotalInvestment().toLocaleString()} บาท
              </p>
            </div>
          </div>

          {/* ค่าใช้จ่ายเพิ่มเติม */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">💸 ค่าใช้จ่ายเพิ่มเติม</h2>
            
            {carData.expenses.map((expense, idx) => (
              <div key={idx} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="รายการ"
                  value={expense.description}
                  onChange={e => handleExpenseChange(idx, 'description', e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="number"
                  placeholder="จำนวนเงิน"
                  value={expense.cost}
                  onChange={e => handleExpenseChange(idx, 'cost', e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="0"
                />
                <button
                  type="button"
                  onClick={() => removeExpense(idx)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  🗑️
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addExpense}
              className="text-orange-600 hover:text-orange-800 font-medium"
            >
              + เพิ่มค่าใช้จ่าย
            </button>
          </div>

          {/* สรุปการคำนวณ */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 สรุปการคำนวณ</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>ราคาซื้อ:</span>
                <span>{(parseFloat(carData.buyPrice) || 0).toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าใช้จ่ายเพิ่มเติม:</span>
                <span>{carData.expenses.reduce((sum, exp) => sum + (parseFloat(exp.cost) || 0), 0).toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>ต้นทุนรวม:</span>
                <span>{calculateTotalCost().toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between">
                <span>ราคาขาย:</span>
                <span>{(parseFloat(carData.sellPrice) || 0).toLocaleString()} บาท</span>
              </div>
              <div className={`flex justify-between font-bold text-lg ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>กำไร/ขาดทุน:</span>
                <span>{calculateProfit().toLocaleString()} บาท</span>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg ${message.includes('สำเร็จ') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳ กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
          </button>
        </form>
      </div>
    </div>
  )
}
