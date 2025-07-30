'use client'

import { useState, useEffect } from 'react'
import { X, History, User, Calendar, FileText, Edit3, Plus } from 'lucide-react'

interface EditLogModalProps {
  isOpen: boolean
  onClose: () => void
  carId: string
}

interface EditLog {
  id: string
  action: string
  field_name: string
  old_value: string
  new_value: string
  user_name: string
  user_email: string
  created_at: string
  ip_address?: string
}

export default function EditLogModal({ isOpen, onClose, carId }: EditLogModalProps) {
  const [logs, setLogs] = useState<EditLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && carId) {
      fetchEditLogs()
    }
  }, [isOpen, carId])

  const fetchEditLogs = async () => {
    setLoading(true)
    
    try {
      // TODO: Replace with actual API call when edit-logs API is implemented
      // For now, show mock data
      const mockLogs: EditLog[] = [
        {
          id: '1',
          action: 'UPDATE',
          field_name: 'status',
          old_value: 'กำลังหา',
          new_value: 'ซื้อแล้ว',
          user_name: 'สมชาย ใจดี',
          user_email: 'somchai@example.com',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          ip_address: '192.168.1.100'
        },
        {
          id: '2',
          action: 'UPDATE',
          field_name: 'additional_expenses',
          old_value: '[]',
          new_value: '[{"description":"ซ่อมเครื่องยนต์","amount":15000}]',
          user_name: 'สมหญิง รักษ์ดี',
          user_email: 'somying@example.com',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          ip_address: '192.168.1.101'
        },
        {
          id: '3',
          action: 'CREATE',
          field_name: 'car',
          old_value: '',
          new_value: 'สร้างรถใหม่',
          user_name: 'สมชาย ใจดี',
          user_email: 'somchai@example.com',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          ip_address: '192.168.1.100'
        }
      ]
      
      setLogs(mockLogs)
    } catch (error) {
      console.error('Error fetching edit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <Plus className="w-4 h-4 text-green-600" />
        </div>
      case 'UPDATE':
        return <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Edit3 className="w-4 h-4 text-blue-600" />
        </div>
      case 'DELETE':
        return <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <X className="w-4 h-4 text-red-600" />
        </div>
      default:
        return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <FileText className="w-4 h-4 text-gray-600" />
        </div>
    }
  }

  const getActionText = (action: string, fieldName: string, oldValue: string, newValue: string) => {
    switch (action) {
      case 'CREATE':
        return 'สร้างรถใหม่'
      case 'UPDATE':
        if (fieldName === 'status') {
          return `เปลี่ยนสถานะจาก "${oldValue}" เป็น "${newValue}"`
        } else if (fieldName === 'additional_expenses') {
          return 'เพิ่มค่าใช้จ่ายใหม่'
        } else if (fieldName === 'sell_price') {
          return `เปลี่ยนราคาขายจาก ${formatCurrency(parseFloat(oldValue))} เป็น ${formatCurrency(parseFloat(newValue))}`
        } else {
          return `แก้ไข ${fieldName}`
        }
      case 'DELETE':
        return `ลบ ${fieldName}`
      default:
        return 'ดำเนินการ'
    }
  }

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return 'N/A'
    return new Intl.NumberFormat('th-TH').format(amount) + ' บาท'
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} วันที่แล้ว`
    } else if (diffHours > 0) {
      return `${diffHours} ชั่วโมงที่แล้ว`
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return `${diffMins} นาทีที่แล้ว`
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">ประวัติการแก้ไข</h2>
              <p className="text-sm text-gray-600">ติดตามการเปลี่ยนแปลงของรถคันนี้</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">กำลังโหลดประวัติ...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">ยังไม่มีประวัติการแก้ไข</h3>
              <p className="text-gray-400">เมื่อมีการแก้ไขข้อมูลจะแสดงที่นี่</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={log.id} className="relative">
                  {/* Timeline line */}
                  {index < logs.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                  
                  {/* Log entry */}
                  <div className="flex space-x-4">
                    {getActionIcon(log.action)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {getActionText(log.action, log.field_name, log.old_value, log.new_value)}
                            </h4>
                            
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <User className="w-3 h-3" />
                                <span>{log.user_name}</span>
                                <span className="text-gray-400">({log.user_email})</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDateTime(log.created_at)}</span>
                                <span className="text-gray-400">
                                  ({new Date(log.created_at).toLocaleString('th-TH')})
                                </span>
                              </div>
                              
                              {log.ip_address && (
                                <div className="text-xs text-gray-400">
                                  IP: {log.ip_address}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              📝 ระบบบันทึกการแก้ไขทุกครั้งเพื่อความโปร่งใส
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
