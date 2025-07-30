'use client'

import { useState } from 'react'
import { X, Plus, DollarSign, FileText, Calendar } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'
import ExpenseReceiptUpload from '../ExpenseReceiptUpload'

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  carId: string
  onExpenseAdded: () => void
}

export default function AddExpenseModal({ isOpen, onClose, carId, onExpenseAdded }: AddExpenseModalProps) {
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    category: 'ซ่อมแซม',
    date: new Date().toISOString().split('T')[0],
    receiptUrl: '',
    receiptPath: ''
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const categories = [
    'ซ่อมแซม',
    'ประกันภัย', 
    'ภาษี',
    'ค่าน้ำมัน',
    'ค่าจอด',
    'ค่าล้างรถ',
    'อะไหล่',
    'อื่นๆ'
  ]

  const handleFileUploaded = (filePath: string, fileUrl: string) => {
    setExpense(prev => ({
      ...prev,
      receiptPath: filePath,
      receiptUrl: fileUrl
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!expense.description.trim() || !expense.amount) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    setLoading(true)
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('กรุณาเข้าสู่ระบบก่อน')
        return
      }

      // Get current car data
      const { data: car, error: carError } = await supabase
        .from('joint_cars')
        .select('additional_expenses')
        .eq('id', carId)
        .single()

      if (carError) {
        console.error('Error fetching car:', carError)
        toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลรถ')
        return
      }

      // Add new expense to existing expenses
      const currentExpenses = car.additional_expenses || []
      const newExpense = {
        description: `[${expense.category}] ${expense.description}`,
        amount: parseFloat(expense.amount),
        date: expense.date,
        added_by: user.id,
        added_at: new Date().toISOString(),
        receipt_url: expense.receiptUrl || null,
        receipt_path: expense.receiptPath || null
      }

      const updatedExpenses = [...currentExpenses, newExpense]

      // Update car with new expenses
      const { error: updateError } = await supabase
        .from('joint_cars')
        .update({ additional_expenses: updatedExpenses })
        .eq('id', carId)

      if (updateError) {
        console.error('Error updating expenses:', updateError)
        toast.error('เกิดข้อผิดพลาดในการเพิ่มค่าใช้จ่าย')
        return
      }

      toast.success('เพิ่มค่าใช้จ่ายเรียบร้อยแล้ว')
      
      // Reset form
      setExpense({
        description: '',
        amount: '',
        category: 'ซ่อมแซม',
        date: new Date().toISOString().split('T')[0],
        receiptUrl: '',
        receiptPath: ''
      })
      
      onExpenseAdded()
      onClose()
      
    } catch (error) {
      console.error('Error adding expense:', error)
      toast.error('เกิดข้อผิดพลาดที่ไม่คาดคิด')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">เพิ่มค่าใช้จ่าย</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              หมวดหมู่
            </label>
            <select
              value={expense.category}
              onChange={(e) => setExpense(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รายละเอียด
            </label>
            <input
              type="text"
              value={expense.description}
              onChange={(e) => setExpense(prev => ({ ...prev, description: e.target.value }))}
              placeholder="เช่น: เปลี่ยนยางรถ, ซ่อมเครื่องยนต์"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              จำนวนเงิน (บาท)
            </label>
            <input
              type="number"
              value={expense.amount}
              onChange={(e) => setExpense(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              วันที่
            </label>
            <input
              type="date"
              value={expense.date}
              onChange={(e) => setExpense(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              required
            />
          </div>

          {/* Receipt Upload */}
          <ExpenseReceiptUpload
            onFileUploaded={handleFileUploaded}
            currentFileUrl={expense.receiptUrl}
            maxSize={5}
            accept="image/*,.pdf"
          />

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มค่าใช้จ่าย</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
