'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface JointCar {
  id: string
  date: string
  brand: string
  model: string
  year: number
  buy_price: number
  sell_price: number
  profit: number
  total_investment: number
  status: string
  investors: Array<{
    name: string
    amount: number
    share_percentage: number
  }>
  additional_expenses: Array<{
    description: string
    amount: number
    date: string
  }>
}

interface PDFExportProps {
  cars: JointCar[]
  selectedCars?: string[]
}

export default function PDFExport({ cars, selectedCars }: PDFExportProps) {
  const [loading, setLoading] = useState(false)
  const [exportType, setExportType] = useState<'summary' | 'detailed' | 'profit'>('summary')

  // กรองรถที่เลือก
  const getFilteredCars = () => {
    if (selectedCars && selectedCars.length > 0) {
      return cars.filter(car => selectedCars.includes(car.id))
    }
    return cars
  }

  // สร้าง PDF รายงานสรุป
  const generateSummaryPDF = () => {
    const doc = new jsPDF()
    const filteredCars = getFilteredCars()
    
    // ตั้งค่าฟอนต์ (ใช้ฟอนต์ที่รองรับภาษาไทย)
    doc.setFont('helvetica')
    
    // หัวข้อรายงาน
    doc.setFontSize(20)
    doc.text('รายงานสรุปการลงทุนร่วมซื้อรถ', 20, 20)
    
    doc.setFontSize(12)
    doc.text(`วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`, 20, 30)
    doc.text(`จำนวนรถทั้งหมด: ${filteredCars.length} คัน`, 20, 40)

    // สถิติสรุป
    const soldCars = filteredCars.filter(car => car.status === 'ขายแล้ว')
    const totalInvestment = soldCars.reduce((sum, car) => sum + car.total_investment, 0)
    const totalProfit = soldCars.reduce((sum, car) => sum + car.profit, 0)
    const profitMargin = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0

    doc.text(`รถที่ขายแล้ว: ${soldCars.length} คัน`, 20, 50)
    doc.text(`เงินลงทุนรวม: ${totalInvestment.toLocaleString()} บาท`, 20, 60)
    doc.text(`กำไรรวม: ${totalProfit.toLocaleString()} บาท`, 20, 70)
    doc.text(`อัตรากำไร: ${profitMargin.toFixed(2)}%`, 20, 80)

    // ตารางข้อมูลรถ
    const tableData = filteredCars.map(car => [
      car.brand + ' ' + car.model,
      car.year.toString(),
      car.buy_price.toLocaleString(),
      car.sell_price.toLocaleString(),
      car.profit.toLocaleString(),
      car.status
    ])

    autoTable(doc, {
      head: [['รถ', 'ปี', 'ราคาซื้อ', 'ราคาขาย', 'กำไร', 'สถานะ']],
      body: tableData,
      startY: 90,
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [255, 165, 0],
        textColor: [255, 255, 255]
      }
    })

    return doc
  }

  // สร้าง PDF รายงานละเอียด
  const generateDetailedPDF = () => {
    const doc = new jsPDF()
    const filteredCars = getFilteredCars()
    
    doc.setFontSize(20)
    doc.text('รายงานรายละเอียดการลงทุนร่วมซื้อรถ', 20, 20)
    
    let yPosition = 40

    filteredCars.forEach((car, index) => {
      // ตรวจสอบว่าต้องขึ้นหน้าใหม่หรือไม่
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      // ข้อมูลรถ
      doc.setFontSize(14)
      doc.text(`${index + 1}. ${car.brand} ${car.model} (${car.year})`, 20, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.text(`วันที่: ${new Date(car.date).toLocaleDateString('th-TH')}`, 20, yPosition)
      doc.text(`สถานะ: ${car.status}`, 100, yPosition)
      yPosition += 8

      doc.text(`ราคาซื้อ: ${car.buy_price.toLocaleString()} บาท`, 20, yPosition)
      doc.text(`ราคาขาย: ${car.sell_price.toLocaleString()} บาท`, 100, yPosition)
      yPosition += 8

      doc.text(`กำไร: ${car.profit.toLocaleString()} บาท`, 20, yPosition)
      yPosition += 10

      // ผู้ลงทุน
      if (car.investors && car.investors.length > 0) {
        doc.text('ผู้ลงทุน:', 20, yPosition)
        yPosition += 6

        car.investors.forEach(investor => {
          doc.text(`- ${investor.name}: ${investor.amount.toLocaleString()} บาท (${investor.share_percentage}%)`, 25, yPosition)
          yPosition += 6
        })
        yPosition += 4
      }

      // ค่าใช้จ่ายเพิ่มเติม
      if (car.additional_expenses && car.additional_expenses.length > 0) {
        doc.text('ค่าใช้จ่ายเพิ่มเติม:', 20, yPosition)
        yPosition += 6

        car.additional_expenses.forEach(expense => {
          doc.text(`- ${expense.description}: ${expense.amount.toLocaleString()} บาท`, 25, yPosition)
          yPosition += 6
        })
      }

      yPosition += 10
    })

    return doc
  }

  // สร้าง PDF รายงานกำไร
  const generateProfitPDF = () => {
    const doc = new jsPDF()
    const filteredCars = getFilteredCars().filter(car => car.status === 'ขายแล้ว')
    
    doc.setFontSize(20)
    doc.text('รายงานการแบ่งกำไร', 20, 20)
    
    doc.setFontSize(12)
    doc.text(`วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`, 20, 30)

    let yPosition = 50

    filteredCars.forEach((car, index) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.text(`${index + 1}. ${car.brand} ${car.model}`, 20, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.text(`กำไรรวม: ${car.profit.toLocaleString()} บาท`, 20, yPosition)
      yPosition += 10

      // ตารางการแบ่งกำไร
      if (car.investors && car.investors.length > 0) {
        const profitData = car.investors.map(investor => {
          const profitShare = (car.profit * investor.share_percentage) / 100
          return [
            investor.name,
            investor.share_percentage + '%',
            profitShare.toLocaleString() + ' บาท'
          ]
        })

        autoTable(doc, {
          head: [['ผู้ลงทุน', 'สัดส่วน', 'กำไรที่ได้รับ']],
          body: profitData,
          startY: yPosition,
          styles: {
            fontSize: 9,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [34, 197, 94],
            textColor: [255, 255, 255]
          },
          margin: { left: 20, right: 20 }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 15
      }
    })

    return doc
  }

  // ส่งออก PDF
  const exportPDF = async () => {
    setLoading(true)
    
    try {
      let doc: jsPDF
      let filename: string

      switch (exportType) {
        case 'summary':
          doc = generateSummaryPDF()
          filename = `สรุปการลงทุนรถ_${new Date().toISOString().split('T')[0]}.pdf`
          break
        case 'detailed':
          doc = generateDetailedPDF()
          filename = `รายละเอียดการลงทุนรถ_${new Date().toISOString().split('T')[0]}.pdf`
          break
        case 'profit':
          doc = generateProfitPDF()
          filename = `รายงานการแบ่งกำไร_${new Date().toISOString().split('T')[0]}.pdf`
          break
        default:
          doc = generateSummaryPDF()
          filename = `รายงานการลงทุนรถ_${new Date().toISOString().split('T')[0]}.pdf`
      }

      doc.save(filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('เกิดข้อผิดพลาดในการส่งออก PDF')
    } finally {
      setLoading(false)
    }
  }

  const getExportCount = () => {
    const filtered = getFilteredCars()
    return filtered.length
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📄 ส่งออกรายงาน PDF</h3>
      
      {/* เลือกประเภทรายงาน */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ประเภทรายงาน
        </label>
        <select
          value={exportType}
          onChange={(e) => setExportType(e.target.value as 'summary' | 'detailed' | 'profit')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="summary">📊 รายงานสรุป</option>
          <option value="detailed">📋 รายงานละเอียด</option>
          <option value="profit">💰 รายงานการแบ่งกำไร</option>
        </select>
      </div>

      {/* รายละเอียดรายงาน */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between items-center mb-2">
            <span>จำนวนรถที่จะส่งออก:</span>
            <span className="font-semibold">{getExportCount()} คัน</span>
          </div>
          
          <div className="text-xs text-gray-500">
            {exportType === 'summary' && 'รายงานสรุปพร้อมสถิติและตารางข้อมูลพื้นฐาน'}
            {exportType === 'detailed' && 'รายงานรายละเอียดทุกคัน พร้อมข้อมูลผู้ลงทุนและค่าใช้จ่าย'}
            {exportType === 'profit' && 'รายงานการแบ่งกำไรสำหรับรถที่ขายแล้วเท่านั้น'}
          </div>
        </div>
      </div>

      {/* ปุ่มส่งออก */}
      <button
        onClick={exportPDF}
        disabled={loading || getExportCount() === 0}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
          loading || getExportCount() === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
      >
        {loading ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            กำลังสร้าง PDF...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ส่งออก PDF
          </>
        )}
      </button>

      {getExportCount() === 0 && (
        <p className="text-sm text-red-500 mt-2 text-center">
          ไม่มีข้อมูลรถสำหรับส่งออก
        </p>
      )}
    </div>
  )
}

// Component สำหรับการพิมพ์รายงาน
export function PrintReport({ cars, selectedCars }: PDFExportProps) {
  const handlePrint = () => {
    window.print()
  }

  const filteredCars = selectedCars && selectedCars.length > 0 
    ? cars.filter(car => selectedCars.includes(car.id))
    : cars

  return (
    <div className="print:block hidden">
      <div className="print:p-8">
        <h1 className="text-2xl font-bold mb-4">รายงานการลงทุนร่วมซื้อรถ</h1>
        <p className="mb-4">วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}</p>
        
        {filteredCars.map((car, index) => (
          <div key={car.id} className="mb-6 border-b pb-4">
            <h3 className="text-lg font-semibold">{index + 1}. {car.brand} {car.model}</h3>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
              <div>ราคาซื้อ: {car.buy_price.toLocaleString()} บาท</div>
              <div>ราคาขาย: {car.sell_price.toLocaleString()} บาท</div>
              <div>กำไร: {car.profit.toLocaleString()} บาท</div>
              <div>สถานะ: {car.status}</div>
            </div>
            
            {car.investors && car.investors.length > 0 && (
              <div className="mt-2">
                <strong>ผู้ลงทุน:</strong>
                <ul className="text-sm mt-1">
                  {car.investors.map((investor, idx) => (
                    <li key={idx}>
                      - {investor.name}: {investor.amount.toLocaleString()} บาท ({investor.share_percentage}%)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
