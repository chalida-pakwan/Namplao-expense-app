'use client'

import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface JointCar {
  id: string
  date: string
  brand: string
  model: string
  profit: number
  total_investment: number
  status: string
  sell_price: number
  buy_price: number
}

interface JointCarChartsProps {
  cars: JointCar[]
}

export default function JointCarCharts({ cars }: JointCarChartsProps) {
  const [chartType, setChartType] = useState<'monthly' | 'yearly' | 'status' | 'brand'>('monthly')

  // ข้อมูลกำไรรายเดือน
  const getMonthlyData = () => {
    const monthlyProfit: { [key: string]: number } = {}
    const monthlyInvestment: { [key: string]: number } = {}
    
    cars.forEach(car => {
      if (car.status === 'ขายแล้ว') {
        const month = new Date(car.date).toLocaleDateString('th-TH', { 
          year: 'numeric', 
          month: 'short' 
        })
        monthlyProfit[month] = (monthlyProfit[month] || 0) + car.profit
        monthlyInvestment[month] = (monthlyInvestment[month] || 0) + car.total_investment
      }
    })

    const labels = Object.keys(monthlyProfit).sort()
    
    return {
      labels,
      datasets: [
        {
          label: 'กำไร (บาท)',
          data: labels.map(month => monthlyProfit[month] || 0),
          backgroundColor: 'rgba(251, 146, 60, 0.8)',
          borderColor: 'rgba(251, 146, 60, 1)',
          borderWidth: 2,
        },
        {
          label: 'เงินลงทุน (บาท)',
          data: labels.map(month => monthlyInvestment[month] || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
        }
      ]
    }
  }

  // ข้อมูลกำไรรายปี
  const getYearlyData = () => {
    const yearlyProfit: { [key: string]: number } = {}
    const yearlyCount: { [key: string]: number } = {}
    
    cars.forEach(car => {
      if (car.status === 'ขายแล้ว') {
        const year = new Date(car.date).getFullYear().toString()
        yearlyProfit[year] = (yearlyProfit[year] || 0) + car.profit
        yearlyCount[year] = (yearlyCount[year] || 0) + 1
      }
    })

    const labels = Object.keys(yearlyProfit).sort()
    
    return {
      labels,
      datasets: [
        {
          label: 'กำไรรวม (บาท)',
          data: labels.map(year => yearlyProfit[year] || 0),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          type: 'bar' as const,
        },
        {
          label: 'จำนวนรถที่ขาย (คัน)',
          data: labels.map(year => yearlyCount[year] || 0),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          type: 'line' as const,
          yAxisID: 'y1',
        }
      ]
    }
  }

  // ข้อมูลตามสถานะ
  const getStatusData = () => {
    const statusCount: { [key: string]: number } = {}
    const statusColors = {
      'กำลังหา': '#f59e0b',
      'ซื้อแล้ว': '#3b82f6',
      'ขายแล้ว': '#10b981',
      'ยกเลิก': '#ef4444'
    }
    
    cars.forEach(car => {
      statusCount[car.status] = (statusCount[car.status] || 0) + 1
    })

    return {
      labels: Object.keys(statusCount),
      datasets: [
        {
          label: 'จำนวนรถ',
          data: Object.values(statusCount),
          backgroundColor: Object.keys(statusCount).map(status => 
            statusColors[status as keyof typeof statusColors] || '#6b7280'
          ),
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    }
  }

  // ข้อมูลตามยี่ห้อ
  const getBrandData = () => {
    const brandProfit: { [key: string]: number } = {}
    const brandCount: { [key: string]: number } = {}
    
    cars.forEach(car => {
      if (car.status === 'ขายแล้ว') {
        brandProfit[car.brand] = (brandProfit[car.brand] || 0) + car.profit
        brandCount[car.brand] = (brandCount[car.brand] || 0) + 1
      }
    })

    const labels = Object.keys(brandProfit).sort()
    
    return {
      labels,
      datasets: [
        {
          label: 'กำไรรวม (บาท)',
          data: labels.map(brand => brandProfit[brand] || 0),
          backgroundColor: 'rgba(147, 51, 234, 0.8)',
          borderColor: 'rgba(147, 51, 234, 1)',
          borderWidth: 2,
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: {
          monthly: 'กำไรรายเดือน',
          yearly: 'กำไรรายปี',
          status: 'สถานะรถ',
          brand: 'กำไรตามยี่ห้อ'
        }[chartType]
      },
    },
    scales: chartType === 'yearly' ? {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'กำไร (บาท)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'จำนวนรถ (คัน)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    } : chartType !== 'status' ? {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'จำนวน (บาท)'
        }
      }
    } : {}
  }

  const getChartData = () => {
    switch (chartType) {
      case 'monthly': return getMonthlyData()
      case 'yearly': return getYearlyData()
      case 'status': return getStatusData()
      case 'brand': return getBrandData()
      default: return getMonthlyData()
    }
  }

  const renderChart = () => {
    const data = getChartData()
    
    if (chartType === 'status') {
      return <Pie data={data} options={chartOptions} />
    } else if (chartType === 'yearly') {
      return <Bar data={data} options={chartOptions} />
    } else {
      return <Bar data={data} options={chartOptions} />
    }
  }

  // คำนวณสถิติ
  const soldCars = cars.filter(car => car.status === 'ขายแล้ว')
  const totalProfit = soldCars.reduce((sum, car) => sum + car.profit, 0)
  const totalInvestment = soldCars.reduce((sum, car) => sum + car.total_investment, 0)
  const avgProfit = soldCars.length > 0 ? totalProfit / soldCars.length : 0
  const profitMargin = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 กราฟและสถิติ</h2>
        
        {/* สถิติสรุป */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {totalProfit.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">กำไรรวม (บาท)</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {soldCars.length}
            </div>
            <div className="text-sm text-gray-600">รถที่ขายแล้ว</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {avgProfit.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">กำไรเฉลี่ย/คัน</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">
              {profitMargin.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">อัตรากำไร</div>
          </div>
        </div>

        {/* เลือกประเภทกราฟ */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setChartType('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'monthly'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📅 รายเดือน
          </button>
          <button
            onClick={() => setChartType('yearly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'yearly'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📈 รายปี
          </button>
          <button
            onClick={() => setChartType('status')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'status'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎯 สถานะ
          </button>
          <button
            onClick={() => setChartType('brand')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'brand'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🚗 ยี่ห้อ
          </button>
        </div>
      </div>

      {/* กราฟ */}
      <div className="h-80">
        {cars.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>ยังไม่มีข้อมูลสำหรับแสดงกราฟ</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
