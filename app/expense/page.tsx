'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'

interface Expense {
  id: string
  amount: number
  description: string
  date: string
  category: string
}

export default function ExpensePage() {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('marketing')
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState('')
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('กรุณาเข้าสู่ระบบ')
      return
    }

    setUserId(user.id)

    const { data, error } = await supabase
      .from('expense')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching expenses:', error)
      setMessage('เกิดข้อผิดพลาดในการดึงข้อมูล')
    } else {
      setExpenses(data || [])
      setMessage(`พบข้อมูลรายจ่าย ${data?.length || 0} รายการ`)
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

    const { data, error } = await supabase.from('expense').insert([
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
      setMessage('บันทึกรายจ่ายสำเร็จ!')
      setAmount('')
      setDescription('')
      setDate('')
      setCategory('marketing')
      fetchExpenses() // Refresh list
    }
  }

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expense').delete().eq('id', id)

    if (error) {
      console.error('Error deleting expense:', error)
      setMessage('เกิดข้อผิดพลาดในการลบข้อมูล')
    } else {
      setMessage('ลบข้อมูลสำเร็จ')
      fetchExpenses() // Refresh list
    }
  }

  return (
    <div className="p-4 pb-20 bg-pastel-cream min-h-screen font-prompt">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-orange-800 mb-2">💸 บันทึกรายจ่าย</h1>
          <p className="text-orange-700">เพิ่มรายจ่ายประจำวันของคุณ</p>
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
                  <option value="marketing">การตลาด</option>
                  <option value="transport">ค่าเดินทาง</option>
                  <option value="office">ค่าใช้จ่ายสำนักงาน</option>
                  <option value="communication">ค่าสื่อสาร</option>
                  <option value="entertainment">ค่าเลี้ยงรับรอง</option>
                  <option value="equipment">อุปกรณ์</option>
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
                placeholder="ระบุรายละเอียดรายจ่าย"
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
              บันทึกรายจ่าย
            </button>
          </form>
        </div>

        {/* Expense List */}
        <div className="bg-white rounded-xl shadow-md border border-orange-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">รายจ่ายล่าสุด</h2>
          </div>
          <div className="p-6">
            {expenses.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                ยังไม่มีข้อมูลรายจ่าย
              </div>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        {expense.category}
                      </span>
                      <span className="text-sm text-gray-500">{expense.date}</span>
                    </div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-lg font-bold text-red-600">-฿{expense.amount.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => deleteExpense(expense.id)}
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
