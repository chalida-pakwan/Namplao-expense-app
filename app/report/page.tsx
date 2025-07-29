'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'

interface MonthlyData {
  month: string
  income: number
  expense: number
  net: number
}

export default function ReportPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [message, setMessage] = useState('')
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)

  useEffect(() => {
    fetchReportData()
  }, [selectedYear])

  const fetchReportData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('กรุณาเข้าสู่ระบบ')
      return
    }

    try {
      // ดึงรายรับประจำปี
      const { data: incomeData, error: incomeError } = await supabase
        .from('income')
        .select('amount, date')
        .eq('user_id', user.id)
        .gte('date', `${selectedYear}-01-01`)
        .lte('date', `${selectedYear}-12-31`)

      // ดึงรายจ่ายประจำปี
      const { data: expenseData, error: expenseError } = await supabase
        .from('expense')
        .select('amount, date')
        .eq('user_id', user.id)
        .gte('date', `${selectedYear}-01-01`)
        .lte('date', `${selectedYear}-12-31`)

      if (incomeError || expenseError) {
        setMessage('เกิดข้อผิดพลาดในการดึงข้อมูล')
        return
      }

      // สร้างข้อมูลรายเดือน
      const monthlyMap: { [key: string]: MonthlyData } = {}
      const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ]

      // สร้างเดือนทั้งหมด
      for (let i = 1; i <= 12; i++) {
        const monthKey = `${selectedYear}-${String(i).padStart(2, '0')}`
        monthlyMap[monthKey] = {
          month: monthNames[i - 1],
          income: 0,
          expense: 0,
          net: 0
        }
      }

      // รวมรายรับรายเดือน
      incomeData?.forEach(item => {
        const monthKey = item.date.substring(0, 7)
        if (monthlyMap[monthKey]) {
          monthlyMap[monthKey].income += item.amount
        }
      })

      // รวมรายจ่ายรายเดือน
      expenseData?.forEach(item => {
        const monthKey = item.date.substring(0, 7)
        if (monthlyMap[monthKey]) {
          monthlyMap[monthKey].expense += item.amount
        }
      })

      // คำนวณยอดสุทธิ
      Object.keys(monthlyMap).forEach(key => {
        monthlyMap[key].net = monthlyMap[key].income - monthlyMap[key].expense
      })

      const sortedData = Object.values(monthlyMap)
      setMonthlyData(sortedData)

      // คำนวณยอดรวมทั้งปี
      const yearIncome = incomeData?.reduce((sum, item) => sum + item.amount, 0) || 0
      const yearExpense = expenseData?.reduce((sum, item) => sum + item.amount, 0) || 0
      setTotalIncome(yearIncome)
      setTotalExpense(yearExpense)

      setMessage(`ดึงข้อมูลปี ${selectedYear} สำเร็จ!`)
    } catch (error) {
      setMessage('เกิดข้อผิดพลาดในการดึงข้อมูล')
      console.error(error)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['เดือน', 'รายรับ', 'รายจ่าย', 'ยอดสุทธิ'],
      ...monthlyData.map(data => [
        data.month,
        data.income.toString(),
        data.expense.toString(),
        data.net.toString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `รายงาน_${selectedYear}.csv`
    link.click()
  }

  return (
    <div className="p-4 pb-20 bg-pastel-cream min-h-screen font-prompt">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-orange-800 mb-2">📊 รายงานสรุป</h1>
          <p className="text-orange-700">รายงานรายรับ-รายจ่าย รายเดือน</p>
        </div>

        {/* Year Selection */}
        <div className="bg-white p-4 rounded-xl shadow-md border border-orange-100 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เลือกปี
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i
                  return (
                    <option key={year} value={year}>
                      {year + 543}
                    </option>
                  )
                })}
              </select>
            </div>
            <button
              onClick={exportToCSV}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
            >
              📁 ส่งออก CSV
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">รายรับรวมปี {selectedYear + 543}</p>
              <p className="text-2xl font-bold text-green-600">
                ฿{totalIncome.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">รายจ่ายรวมปี {selectedYear + 543}</p>
              <p className="text-2xl font-bold text-red-600">
                ฿{totalExpense.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">ยอดสุทธิปี {selectedYear + 543}</p>
              <p className={`text-2xl font-bold ${(totalIncome - totalExpense) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ฿{(totalIncome - totalExpense).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Report Table */}
        <div className="bg-white rounded-xl shadow-md border border-orange-100 mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">รายงานรายเดือน</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">เดือน</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">รายรับ</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">รายจ่าย</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">ยอดสุทธิ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {monthlyData.map((data, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{data.month}</td>
                    <td className="px-4 py-3 text-sm text-green-600 text-right">
                      ฿{data.income.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 text-right">
                      ฿{data.expense.toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      data.net >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      ฿{data.net.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg ${message.includes('สำเร็จ') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
