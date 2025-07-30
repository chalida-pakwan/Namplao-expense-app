'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface SearchFilters {
  searchQuery: string
  selectedStatuses: string[]
  selectedBrands: string[]
  selectedInvestors: string[]
  dateFrom: string
  dateTo: string
  minProfit: number | null
  maxProfit: number | null
  profitType: 'all' | 'profit' | 'loss'
  sortBy: 'date' | 'profit' | 'brand' | 'status'
  sortOrder: 'asc' | 'desc'
}

interface AdvancedSearchProps {
  onFiltersChange: (cars: any[]) => void
  onFiltersApply: (filters: SearchFilters) => void
}

export default function AdvancedSearch({ onFiltersChange, onFiltersApply }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    selectedStatuses: [],
    selectedBrands: [],
    selectedInvestors: [],
    dateFrom: '',
    dateTo: '',
    minProfit: null,
    maxProfit: null,
    profitType: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  const [availableOptions, setAvailableOptions] = useState({
    brands: [] as string[],
    investors: [] as string[],
    statuses: ['กำลังหา', 'ซื้อแล้ว', 'ขายแล้ว', 'ยกเลิก']
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [allCars, setAllCars] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, allCars])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('joint_cars')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error

      setAllCars(data || [])
      
      // Extract unique values for filter options
      const brandSet = new Set(data?.map(car => car.brand).filter(Boolean))
      const brands = Array.from(brandSet) as string[]
      
      const investorSet = new Set(
        data?.flatMap(car => 
          car.investors?.map((inv: any) => inv.name) || []
        ).filter(Boolean)
      )
      const investors = Array.from(investorSet) as string[]

      setAvailableOptions(prev => ({
        ...prev,
        brands: brands.sort(),
        investors: investors.sort()
      }))
    } catch (error) {
      console.error('Error fetching cars:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filteredCars = [...allCars]

    // Text search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filteredCars = filteredCars.filter(car => 
        car.brand?.toLowerCase().includes(query) ||
        car.model?.toLowerCase().includes(query) ||
        car.year?.toString().includes(query) ||
        car.investors?.some((inv: any) => inv.name?.toLowerCase().includes(query))
      )
    }

    // Status filter
    if (filters.selectedStatuses.length > 0) {
      filteredCars = filteredCars.filter(car => 
        filters.selectedStatuses.includes(car.status)
      )
    }

    // Brand filter
    if (filters.selectedBrands.length > 0) {
      filteredCars = filteredCars.filter(car => 
        filters.selectedBrands.includes(car.brand)
      )
    }

    // Investor filter
    if (filters.selectedInvestors.length > 0) {
      filteredCars = filteredCars.filter(car => 
        car.investors?.some((inv: any) => 
          filters.selectedInvestors.includes(inv.name)
        )
      )
    }

    // Date range filter
    if (filters.dateFrom) {
      filteredCars = filteredCars.filter(car => 
        new Date(car.date) >= new Date(filters.dateFrom)
      )
    }
    if (filters.dateTo) {
      filteredCars = filteredCars.filter(car => 
        new Date(car.date) <= new Date(filters.dateTo)
      )
    }

    // Profit range filter
    if (filters.minProfit !== null) {
      filteredCars = filteredCars.filter(car => 
        (car.final_profit || car.profit) >= filters.minProfit!
      )
    }
    if (filters.maxProfit !== null) {
      filteredCars = filteredCars.filter(car => 
        (car.final_profit || car.profit) <= filters.maxProfit!
      )
    }

    // Profit type filter
    if (filters.profitType === 'profit') {
      filteredCars = filteredCars.filter(car => 
        (car.final_profit || car.profit) > 0
      )
    } else if (filters.profitType === 'loss') {
      filteredCars = filteredCars.filter(car => 
        (car.final_profit || car.profit) < 0
      )
    }

    // Sorting
    filteredCars.sort((a, b) => {
      let aValue, bValue
      
      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.date)
          bValue = new Date(b.date)
          break
        case 'profit':
          aValue = a.final_profit || a.profit
          bValue = b.final_profit || b.profit
          break
        case 'brand':
          aValue = a.brand
          bValue = b.brand
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = a.date
          bValue = b.date
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    onFiltersChange(filteredCars)
    onFiltersApply(filters)
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = (key: 'selectedStatuses' | 'selectedBrands' | 'selectedInvestors', value: string) => {
    setFilters(prev => {
      const currentArray = prev[key]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      
      return { ...prev, [key]: newArray }
    })
  }

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedStatuses: [],
      selectedBrands: [],
      selectedInvestors: [],
      dateFrom: '',
      dateTo: '',
      minProfit: null,
      maxProfit: null,
      profitType: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.searchQuery) count++
    if (filters.selectedStatuses.length > 0) count++
    if (filters.selectedBrands.length > 0) count++
    if (filters.selectedInvestors.length > 0) count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.minProfit !== null || filters.maxProfit !== null) count++
    if (filters.profitType !== 'all') count++
    return count
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🔍 ค้นหาและกรองข้อมูล</h3>
        <div className="flex items-center space-x-2">
          {getActiveFiltersCount() > 0 && (
            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-sm font-medium">
              {getActiveFiltersCount()} ตัวกรอง
            </span>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            {showAdvanced ? 'ซ่อน' : 'แสดง'}ตัวกรองขั้นสูง
          </button>
        </div>
      </div>

      {/* Basic Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="ค้นหายี่ห้อ, รุ่น, ปี, หรือชื่อผู้ลงทุน..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        
        <div className="flex space-x-2">
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="date">เรียงตามวันที่</option>
            <option value="profit">เรียงตามกำไร</option>
            <option value="brand">เรียงตามยี่ห้อ</option>
            <option value="status">เรียงตามสถานะ</option>
          </select>
          
          <button
            onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title={filters.sortOrder === 'asc' ? 'เรียงจากน้อยไปมาก' : 'เรียงจากมากไปน้อย'}
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          {/* Status Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
            <div className="flex flex-wrap gap-2">
              {availableOptions.statuses.map(status => (
                <button
                  key={status}
                  onClick={() => toggleArrayFilter('selectedStatuses', status)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filters.selectedStatuses.includes(status)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ยี่ห้อ</label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {availableOptions.brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => toggleArrayFilter('selectedBrands', brand)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filters.selectedBrands.includes(brand)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Investor Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ผู้ลงทุน</label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {availableOptions.investors.map(investor => (
                <button
                  key={investor}
                  onClick={() => toggleArrayFilter('selectedInvestors', investor)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filters.selectedInvestors.includes(investor)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {investor}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Profit Range & Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">กำไรต่ำสุด (บาท)</label>
              <input
                type="number"
                value={filters.minProfit || ''}
                onChange={(e) => updateFilter('minProfit', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="ไม่จำกัด"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">กำไรสูงสุด (บาท)</label>
              <input
                type="number"
                value={filters.maxProfit || ''}
                onChange={(e) => updateFilter('maxProfit', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="ไม่จำกัด"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทผลลัพธ์</label>
              <select
                value={filters.profitType}
                onChange={(e) => updateFilter('profitType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">ทั้งหมด</option>
                <option value="profit">กำไรเท่านั้น</option>
                <option value="loss">ขาดทุนเท่านั้น</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {loading ? 'กำลังโหลด...' : `พบ ${allCars.length} รายการ`}
          </span>
          {getActiveFiltersCount() > 0 && (
            <span className="text-orange-600">
              มีตัวกรองที่ใช้งาน {getActiveFiltersCount()} รายการ
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
