'use client'

import { useState, useEffect } from 'react'
import { X, BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react'
import { Line, Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  car: any
}

export default function ChartModal({ isOpen, onClose, car }: ChartModalProps) {
  const [activeChart, setActiveChart] = useState('line')

  if (!isOpen || !car) return null

  // Calculate data for charts
  const totalExpenses = (car.additional_expenses || []).reduce((sum: number, expense: any) => sum + expense.amount, 0)
  const totalCost = car.buy_price + totalExpenses
  const profit = car.sell_price - totalCost
  const profitMargin = ((profit / car.sell_price) * 100).toFixed(1)

  // Line Chart Data - Cost vs Selling Price Trend
  const lineChartData = {
    labels: ['ราคาซื้อ', 'ค่าใช้จ่าย', 'ต้นทุนรวม', 'ราคาขาย'],
    datasets: [
      {
        label: 'จำนวนเงิน (บาท)',
        data: [car.buy_price, totalExpenses, totalCost, car.sell_price],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  }

  // Bar Chart Data - Income vs Expenses
  const barChartData = {
    labels: ['รายได้', 'ต้นทุน', 'กำไร/ขาดทุน'],
    datasets: [
      {
        label: 'จำนวนเงิน (บาท)',
        data: [car.sell_price, totalCost, profit],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green for income
          'rgba(239, 68, 68, 0.8)',   // Red for costs
          profit >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)' // Blue for profit, red for loss
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          profit >= 0 ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)'
        ],
        borderWidth: 2,
      }
    ]
  }

  // Pie Chart Data - Investor Shares
  const pieChartData = {
    labels: (car.investors || []).map((investor: any) => investor.name),
    datasets: [
      {
        label: 'สัดส่วนการลงทุน',
        data: (car.investors || []).map((investor: any) => investor.share_percentage),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${car.brand} ${car.model} (${car.year})`,
      },
    },
    scales: activeChart !== 'pie' ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('th-TH').format(value) + ' บาท'
          }
        }
      }
    } : undefined,
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'สัดส่วนการลงทุน (%)',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed}%`
          }
        }
      }
    },
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH').format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">กราฟผลกำไร</h2>
              <p className="text-sm text-gray-600">{car.brand} {car.model} ({car.year})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(car.sell_price)}</div>
              <div className="text-sm text-gray-600">ราคาขาย</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalCost)}</div>
              <div className="text-sm text-gray-600">ต้นทุนรวม</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(profit)}
              </div>
              <div className="text-sm text-gray-600">กำไร/ขาดทุน</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitMargin}%
              </div>
              <div className="text-sm text-gray-600">อัตรากำไร</div>
            </div>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveChart('line')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeChart === 'line' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>กราฟเส้น</span>
            </button>
            <button
              onClick={() => setActiveChart('bar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeChart === 'bar' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>กราฟแท่ง</span>
            </button>
            <button
              onClick={() => setActiveChart('pie')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeChart === 'pie' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>กราฟวงกลม</span>
            </button>
          </div>
        </div>

        {/* Chart Display */}
        <div className="p-6">
          <div className="h-96">
            {activeChart === 'line' && (
              <Line data={lineChartData} options={chartOptions} />
            )}
            {activeChart === 'bar' && (
              <Bar data={barChartData} options={chartOptions} />
            )}
            {activeChart === 'pie' && (
              <Pie data={pieChartData} options={pieOptions} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
