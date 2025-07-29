'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'
import IncomeExpenseChart from '@/components/IncomeExpenseChart'

export default function DashboardPage() {
  const router = useRouter()
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
    <div className="p-4 pb-24 text-gray-800 bg-white min-h-screen">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-3 text-[#FF8A5C] flex items-center gap-2">
        📊 Dashboard
      </h1>

      {/* Summary Section */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm mb-6">
        <h2 className="text-base font-semibold mb-2">สรุปภาพรวมรายรับ-รายจ่าย</h2>
        <div className="flex justify-between text-sm">
          <span className="text-green-600">รายรับรวม: ฿{incomeTotal.toLocaleString()}</span>
          <span className="text-red-500">รายจ่ายรวม: ฿{expenseTotal.toLocaleString()}</span>
        </div>
        <div className="mt-2 text-sm">
          ยอดสุทธิ: <span className={`font-bold ${netTotal >= 0 ? 'text-blue-500' : 'text-red-500'}`}>฿{netTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Chart Box */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">📈 กราฟรายรับ-รายจ่าย รายเดือน</h3>
        <div className="h-48 rounded-lg">
          {chartLabels.length > 0 ? (
            <IncomeExpenseChart 
              labels={chartLabels}
              income={chartIncome}
              expense={chartExpense}
            />
          ) : (
            <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              {message ? message : '(กำลังโหลดข้อมูล...)'}
            </div>
          )}
        </div>
      </div>

      {/* Button Section */}
      <div className="text-[#FF8A5C] font-semibold text-sm mb-3">หมวดหมู่รายรับ/รายจ่าย</div>
      <div className="flex gap-3 flex-wrap mb-10">
        <button 
          className="transition-all transform hover:scale-105 bg-orange-100 text-gray-800 px-4 py-2 rounded-xl border border-orange-300 shadow hover:bg-orange-200 active:scale-95"
          onClick={() => router.push('/income')}
        >
          ➕ เพิ่มรายรับ
        </button>
        <button 
          className="transition-all transform hover:scale-105 bg-orange-100 text-gray-800 px-4 py-2 rounded-xl border border-orange-300 shadow hover:bg-orange-200 active:scale-95"
          onClick={() => router.push('/expense')}
        >
          ➕ เพิ่มรายจ่าย
        </button>
        <button 
          className="transition-all transform hover:scale-105 bg-orange-100 text-gray-800 px-4 py-2 rounded-xl border border-orange-300 shadow hover:bg-orange-200 active:scale-95"
          onClick={() => router.push('/records')}
        >
          ดูรายละเอียด
        </button>
      </div>

      {/* Message for debugging - can be removed in production */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg text-xs ${message.includes('สำเร็จ') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {message}
        </div>
      )}

      {/* Footer Note */}
      <div className="text-gray-400 text-xs text-center">
        💡 ใช้ Tailwind เช่น `text-sm`, `mt-4`, `rounded-xl`, `hover:scale-105` เพื่อความสวยงาม
      </div>
    </div>
  )
}
