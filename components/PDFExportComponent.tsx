'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import supabase from '@/lib/supabaseClient'

interface PDFExportProps {
  data: any[]
  title: string
  type: 'income' | 'expense' | 'joint-cars' | 'report'
}

export default function PDFExportComponent({ data, title, type }: PDFExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = async () => {
    setIsExporting(true)
    
    try {
      const pdf = new jsPDF()
      
      // Add Thai font support (if needed)
      pdf.setFont('helvetica')
      
      // Header
      pdf.setFontSize(20)
      pdf.text(title, 20, 30)
      
      // Date
      pdf.setFontSize(12)
      pdf.text(`วันที่: ${new Date().toLocaleDateString('th-TH')}`, 20, 45)
      
      let yPosition = 60
      
      if (type === 'income' || type === 'expense') {
        // Income/Expense report
        pdf.setFontSize(14)
        pdf.text('รายละเอียด:', 20, yPosition)
        yPosition += 15
        
        let total = 0
        data.forEach((item, index) => {
          pdf.setFontSize(10)
          pdf.text(`${index + 1}. ${item.description || 'ไม่ระบุ'}`, 20, yPosition)
          pdf.text(`${item.amount.toLocaleString()} บาท`, 120, yPosition)
          pdf.text(new Date(item.date).toLocaleDateString('th-TH'), 160, yPosition)
          total += item.amount
          yPosition += 12
          
          if (yPosition > 270) {
            pdf.addPage()
            yPosition = 30
          }
        })
        
        // Total
        pdf.setFontSize(12)
        pdf.text(`รวม: ${total.toLocaleString()} บาท`, 20, yPosition + 10)
        
      } else if (type === 'joint-cars') {
        // Joint cars report
        data.forEach((car, index) => {
          if (index > 0) {
            pdf.addPage()
            yPosition = 30
          }
          
          pdf.setFontSize(14)
          pdf.text(`รถคันที่ ${index + 1}: ${car.brand} ${car.model}`, 20, yPosition)
          yPosition += 20
          
          pdf.setFontSize(10)
          pdf.text(`ปี: ${car.year}`, 20, yPosition)
          yPosition += 12
          pdf.text(`ราคาซื้อ: ${car.buy_price.toLocaleString()} บาท`, 20, yPosition)
          yPosition += 12
          pdf.text(`ราคาขาย: ${car.sell_price.toLocaleString()} บาท`, 20, yPosition)
          yPosition += 12
          pdf.text(`กำไร: ${car.profit.toLocaleString()} บาท`, 20, yPosition)
          yPosition += 12
          pdf.text(`สถานะ: ${car.status}`, 20, yPosition)
          yPosition += 20
          
          // Investors
          if (car.investors && car.investors.length > 0) {
            pdf.text('นักลงทุน:', 20, yPosition)
            yPosition += 12
            
            car.investors.forEach((investor: any) => {
              pdf.text(`- ${investor.name}: ${investor.amount.toLocaleString()} บาท (${investor.share_percentage}%)`, 25, yPosition)
              yPosition += 10
            })
          }
        })
      }
      
      // Save PDF
      const fileName = `${title}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('เกิดข้อผิดพลาดในการส่งออก PDF')
    } finally {
      setIsExporting(false)
    }
  }

  const exportTableToPDF = async (tableId: string) => {
    setIsExporting(true)
    
    try {
      const element = document.getElementById(tableId)
      if (!element) {
        throw new Error('Table element not found')
      }
      
      const canvas = await html2canvas(element)
      const imgData = canvas.toDataURL('image/png')
      
      const pdf = new jsPDF()
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      const fileName = `${title}_table_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error('Error exporting table to PDF:', error)
      alert('เกิดข้อผิดพลาดในการส่งออกตาราง PDF')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToPDF}
        disabled={isExporting}
        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            กำลังส่งออก...
          </>
        ) : (
          <>
            📄 ส่งออก PDF
          </>
        )}
      </button>
      
      <button
        onClick={() => exportTableToPDF('data-table')}
        disabled={isExporting}
        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        📊 ส่งออกตาราง PDF
      </button>
    </div>
  )
}
