'use client'

import { useState, useEffect } from 'react'

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  data: any[]
}

interface SearchFilters {
  query: string
  dateFrom: string
  dateTo: string
  minAmount: number
  maxAmount: number
  category: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export default function AdvancedSearch({ onSearch, data }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateFrom: '',
    dateTo: '',
    minAmount: 0,
    maxAmount: 0,
    category: '',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    // Extract unique categories from data
    const uniqueCategoriesSet = new Set(data.map(item => item.category).filter(Boolean))
    const uniqueCategories = Array.from(uniqueCategoriesSet)
    setCategories(uniqueCategories)
  }, [data])

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onSearch(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      dateFrom: '',
      dateTo: '',
      minAmount: 0,
      maxAmount: 0,
      category: '',
      sortBy: 'date',
      sortOrder: 'desc'
    }
    setFilters(clearedFilters)
    onSearch(clearedFilters)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🔍 ค้นหาขั้นสูง</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-orange-500 hover:text-orange-600 transition-colors"
        >
          {isOpen ? '▲ ซ่อน' : '▼ แสดง'}
        </button>
      </div>

      {/* Basic Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 ค้นหาคำสำคัญ..."
          value={filters.query}
          onChange={(e) => handleFilterChange('query', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Advanced Filters */}
      {isOpen && (
        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมวดหมู่
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">ทั้งหมด</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จำนวนเงินต่ำสุด
              </label>
              <input
                type="number"
                min="0"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จำนวนเงินสูงสุด
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เรียงตาม
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="date">วันที่</option>
                  <option value="amount">จำนวน</option>
                  <option value="description">รายการ</option>
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="desc">มาก→น้อย</option>
                  <option value="asc">น้อย→มาก</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              ล้างฟิลเตอร์
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              ซ่อนฟิลเตอร์
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
