'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createExpenseShareNotifications } from './NotificationSystem'
import ExpenseReceiptUpload from './ExpenseReceiptUpload'

interface PostSaleExpense {
  id: string
  car_id: string
  description: string
  amount: number
  date: string
  paid_by: string
  created_at: string
  receipt_url?: string
  receipt_path?: string
  receipt_uploaded_at?: string
  split_method: 'equal' | 'percentage' | 'custom'
  expense_splits: Array<{
    investor_name: string
    amount_owed: number
    paid: boolean
    paid_date?: string
  }>
}

interface JointCar {
  id: string
  brand: string
  model: string
  investors: Array<{
    name: string
    amount: number
    share_percentage: number
  }>
}

interface PostSaleExpenseManagerProps {
  car: JointCar
  onExpenseAdded?: () => void
}

export default function PostSaleExpenseManager({ car, onExpenseAdded }: PostSaleExpenseManagerProps) {
  const [expenses, setExpenses] = useState<PostSaleExpense[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    paid_by: '',
    split_method: 'percentage' as 'equal' | 'percentage' | 'custom',
    receipt_url: '',
    receipt_path: '',
    custom_splits: car.investors.map(investor => ({
      name: investor.name,
      amount: 0
    }))
  })
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchExpenses()
  }, [car.id])

  const handleFileUploaded = (filePath: string, fileUrl: string) => {
    setNewExpense(prev => ({
      ...prev,
      receipt_path: filePath,
      receipt_url: fileUrl
    }))
  }

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('post_sale_expenses')
        .select('*')
        .eq('car_id', car.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSplits = () => {
    const { amount, split_method, custom_splits } = newExpense
    
    switch (split_method) {
      case 'equal':
        const equalAmount = amount / car.investors.length
        return car.investors.map(investor => ({
          investor_name: investor.name,
          amount_owed: equalAmount,
          paid: false
        }))
      
      case 'percentage':
        return car.investors.map(investor => ({
          investor_name: investor.name,
          amount_owed: (amount * investor.share_percentage) / 100,
          paid: false
        }))
      
      case 'custom':
        return custom_splits.map(split => ({
          investor_name: split.name,
          amount_owed: split.amount,
          paid: false
        }))
      
      default:
        return []
    }
  }

  const addExpense = async () => {
    if (!newExpense.description || newExpense.amount <= 0 || !newExpense.paid_by) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const splits = calculateSplits()
    const totalSplit = splits.reduce((sum, split) => sum + split.amount_owed, 0)
    
    if (Math.abs(totalSplit - newExpense.amount) > 0.01) {
      alert('ยอดรวมการแบ่งจ่ายไม่ตรงกับยอดค่าใช้จ่าย')
      return
    }

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('post_sale_expenses')
        .insert({
          car_id: car.id,
          description: newExpense.description,
          amount: newExpense.amount,
          date: new Date().toISOString(),
          paid_by: newExpense.paid_by,
          split_method: newExpense.split_method,
          expense_splits: splits,
          receipt_url: newExpense.receipt_url || null,
          receipt_path: newExpense.receipt_path || null,
          receipt_uploaded_at: newExpense.receipt_url ? new Date().toISOString() : null
        })
        .select()

      if (error) throw error

      // สร้างการแจ้งเตือน
      await createExpenseShareNotifications(
        car.id,
        car.investors,
        newExpense.amount,
        newExpense.description
      )

      // รีเซ็ตฟอร์ม
      setNewExpense({
        description: '',
        amount: 0,
        paid_by: '',
        split_method: 'percentage',
        receipt_url: '',
        receipt_path: '',
        custom_splits: car.investors.map(investor => ({
          name: investor.name,
          amount: 0
        }))
      })
      
      setShowAddForm(false)
      fetchExpenses()
      onExpenseAdded?.()
      
      alert('เพิ่มค่าใช้จ่ายเรียบร้อยแล้ว และส่งการแจ้งเตือนให้ผู้ลงทุนแล้ว')
    } catch (error) {
      console.error('Error adding expense:', error)
      alert('เกิดข้อผิดพลาดในการเพิ่มค่าใช้จ่าย')
    } finally {
      setLoading(false)
    }
  }

  const markAsPaid = async (expenseId: string, investorName: string) => {
    try {
      const expense = expenses.find(e => e.id === expenseId)
      if (!expense) return

      const updatedSplits = expense.expense_splits.map(split => 
        split.investor_name === investorName
          ? { ...split, paid: true, paid_date: new Date().toISOString() }
          : split
      )

      const { error } = await supabase
        .from('post_sale_expenses')
        .update({ expense_splits: updatedSplits })
        .eq('id', expenseId)

      if (error) throw error

      fetchExpenses()
    } catch (error) {
      console.error('Error marking as paid:', error)
    }
  }

  const updateCustomSplit = (investorName: string, amount: number) => {
    setNewExpense(prev => ({
      ...prev,
      custom_splits: prev.custom_splits.map(split =>
        split.name === investorName ? { ...split, amount } : split
      )
    }))
  }

  const getTotalOwed = (expense: PostSaleExpense, investorName?: string) => {
    if (investorName) {
      const split = expense.expense_splits.find(s => s.investor_name === investorName)
      return split?.amount_owed || 0
    }
    return expense.expense_splits.reduce((sum, split) => sum + split.amount_owed, 0)
  }

  const getTotalPaid = (expense: PostSaleExpense) => {
    return expense.expense_splits
      .filter(split => split.paid)
      .reduce((sum, split) => sum + split.amount_owed, 0)
  }

  const getPaymentStatus = (expense: PostSaleExpense) => {
    const totalSplits = expense.expense_splits.length
    const paidSplits = expense.expense_splits.filter(split => split.paid).length
    
    if (paidSplits === 0) return 'ยังไม่จ่าย'
    if (paidSplits === totalSplits) return 'จ่ายครบแล้ว'
    return `จ่ายแล้ว ${paidSplits}/${totalSplits}`
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-red-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          💰 ค่าใช้จ่ายภายหลังการขาย
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
        >
          + เพิ่มค่าใช้จ่าย
        </button>
      </div>

      {/* ฟอร์มเพิ่มค่าใช้จ่าย */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <h4 className="font-medium text-gray-800 mb-3">เพิ่มค่าใช้จ่ายใหม่</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายการค่าใช้จ่าย
              </label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="เช่น ค่าซ่อมเครื่องยนต์"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จำนวนเงิน (บาท)
              </label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ผู้จ่ายล่วงหน้า
              </label>
              <select
                value={newExpense.paid_by}
                onChange={(e) => setNewExpense(prev => ({ ...prev, paid_by: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">เลือกผู้จ่าย</option>
                {car.investors.map(investor => (
                  <option key={investor.name} value={investor.name}>
                    {investor.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วิธีการแบ่งจ่าย
              </label>
              <select
                value={newExpense.split_method}
                onChange={(e) => setNewExpense(prev => ({ ...prev, split_method: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="percentage">ตามสัดส่วนการลงทุน</option>
                <option value="equal">แบ่งเท่าๆ กัน</option>
                <option value="custom">กำหนดเอง</option>
              </select>
            </div>
          </div>

          {/* Receipt Upload */}
          <ExpenseReceiptUpload
            onFileUploaded={handleFileUploaded}
            currentFileUrl={newExpense.receipt_url}
            maxSize={5}
            accept="image/*,.pdf"
          />

          {/* การแบ่งจ่ายแบบกำหนดเอง */}
          {newExpense.split_method === 'custom' && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-700 mb-2">กำหนดยอดการแบ่งจ่าย</h5>
              <div className="space-y-2">
                {newExpense.custom_splits.map(split => (
                  <div key={split.name} className="flex items-center space-x-3">
                    <div className="flex-1 text-sm">{split.name}</div>
                    <input
                      type="number"
                      value={split.amount}
                      onChange={(e) => updateCustomSplit(split.name, Number(e.target.value))}
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="0"
                    />
                    <span className="text-sm text-gray-500">บาท</span>
                  </div>
                ))}
                <div className="text-sm text-gray-600 pt-2 border-t">
                  รวม: {newExpense.custom_splits.reduce((sum, split) => sum + split.amount, 0).toLocaleString()} บาท
                </div>
              </div>
            </div>
          )}

          {/* แสดงการแบ่งจ่าย */}
          {newExpense.amount > 0 && (
            <div className="mb-4 p-3 bg-white rounded border">
              <h5 className="font-medium text-gray-700 mb-2">การแบ่งจ่าย</h5>
              <div className="space-y-1 text-sm">
                {calculateSplits().map(split => (
                  <div key={split.investor_name} className="flex justify-between">
                    <span>{split.investor_name}</span>
                    <span className="font-medium">{split.amount_owed.toLocaleString()} บาท</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={addExpense}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 transition-colors"
            >
              {loading ? 'กำลังเพิ่ม...' : 'เพิ่มค่าใช้จ่าย'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* รายการค่าใช้จ่าย */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-500">กำลังโหลด...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💰</div>
            <p>ยังไม่มีค่าใช้จ่ายภายหลังการขาย</p>
          </div>
        ) : (
          expenses.map(expense => (
            <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-800">{expense.description}</h4>
                  <p className="text-sm text-gray-600">
                    จำนวน: {expense.amount.toLocaleString()} บาท | 
                    จ่ายโดย: {expense.paid_by} | 
                    วันที่: {new Date(expense.date).toLocaleDateString('th-TH')}
                  </p>
                  {/* แสดงลิงก์หลักฐาน */}
                  {expense.receipt_url && (
                    <div className="mt-2">
                      <a
                        href={expense.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span>📎 ดูหลักฐานสลิป/ใบเสร็จ</span>
                      </a>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-sm px-2 py-1 rounded ${
                    getPaymentStatus(expense) === 'จ่ายครบแล้ว'
                      ? 'bg-green-100 text-green-700'
                      : getPaymentStatus(expense) === 'ยังไม่จ่าย'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {getPaymentStatus(expense)}
                  </div>
                </div>
              </div>

              {/* รายละเอียดการแบ่งจ่าย */}
              <div className="space-y-2">
                {expense.expense_splits.map(split => (
                  <div key={split.investor_name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{split.investor_name}</span>
                      <span className="text-sm text-gray-600">
                        {split.amount_owed.toLocaleString()} บาท
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {split.paid ? (
                        <div className="flex items-center text-green-600 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          จ่ายแล้ว
                          {split.paid_date && (
                            <span className="ml-1 text-gray-500">
                              ({new Date(split.paid_date).toLocaleDateString('th-TH')})
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => markAsPaid(expense.id, split.investor_name)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                        >
                          ทำเครื่องหมายว่าจ่ายแล้ว
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* สรุปการจ่าย */}
              <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                จ่ายแล้ว: {getTotalPaid(expense).toLocaleString()} บาท / {expense.amount.toLocaleString()} บาท
                ({((getTotalPaid(expense) / expense.amount) * 100).toFixed(1)}%)
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
