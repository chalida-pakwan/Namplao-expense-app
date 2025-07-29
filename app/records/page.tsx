'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'

interface Record {
  id: string
  amount: number
  description: string
  date: string
  category: string
  type: 'income' | 'expense'
}

export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage('กรุณาเข้าสู่ระบบ')
        setLoading(false)
        return
      }

      // ดึงข้อมูลรายรับ
      const { data: incomeData } = await supabase
        .from('income')
        .select('id, amount, description, date, category')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      // ดึงข้อมูลรายจ่าย
      const { data: expenseData } = await supabase
        .from('expense')
        .select('id, amount, description, date, category')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      // รวมข้อมูลและจัดเรียง
      const allRecords: Record[] = [
        ...(incomeData || []).map(item => ({ ...item, type: 'income' as const })),
        ...(expenseData || []).map(item => ({ ...item, type: 'expense' as const }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setRecords(allRecords)
      setMessage(`พบข้อมูล ${allRecords.length} รายการ`)
    } catch (error) {
      console.error('Error fetching records:', error)
      setMessage('เกิดข้อผิดพลาดในการดึงข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const deleteRecord = async (id: string, type: 'income' | 'expense') => {
    try {
      const table = type === 'income' ? 'income' : 'expense'
      const { error } = await supabase.from(table).delete().eq('id', id)

      if (error) throw error

      setRecords(records.filter(record => record.id !== id))
      setMessage('ลบข้อมูลสำเร็จ')
    } catch (error) {
      console.error('Error deleting record:', error)
      setMessage('เกิดข้อผิดพลาดในการลบข้อมูล')
    }
  }

  const filteredRecords = records.filter(record => {
    const matchesFilter = filter === 'all' || record.type === filter
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="p-4 pb-20 bg-pastel-cream min-h-screen font-prompt">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="text-orange-600">กำลังโหลดข้อมูล...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-20 bg-pastel-cream min-h-screen font-prompt">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-orange-800 mb-2">📋 ประวัติรายการ</h1>
          <p className="text-orange-700">ดูประวัติรายรับ-รายจ่ายทั้งหมด</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-md border border-orange-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Type Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' 
                    ? 'bg-orange-200 text-orange-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilter('income')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'income' 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                รายรับ
              </button>
              <button
                onClick={() => setFilter('expense')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'expense' 
                    ? 'bg-red-200 text-red-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                รายจ่าย
              </button>
            </div>

            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="ค้นหาจากรายละเอียด หรือหมวดหมู่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100 text-center">
              <div className="text-gray-500">ไม่พบข้อมูล</div>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={`${record.type}-${record.id}`}
                className="bg-white p-4 rounded-xl shadow-md border border-orange-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        record.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.type === 'income' ? '💰 รายรับ' : '💸 รายจ่าย'}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(record.date)}</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">{record.description}</h3>
                    <p className="text-sm text-gray-600 mb-2">หมวดหมู่: {record.category}</p>
                    
                    <p className={`text-xl font-bold ${
                      record.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {record.type === 'income' ? '+' : '-'}฿{record.amount.toLocaleString()}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => deleteRecord(record.id, record.type)}
                    className="ml-4 px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredRecords.length > 0 && (
          <div className="mt-6 bg-white p-4 rounded-xl shadow-md border border-orange-100">
            <div className="text-center">
              <p className="text-sm text-gray-600">แสดงผล {filteredRecords.length} รายการ</p>
            </div>
          </div>
        )}

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
