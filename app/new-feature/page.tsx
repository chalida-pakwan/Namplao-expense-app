'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabaseClient'
import PDFExportComponent from '@/components/PDFExportComponent'
import RoleManagement, { usePermissions } from '@/components/RoleManagement'
import FileUpload from '@/components/FileUpload'
import AdvancedCharts, { ProfitAnalysisChart, InvestmentDistributionChart } from '@/components/AdvancedCharts'
import AuditTrail, { useAuditLog } from '@/components/AuditTrail'
import NotificationSystem from '@/components/NotificationSystem'
import { Toaster } from 'react-hot-toast'

export default function AdvancedFeaturesPage() {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const { createAuditLog } = useAuditLog()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Sample data for charts
  const [profitData, setProfitData] = useState([
    { month: 'ม.ค.', profit: 50000 },
    { month: 'ก.พ.', profit: 75000 },
    { month: 'มี.ค.', profit: 60000 },
    { month: 'เม.ย.', profit: 90000 },
    { month: 'พ.ค.', profit: 120000 },
    { month: 'มิ.ย.', profit: 85000 },
  ])

  const [investmentData, setInvestmentData] = useState([
    { name: 'รถยนต์', amount: 2500000 },
    { name: 'อสังหาริมทรัพย์', amount: 1800000 },
    { name: 'หุ้น', amount: 800000 },
    { name: 'เงินฝาก', amount: 500000 },
  ])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch sample data - you can replace with actual data fetching
      const { data: incomeData } = await supabase
        .from('income')
        .select('*')
        .limit(10)

      const { data: expenseData } = await supabase
        .from('expense')
        .select('*')
        .limit(10)

      setData([...(incomeData || []), ...(expenseData || [])])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = data.filter(item => 
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.amount?.toString().includes(searchTerm)
  )

  const tabs = [
    { id: 'dashboard', name: '📊 Dashboard', permission: 'read' },
    { id: 'pdf', name: '📄 PDF Export', permission: 'export_data' },
    { id: 'roles', name: '👥 จัดการสิทธิ์', permission: 'manage_users' },
    { id: 'files', name: '📁 ไฟล์', permission: 'write' },
    { id: 'charts', name: '📈 กราฟวิเคราะห์', permission: 'read' },
    { id: 'audit', name: '📋 ประวัติ', permission: 'read' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-24 text-gray-800 bg-gray-50 min-h-screen">
      <Toaster />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#FF8A5C] flex items-center gap-2">
            ✨ ระบบจัดการขั้นสูง
          </h1>
          <p className="text-gray-600 mt-1">
            จัดการทุกฟีเจอร์ขั้นสูงในที่เดียว
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationSystem />
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← กลับ Dashboard
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 ค้นหาข้อมูล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            hasPermission(tab.permission) && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-orange-50'
                }`}
              >
                {tab.name}
              </button>
            )
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Summary Cards */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">📊 สรุปรวม</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>รายการทั้งหมด:</span>
                  <span className="font-semibold">{data.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>รายการที่ค้นหา:</span>
                  <span className="font-semibold">{filteredData.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">⚡ การดำเนินการด่วน</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveTab('pdf')}
                  className="w-full text-left px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
                >
                  📄 ส่งออก PDF
                </button>
                <button 
                  onClick={() => setActiveTab('files')}
                  className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  📁 อัปโหลดไฟล์
                </button>
                <button 
                  onClick={() => setActiveTab('charts')}
                  className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100"
                >
                  📈 ดูกราฟ
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">🔄 กิจกรรมล่าสุด</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>✅</span>
                  <span>ระบบเริ่มทำงาน</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📊</span>
                  <span>โหลดข้อมูล {data.length} รายการ</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pdf' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">📄 ส่งออก PDF</h3>
            <PDFExportComponent 
              data={filteredData}
              title="รายงานข้อมูล"
              type="report"
            />
            
            {/* Data Table for PDF Export */}
            <div id="data-table" className="mt-6 overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">รายการ</th>
                    <th className="px-4 py-2 text-left">จำนวน</th>
                    <th className="px-4 py-2 text-left">วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 10).map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{item.description || 'ไม่ระบุ'}</td>
                      <td className="px-4 py-2">{item.amount?.toLocaleString() || '0'} บาท</td>
                      <td className="px-4 py-2">{item.date ? new Date(item.date).toLocaleDateString('th-TH') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <RoleManagement />
        )}

        {activeTab === 'files' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">📁 จัดการไฟล์</h3>
            <FileUpload 
              onFileUploaded={(path, url) => {
                console.log('File uploaded:', path, url)
                createAuditLog('files', path, 'INSERT', null, { path, url }, 'อัปโหลดไฟล์ใหม่')
              }}
              multiple={true}
              folder="advanced-features"
            />
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-6">
            <ProfitAnalysisChart data={profitData} />
            <InvestmentDistributionChart data={investmentData} />
          </div>
        )}

        {activeTab === 'audit' && (
          <AuditTrail limit={50} />
        )}
      </div>
    </div>
  )
}
