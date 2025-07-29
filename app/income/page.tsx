'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'

interface Income {
  id: string
  amount: number
  description: string
  date: string
  category: string
}

export default function IncomePage() {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('commission')
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState('')
  const [incomes, setIncomes] = useState<Income[]>([])

  useEffect(() => {
    fetchIncomes()
  }, [])

  const fetchIncomes = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('กรุณาเข้าสู่ระบบ')
      return
    }

    setUserId(user.id)

    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching incomes:', error)
      setMessage('เกิดข้อผิดพลาดในการดึงข้อมูล')
    } else {
      setIncomes(data || [])
      setMessage(`พบข้อมูลรายรับ ${data?.length || 0} รายการ`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !description || !date) {
      setMessage('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage('กรุณาเข้าสู่ระบบ')
      return
    }

    const { data, error } = await supabase.from('income').insert([
      {
        user_id: user.id,
        amount: parseFloat(amount),
        description,
        date,
        category
      }
    ])

    if (error) {
      console.error('Error:', error)
      setMessage('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      setMessage('บันทึกรายรับสำเร็จ!')
      setAmount('')
      setDescription('')
      setDate('')
      setCategory('commission')
      fetchIncomes() // Refresh list
    }
  }

  const deleteIncome = async (id: string) => {
    const { error } = await supabase.from('income').delete().eq('id', id)

    if (error) {
      console.error('Error deleting income:', error)
      setMessage('เกิดข้อผิดพลาดในการลบข้อมูล')
    } else {
      setMessage('ลบข้อมูลสำเร็จ')
      fetchIncomes() // Refresh list
    }
  }

  return (
    <div className="p-4 pb-20 bg-pastel-cream min-h-screen font-prompt">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-orange-800 mb-2">💰 บันทึกรายรับ</h1>
          <p className="text-orange-700">เพิ่มรายรับประจำวันของคุณ</p>
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนเงิน (บาท)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                  required
                >
                  <option value="commission">ค่าคอมมิชชั่น</option>
                  <option value="consultation">ค่าที่ปรึกษา</option>
                  <option value="bonus">โบนัส</option>
                  <option value="referral">ค่าแนะนำ</option>
                  <option value="other">อื่น ๆ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียด</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                placeholder="ระบุรายละเอียดรายรับ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              บันทึกรายรับ
            </button>
          </form>
        </div>

        {/* Income List */}
        <div className="bg-white rounded-xl shadow-md border border-orange-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">รายรับล่าสุด</h2>
          </div>
          <div className="p-6">
            {incomes.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                ยังไม่มีข้อมูลรายรับ
              </div>
            ) : (
              incomes.map((income) => (
                <div key={income.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {income.category}
                      </span>
                      <span className="text-sm text-gray-500">{income.date}</span>
                    </div>
                    <p className="font-medium text-gray-900">{income.description}</p>
                    <p className="text-lg font-bold text-green-600">+฿{income.amount.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => deleteIncome(income.id)}
                    className="ml-4 px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    ลบ
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.includes('สำเร็จ') ? 'bg-green-100 text-green-800' : 
            message.includes('ข้อผิดพลาด') ? 'bg-red-100 text-red-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
