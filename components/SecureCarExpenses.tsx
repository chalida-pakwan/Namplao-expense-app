'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'
import FileUpload from './FileUpload'

interface CarExpense {
  id: string
  description: string
  amount: number
  receipt_image?: string
  expense_date: string
  created_at: string
  created_by: string
  user_email?: string
  user_name?: string
}

interface SecureCarExpensesProps {
  carId: string
  currentUserId: string
}

export default function SecureCarExpenses({ carId, currentUserId }: SecureCarExpensesProps) {
  const [expenses, setExpenses] = useState<CarExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<CarExpense | null>(null)
  
  // Form states
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [receiptImage, setReceiptImage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchExpenses()
  }, [carId])

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('car_expenses')
        .select(`
          *,
          car_members!car_expenses_created_by_fkey (
            user_name,
            user_email
          )
        `)
        .eq('car_id', carId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // แปลงข้อมูลให้เหมาะสม
      const expensesWithUserInfo = data.map(expense => ({
        ...expense,
        user_name: expense.car_members?.user_name || 'ไม่ระบุชื่อ',
        user_email: expense.car_members?.user_email || ''
      }))

      setExpenses(expensesWithUserInfo)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setExpenseDate(new Date().toISOString().split('T')[0])
    setReceiptImage('')
    setEditingExpense(null)
    setShowAddForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount) return

    setSaving(true)
    try {
      const expenseData = {
        car_id: carId,
        user_id: currentUserId,
        created_by: currentUserId,
        description: description.trim(),
        amount: parseFloat(amount),
        expense_date: expenseDate,
        receipt_image: receiptImage || null
      }

      if (editingExpense) {
        // อัปเดตรายจ่าย
        const { error } = await supabase
          .from('car_expenses')
          .update(expenseData)
          .eq('id', editingExpense.id)
          .eq('created_by', currentUserId) // ตรวจสอบเป็นเจ้าของ

        if (error) throw error
      } else {
        // เพิ่มรายจ่ายใหม่
        const { error } = await supabase
          .from('car_expenses')
          .insert([expenseData])

        if (error) throw error
      }

      await fetchExpenses()
      resetForm()
    } catch (error: any) {
      console.error('Error saving expense:', error)
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (expense: CarExpense) => {
    if (expense.created_by !== currentUserId) {
      alert('คุณสามารถแก้ไขได้เฉพาะรายจ่ายของตัวเอง')
      return
    }

    setEditingExpense(expense)
    setDescription(expense.description)
    setAmount(expense.amount.toString())
    setExpenseDate(expense.expense_date)
    setReceiptImage(expense.receipt_image || '')
    setShowAddForm(true)
  }

  const handleDelete = async (expense: CarExpense) => {
    if (expense.created_by !== currentUserId) {
      alert('คุณสามารถลบได้เฉพาะรายจ่ายของตัวเอง')
      return
    }

    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรายจ่ายนี้?')) return

    try {
      const { error } = await supabase
        .from('car_expenses')
        .delete()
        .eq('id', expense.id)
        .eq('created_by', currentUserId)

      if (error) throw error

      await fetchExpenses()
    } catch (error: any) {
      console.error('Error deleting expense:', error)
      alert('เกิดข้อผิดพลาดในการลบ: ' + error.message)
    }
  }

  const handleFileUploaded = (filePath: string, fileUrl: string) => {
    setReceiptImage(fileUrl)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH').format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">💸 รายจ่ายรถ</h3>
          <p className="text-sm text-gray-600">
            รวม {expenses.length} รายการ • {formatCurrency(totalExpenses)} บาท
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          {showAddForm ? '❌ ยกเลิก' : '➕ เพิ่มรายจ่าย'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-800 mb-4">
            {editingExpense ? '✏️ แก้ไขรายจ่าย' : '➕ เพิ่มรายจ่ายใหม่'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รายละเอียด *
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="เช่น ค่าน้ำมัน, ค่าซ่อม"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนเงิน (บาท) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  แนบสลิป/ใบเสร็จ
                </label>
                <FileUpload
                  onFileUploaded={handleFileUploaded}
                  allowedTypes={['image/*']}
                  maxSize={5}
                  folder="car-receipts"
                />
                {receiptImage && (
                  <div className="mt-2">
                    <img
                      src={receiptImage}
                      alt="สลิป"
                      className="h-20 w-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !description.trim() || !amount}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {saving ? '💾 กำลังบันทึก...' : (editingExpense ? '💾 อัปเดต' : '💾 เพิ่มรายจ่าย')}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💸</div>
            <p>ยังไม่มีรายจ่าย</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800">{expense.description}</h4>
                    {expense.receipt_image && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        📎 มีสลิป
                      </span>
                    )}
                  </div>
                  
                  <div className="text-lg font-semibold text-orange-600 mb-2">
                    {formatCurrency(expense.amount)} บาท
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <div>💁‍♂️ โดย: {expense.user_name}</div>
                    <div>📅 {formatDateTime(expense.created_at)}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {expense.receipt_image && (
                    <button
                      onClick={() => window.open(expense.receipt_image, '_blank')}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      🔍 ดูสลิป
                    </button>
                  )}
                  
                  {expense.created_by === currentUserId && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-orange-600 hover:text-orange-700 text-sm px-2 py-1 rounded hover:bg-orange-50"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(expense)}
                        className="text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
