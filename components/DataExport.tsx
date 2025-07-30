'use client'

import { useState } from 'react'

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
  investors: Array<{
    name: string
    email?: string
    amount: number
    share_percentage: number
  }>
  additional_expenses: Array<{
    description: string
    amount: number
    date: string
  }>
  images?: string[]
}

interface DataExportProps {
  cars: JointCar[]
  selectedCars?: string[]
  className?: string
}

export default function DataExport({ cars, selectedCars, className = '' }: DataExportProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'excel'>('json')
  const [exportScope, setExportScope] = useState<'all' | 'basic' | 'financial' | 'custom'>('all')
  const [customFields, setCustomFields] = useState({
    basic: true,
    financial: true,
    investors: true,
    expenses: true,
    images: false
  })
  const [loading, setLoading] = useState(false)

  // กรองรถที่เลือก
  const getExportData = () => {
    const dataToExport = selectedCars && selectedCars.length > 0
      ? cars.filter(car => selectedCars.includes(car.id))
      : cars

    return dataToExport
  }

  // จัดรูปแบบข้อมูลตาม scope
  const formatDataForExport = (data: JointCar[]) => {
    return data.map(car => {
      let exportData: any = {}

      // Basic information
      if (exportScope === 'all' || exportScope === 'basic' || customFields.basic) {
        exportData = {
          ...exportData,
          รหัส: car.id,
          วันที่: car.date,
          ยี่ห้อ: car.brand,
          รุ่น: car.model,
          ปี: car.year,
          สถานะ: car.status
        }
      }

      // Financial information
      if (exportScope === 'all' || exportScope === 'financial' || customFields.financial) {
        exportData = {
          ...exportData,
          ราคาซื้อ: car.buy_price,
          ราคาขาย: car.sell_price,
          เงินลงทุนรวม: car.total_investment,
          กำไรเบื้องต้น: car.profit,
          ค่าใช้จ่ายภายหลัง: car.post_sale_expenses_total || 0,
          กำไรสุทธิ: car.final_profit || car.profit,
          ทำกำไร: car.is_profit ? 'ใช่' : 'ไม่',
          อัตรากำไร: car.profit_margin || 0
        }
      }

      // Investors information
      if ((exportScope === 'all' || customFields.investors) && car.investors) {
        car.investors.forEach((investor, index) => {
          exportData[`ผู้ลงทุน${index + 1}_ชื่อ`] = investor.name
          exportData[`ผู้ลงทุน${index + 1}_อีเมล`] = investor.email || ''
          exportData[`ผู้ลงทุน${index + 1}_จำนวน`] = investor.amount
          exportData[`ผู้ลงทุน${index + 1}_สัดส่วน`] = investor.share_percentage
        })
      }

      // Additional expenses
      if ((exportScope === 'all' || customFields.expenses) && car.additional_expenses) {
        car.additional_expenses.forEach((expense, index) => {
          exportData[`ค่าใช้จ่าย${index + 1}_รายการ`] = expense.description
          exportData[`ค่าใช้จ่าย${index + 1}_จำนวน`] = expense.amount
          exportData[`ค่าใช้จ่าย${index + 1}_วันที่`] = expense.date
        })
      }

      // Images
      if ((exportScope === 'all' || customFields.images) && car.images) {
        exportData.รูปภาพ = car.images.join(', ')
        exportData.จำนวนรูป = car.images.length
      }

      return exportData
    })
  }

  // Export เป็น JSON
  const exportJSON = (data: any[]) => {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `รายการรถ_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Export เป็น CSV
  const exportCSV = (data: any[]) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Handle values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `รายการรถ_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Export เป็น Excel format (TSV)
  const exportExcel = (data: any[]) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const tsvContent = [
      headers.join('\t'),
      ...data.map(row => 
        headers.map(header => row[header]).join('\t')
      )
    ].join('\n')

    const BOM = '\uFEFF'
    const blob = new Blob([BOM + tsvContent], { type: 'text/tab-separated-values;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `รายการรถ_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setLoading(true)
    
    try {
      const exportData = getExportData()
      const formattedData = formatDataForExport(exportData)

      if (formattedData.length === 0) {
        alert('ไม่มีข้อมูลสำหรับ export')
        return
      }

      switch (exportFormat) {
        case 'json':
          exportJSON(formattedData)
          break
        case 'csv':
          exportCSV(formattedData)
          break
        case 'excel':
          exportExcel(formattedData)
          break
      }

      // สร้างสรุปการ export
      const summary = {
        timestamp: new Date().toISOString(),
        total_records: formattedData.length,
        export_format: exportFormat,
        export_scope: exportScope,
        fields_included: Object.entries(customFields)
          .filter(([_, included]) => included)
          .map(([field]) => field)
      }

      console.log('Export Summary:', summary)
      alert(`Export เรียบร้อยแล้ว! จำนวน ${formattedData.length} รายการ`)
      
    } catch (error) {
      console.error('Export error:', error)
      alert('เกิดข้อผิดพลาดในการ export ข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const getExportCount = () => {
    return getExportData().length
  }

  const getEstimatedFileSize = () => {
    const data = formatDataForExport(getExportData())
    const jsonString = JSON.stringify(data)
    const sizeInBytes = new Blob([jsonString]).size
    const sizeInKB = (sizeInBytes / 1024).toFixed(1)
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2)
    
    return sizeInBytes > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`
  }

  return (
    <div className={`bg-white p-6 rounded-xl shadow-md border border-indigo-100 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📁 ส่งออกข้อมูลดิบ</h3>
        <span className="text-sm text-gray-500">สำหรับสำรองข้อมูลและการวิเคราะห์</span>
      </div>

      {/* Export Format Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">รูปแบบไฟล์</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'json', label: 'JSON', desc: 'สำหรับนักพัฒนา' },
            { value: 'csv', label: 'CSV', desc: 'สำหรับ Excel' },
            { value: 'excel', label: 'Excel', desc: 'เปิดใน Excel ได้เลย' }
          ].map(format => (
            <button
              key={format.value}
              onClick={() => setExportFormat(format.value as any)}
              className={`p-3 rounded-lg border-2 text-left transition-colors ${
                exportFormat === format.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{format.label}</div>
              <div className="text-xs text-gray-500">{format.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Scope */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">ขอบเขตข้อมูล</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { value: 'all', label: 'ทั้งหมด' },
            { value: 'basic', label: 'ข้อมูลพื้นฐาน' },
            { value: 'financial', label: 'ข้อมูลการเงิน' },
            { value: 'custom', label: 'กำหนดเอง' }
          ].map(scope => (
            <button
              key={scope.value}
              onClick={() => setExportScope(scope.value as any)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                exportScope === scope.value
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {scope.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Fields Selection */}
      {exportScope === 'custom' && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3">เลือกฟิลด์ที่ต้องการ</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'basic', label: 'ข้อมูลพื้นฐาน', desc: 'ยี่ห้อ, รุ่น, ปี, สถานะ' },
              { key: 'financial', label: 'ข้อมูลการเงิน', desc: 'ราคา, กำไร, อัตราผลตอบแทน' },
              { key: 'investors', label: 'ผู้ลงทุน', desc: 'ชื่อ, จำนวน, สัดส่วน' },
              { key: 'expenses', label: 'ค่าใช้จ่าย', desc: 'รายการค่าใช้จ่ายเพิ่มเติม' },
              { key: 'images', label: 'รูปภาพ', desc: 'URL รูปภาพ' }
            ].map(field => (
              <label key={field.key} className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customFields[field.key as keyof typeof customFields]}
                  onChange={(e) => setCustomFields(prev => ({
                    ...prev,
                    [field.key]: e.target.checked
                  }))}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-700">{field.label}</div>
                  <div className="text-xs text-gray-500">{field.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Export Summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">จำนวนรายการ:</span>
            <div className="font-semibold">{getExportCount()} รายการ</div>
          </div>
          <div>
            <span className="text-gray-600">รูปแบบ:</span>
            <div className="font-semibold">{exportFormat.toUpperCase()}</div>
          </div>
          <div>
            <span className="text-gray-600">ขนาดไฟล์ (โดยประมาณ):</span>
            <div className="font-semibold">{getEstimatedFileSize()}</div>
          </div>
          <div>
            <span className="text-gray-600">วันที่ส่งออก:</span>
            <div className="font-semibold">{new Date().toLocaleDateString('th-TH')}</div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={loading || getExportCount() === 0}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
          loading || getExportCount() === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-indigo-500 text-white hover:bg-indigo-600'
        }`}
      >
        {loading ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            กำลังส่งออก...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ส่งออกข้อมูล
          </>
        )}
      </button>

      {getExportCount() === 0 && (
        <p className="text-sm text-red-500 mt-2 text-center">
          ไม่มีข้อมูลสำหรับส่งออก
        </p>
      )}

      {/* Usage Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 คำแนะนำการใช้งาน</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• <strong>JSON:</strong> เหมาะสำหรับนักพัฒนา หรือการนำเข้าระบบอื่น</li>
          <li>• <strong>CSV:</strong> เปิดใน Excel หรือ Google Sheets ได้</li>
          <li>• <strong>Excel:</strong> รองรับภาษาไทยเต็มรูปแบบ</li>
          <li>• ควรสำรองข้อมูลเป็นประจำเพื่อป้องกันการสูญหาย</li>
        </ul>
      </div>
    </div>
  )
}
