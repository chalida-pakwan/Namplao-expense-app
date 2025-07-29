'use client'

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabaseClient'
import IncomeExpenseChart from '@/components/IncomeExpenseChart'

export default function DashboardPage() {
  const [userId, setUserId] = useState('')
  const [incomeTotal, setIncomeTotal] = useState(0)
  const [expenseTotal, setExpenseTotal] = useState(0)
  const [netTotal, setNetTotal] = useState(0)
  const [message, setMessage] = useState('')
  const [chartLabels, setChartLabels] = useState<string[]>([])
  const [chartIncome, setChartIncome] = useState<number[]>([])
  const [chartExpense, setChartExpense] = useState<number[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage('กรุณาเข้าสู่ระบบ')
        return
      }

      setUserId(user.id)

      // ดึงรายรับ
      const { data: incomeData } = await supabase
        .from('income')
        .select('amount, date')
        .eq('user_id', user.id)

      // ดึงรายจ่าย
      const { data: expenseData } = await supabase
        .from('expense')
        .select('amount, date')
        .eq('user_id', user.id)

      // คำนวณยอดรวม
      const totalIncome = incomeData?.reduce((sum, item) => sum + item.amount, 0) || 0
      const totalExpense = expenseData?.reduce((sum, item) => sum + item.amount, 0) || 0
      const netAmount = totalIncome - totalExpense

      setIncomeTotal(totalIncome)
      setExpenseTotal(totalExpense)
      setNetTotal(netAmount)

      // เตรียมข้อมูลสำหรับกราฟ (รายเดือน)
      const monthlyData: { [key: string]: { income: number; expense: number } } = {}
      const currentYear = new Date().getFullYear()

      // Initialize months
      for (let i = 1; i <= 12; i++) {
        const monthKey = `${currentYear}-${String(i).padStart(2, '0')}`
        monthlyData[monthKey] = { income: 0, expense: 0 }
      }

      // Sum income by month
      incomeData?.forEach(item => {
        const month = item.date.substring(0, 7) // YYYY-MM
        if (monthlyData[month]) {
          monthlyData[month].income += item.amount
        }
      })

      // Sum expense by month
      expenseData?.forEach(item => {
        const month = item.date.substring(0, 7) // YYYY-MM
        if (monthlyData[month]) {
          monthlyData[month].expense += item.amount
        }
      })

      // Convert to arrays for chart
      const labels = Object.keys(monthlyData).map(month => {
        const [year, monthNum] = month.split('-')
        const monthNames = [
          'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
          'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ]
        return monthNames[parseInt(monthNum) - 1]
      })

      const incomeArray = Object.values(monthlyData).map((data: { income: number; expense: number }) => data.income)
      const expenseArray = Object.values(monthlyData).map((data: { income: number; expense: number }) => data.expense)

      setChartLabels(labels)
      setChartIncome(incomeArray)
      setChartExpense(expenseArray)

      setMessage(`ดึงข้อมูลสำเร็จ! รายรับ ${totalIncome.toLocaleString()} บาท รายจ่าย ${totalExpense.toLocaleString()} บาท`)
    }

    fetchData()
  }, [])

  return (
    <div className="p-4 pb-20 bg-pastel-cream min-h-screen font-prompt">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-orange-800 mb-2">📊 Dashboard</h1>
          <p className="text-orange-700">สรุปภาพรวมรายรับ-รายจ่าย</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* รายรับ */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">รายรับรวม</p>
                <p className="text-2xl font-bold text-green-600">
                  ฿{incomeTotal.toLocaleString()}
                </p>
              </div>
              <div className="text-3xl text-green-500">💰</div>
            </div>
          </div>

          {/* รายจ่าย */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">รายจ่ายรวม</p>
                <p className="text-2xl font-bold text-red-600">
                  ฿{expenseTotal.toLocaleString()}
                </p>
              </div>
              <div className="text-3xl text-red-500">💸</div>
            </div>
          </div>

          {/* ยอดสุทธิ */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ยอดสุทธิ</p>
                <p className={`text-2xl font-bold ${netTotal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ฿{netTotal.toLocaleString()}
                </p>
              </div>
              <div className="text-3xl text-blue-500">📈</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">กราฟรายรับ-รายจ่าย รายเดือน</h2>
          <IncomeExpenseChart 
            labels={chartLabels}
            income={chartIncome}
            expense={chartExpense}
          />
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${message.includes('สำเร็จ') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
