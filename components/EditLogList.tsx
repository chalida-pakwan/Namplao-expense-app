import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Clock, User, Edit3, Save, AlertTriangle } from 'lucide-react'

interface EditLog {
  id: string
  car_id: string
  user_id: string
  user_name: string
  user_email: string
  action: string
  field_changed: string
  old_value: string | null
  new_value: string | null
  timestamp: string
  description: string
}

interface EditLogListProps {
  carId: string
}

const EditLogList: React.FC<EditLogListProps> = ({ carId }) => {
  const [logs, setLogs] = useState<EditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchEditLogs()
  }, [carId])

  const fetchEditLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      // สำหรับตอนนี้ใช้ mock data เพราะยังไม่มีตาราง edit_logs ในฐานข้อมูล
      // ในอนาคตจะแทนที่ด้วย Supabase query จริง
      const mockLogs: EditLog[] = [
        {
          id: '1',
          car_id: carId,
          user_id: 'user1',
          user_name: 'สมชาย ใจดี',
          user_email: 'somchai@example.com',
          action: 'UPDATE',
          field_changed: 'status',
          old_value: 'กำลังหา',
          new_value: 'ซื้อแล้ว',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'เปลี่ยนสถานะจาก "กำลังหา" เป็น "ซื้อแล้ว"'
        },
        {
          id: '2',
          car_id: carId,
          user_id: 'user2',
          user_name: 'สมหญิง ดีใจ',
          user_email: 'somying@example.com',
          action: 'UPDATE',
          field_changed: 'buy_price',
          old_value: '450000',
          new_value: '480000',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'แก้ไขราคาซื้อจาก 450,000 บาท เป็น 480,000 บาท'
        },
        {
          id: '3',
          car_id: carId,
          user_id: 'user1',
          user_name: 'สมชาย ใจดี',
          user_email: 'somchai@example.com',
          action: 'CREATE',
          field_changed: 'car',
          old_value: null,
          new_value: 'ข้อมูลรถใหม่',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'สร้างข้อมูลรถใหม่'
        },
        {
          id: '4',
          car_id: carId,
          user_id: 'user3',
          user_name: 'สมปอง รักใสใส',
          user_email: 'sompong@example.com',
          action: 'UPDATE',
          field_changed: 'sell_price',
          old_value: '520000',
          new_value: '550000',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'แก้ไขราคาขายจาก 520,000 บาท เป็น 550,000 บาท'
        }
      ]

      // เรียงลำดับตามเวลา (ใหม่สุดก่อน)
      const sortedLogs = mockLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      setLogs(sortedLogs)
    } catch (err) {
      console.error('Error fetching edit logs:', err)
      setError('ไม่สามารถโหลดประวัติการแก้ไขได้')
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Save className="w-4 h-4 text-green-500" />
      case 'UPDATE':
        return <Edit3 className="w-4 h-4 text-blue-500" />
      case 'DELETE':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Edit3 className="w-4 h-4 text-gray-500" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const formatValue = (value: string | null) => {
    if (value === null) return '-'
    
    // ตรวจสอบว่าเป็นตัวเลข (ราคา)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 1000) {
      return numValue.toLocaleString() + ' บาท'
    }
    
    return value
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-gray-600">กำลังโหลดประวัติ...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchEditLogs}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">ยังไม่มีประวัติการแก้ไข</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {logs.map((log, index) => {
        const { date, time } = formatDateTime(log.timestamp)
        
        return (
          <div key={log.id} className="relative">
            {/* Timeline line */}
            {index < logs.length - 1 && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
            )}
            
            <div className="flex gap-4">
              {/* Timeline dot */}
              <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                {getActionIcon(log.action)}
              </div>
              
              {/* Content */}
              <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getActionColor(log.action)}`}>
                      {log.action === 'CREATE' ? 'สร้าง' : log.action === 'UPDATE' ? 'แก้ไข' : 'ลบ'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{log.description}</span>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{date}</div>
                    <div>{time}</div>
                  </div>
                </div>
                
                {/* User info */}
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    โดย: <span className="font-medium">{log.user_name}</span>
                    {log.user_email && (
                      <span className="text-gray-500"> ({log.user_email})</span>
                    )}
                  </span>
                </div>
                
                {/* Changes */}
                {log.field_changed && log.field_changed !== 'car' && (
                  <div className="bg-white rounded p-3 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">การเปลี่ยนแปลง:</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                        เดิม: {formatValue(log.old_value)}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        ใหม่: {formatValue(log.new_value)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
      
      {/* Footer */}
      <div className="text-center py-4 text-xs text-gray-500 border-t border-gray-200">
        แสดงประวัติการแก้ไขทั้งหมด {logs.length} รายการ
      </div>
    </div>
  )
}

export default EditLogList
