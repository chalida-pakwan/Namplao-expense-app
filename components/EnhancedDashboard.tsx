'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import JointCarCharts from './JointCarCharts'

interface DashboardStats {
  totalCars: number
  soldCars: number
  activeCars: number
  cancelledCars: number
  totalInvestment: number
  totalRevenue: number
  totalProfit: number
  finalProfit: number
  postSaleExpenses: number
  profitableCars: number
  lossCars: number
  averageProfit: number
  averageProfitMargin: number
  bestPerformingBrand: string
  bestProfitMargin: number
}

interface JointCar {
  id: string
  date: string
  brand: string
  model: string
  year: number
  buy_price: number
  sell_price: number
  profit: number
  final_profit: number
  total_investment: number
  status: string
  is_profit: boolean
  profit_margin: number
  post_sale_expenses_total: number
}

export default function EnhancedDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCars: 0,
    soldCars: 0,
    activeCars: 0,
    cancelledCars: 0,
    totalInvestment: 0,
    totalRevenue: 0,
    totalProfit: 0,
    finalProfit: 0,
    postSaleExpenses: 0,
    profitableCars: 0,
    lossCars: 0,
    averageProfit: 0,
    averageProfitMargin: 0,
    bestPerformingBrand: '',
    bestProfitMargin: 0
  })
  const [cars, setCars] = useState<JointCar[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30days' | '90days' | '1year'>('all')
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchDashboardData()
  }, [selectedPeriod])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // คำนวณวันที่สำหรับการกรอง
      let dateFilter = ''
      const now = new Date()
      
      switch (selectedPeriod) {
        case '30days':
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          dateFilter = `AND date >= '${thirtyDaysAgo.toISOString()}'`
          break
        case '90days':
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          dateFilter = `AND date >= '${ninetyDaysAgo.toISOString()}'`
          break
        case '1year':
          const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          dateFilter = `AND date >= '${oneYearAgo.toISOString()}'`
          break
      }

      const { data, error } = await supabase
        .from('joint_cars')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error

      const allCars = data || []
      const filteredCars = selectedPeriod === 'all' 
        ? allCars 
        : allCars.filter(car => {
            const carDate = new Date(car.date)
            const filterDate = new Date()
            
            switch (selectedPeriod) {
              case '30days':
                filterDate.setDate(filterDate.getDate() - 30)
                break
              case '90days':
                filterDate.setDate(filterDate.getDate() - 90)
                break
              case '1year':
                filterDate.setFullYear(filterDate.getFullYear() - 1)
                break
            }
            
            return carDate >= filterDate
          })

      setCars(filteredCars)
      calculateStats(filteredCars)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (carsData: JointCar[]) => {
    const soldCars = carsData.filter(car => car.status === 'ขายแล้ว')
    const activeCars = carsData.filter(car => ['กำลังหา', 'ซื้อแล้ว'].includes(car.status))
    const cancelledCars = carsData.filter(car => car.status === 'ยกเลิก')
    
    const totalInvestment = soldCars.reduce((sum, car) => sum + car.total_investment, 0)
    const totalRevenue = soldCars.reduce((sum, car) => sum + car.sell_price, 0)
    const totalProfit = soldCars.reduce((sum, car) => sum + car.profit, 0)
    const finalProfit = soldCars.reduce((sum, car) => sum + (car.final_profit || car.profit), 0)
    const postSaleExpenses = soldCars.reduce((sum, car) => sum + (car.post_sale_expenses_total || 0), 0)
    
    const profitableCars = soldCars.filter(car => (car.final_profit || car.profit) > 0).length
    const lossCars = soldCars.filter(car => (car.final_profit || car.profit) < 0).length
    
    const averageProfit = soldCars.length > 0 ? finalProfit / soldCars.length : 0
    const averageProfitMargin = soldCars.length > 0 
      ? soldCars.reduce((sum, car) => sum + (car.profit_margin || 0), 0) / soldCars.length 
      : 0

    // หายี่ห้อที่ทำกำไรได้ดีที่สุด
    const brandStats: { [key: string]: { profit: number; count: number; margin: number } } = {}
    
    soldCars.forEach(car => {
      if (!brandStats[car.brand]) {
        brandStats[car.brand] = { profit: 0, count: 0, margin: 0 }
      }
      brandStats[car.brand].profit += car.final_profit || car.profit
      brandStats[car.brand].count += 1
      brandStats[car.brand].margin += car.profit_margin || 0
    })

    let bestPerformingBrand = ''
    let bestProfitMargin = 0

    Object.entries(brandStats).forEach(([brand, stats]) => {
      const avgMargin = stats.margin / stats.count
      if (avgMargin > bestProfitMargin) {
        bestProfitMargin = avgMargin
        bestPerformingBrand = brand
      }
    })

    setStats({
      totalCars: carsData.length,
      soldCars: soldCars.length,
      activeCars: activeCars.length,
      cancelledCars: cancelledCars.length,
      totalInvestment,
      totalRevenue,
      totalProfit,
      finalProfit,
      postSaleExpenses,
      profitableCars,
      lossCars,
      averageProfit,
      averageProfitMargin,
      bestPerformingBrand,
      bestProfitMargin
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH').format(amount)
  }

  const getROI = () => {
    return stats.totalInvestment > 0 ? ((stats.finalProfit / stats.totalInvestment) * 100) : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลแดชบอร์ด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 แดชบอร์ดการลงทุนรถ</h1>
            <p className="text-gray-600">ภาพรวมผลการดำเนินงานและการวิเคราะห์กำไร</p>
          </div>
          
          {/* Period Filter */}
          <div className="mt-4 md:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">ทั้งหมด</option>
              <option value="30days">30 วันล่าสุด</option>
              <option value="90days">90 วันล่าสุด</option>
              <option value="1year">1 ปีล่าสุด</option>
            </select>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* จำนวนรถ */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">รถทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalCars}</p>
                <div className="text-xs text-gray-500 mt-1">
                  ขาย: {stats.soldCars} | ดำเนินการ: {stats.activeCars} | ยกเลิก: {stats.cancelledCars}
                </div>
              </div>
              <div className="text-3xl">🚗</div>
            </div>
          </div>

          {/* เงินลงทุน */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">เงินลงทุนรวม</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalInvestment)}</p>
                <div className="text-xs text-gray-500 mt-1">
                  รายได้: {formatCurrency(stats.totalRevenue)}
                </div>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          {/* กำไรสุทธิ */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">กำไรสุทธิ</p>
                <p className={`text-2xl font-bold ${stats.finalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.finalProfit)}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  ก่อนหักค่าใช้จ่าย: {formatCurrency(stats.totalProfit)}
                </div>
              </div>
              <div className="text-3xl">{stats.finalProfit >= 0 ? '💚' : '💔'}</div>
            </div>
          </div>

          {/* ROI */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">ผลตอบแทน (ROI)</p>
                <p className={`text-2xl font-bold ${getROI() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getROI().toFixed(2)}%
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  อัตรากำไรเฉลี่ย: {stats.averageProfitMargin.toFixed(2)}%
                </div>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profit/Loss Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 การวิเคราะห์กำไร/ขาดทุน</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">รถที่ทำกำไร</span>
                </div>
                <span className="font-bold text-green-600">{stats.profitableCars} คัน</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">รถที่ขาดทุน</span>
                </div>
                <span className="font-bold text-red-600">{stats.lossCars} คัน</span>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span>อัตราความสำเร็จ:</span>
                  <span className="font-medium">
                    {stats.soldCars > 0 ? ((stats.profitableCars / stats.soldCars) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Best Performing Brand */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 ยี่ห้อที่ทำกำไรดีที่สุด</h3>
            <div className="text-center">
              <div className="text-4xl mb-2">🚗</div>
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {stats.bestPerformingBrand || 'ยังไม่มีข้อมูล'}
              </div>
              <div className="text-sm text-gray-600">
                อัตรากำไรเฉลี่ย: {stats.bestProfitMargin.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Post-Sale Expenses Impact */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">💸 ผลกระทบค่าใช้จ่ายภายหลัง</h3>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.postSaleExpenses)}
                </div>
                <div className="text-sm text-gray-600">ค่าใช้จ่ายเพิ่มเติม</div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span>กำไรก่อนหัก:</span>
                  <span className="font-medium">{formatCurrency(stats.totalProfit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>กำไรหลังหัก:</span>
                  <span className={`font-medium ${stats.finalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(stats.finalProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <JointCarCharts cars={cars} />
      </div>
    </div>
  )
}
