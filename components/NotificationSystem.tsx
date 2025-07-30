'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Notification {
  id: string
  car_id: string
  investor_name: string
  amount_owed: number
  type: 'profit_share' | 'expense_share' | 'reminder'
  message: string
  created_at: string
  read: boolean
  due_date?: string
  car_brand?: string
  car_model?: string
}

interface NotificationSystemProps {
  userId?: string
  className?: string
}

export default function NotificationSystem({ userId, className = '' }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchNotifications()
    
    // ตั้งค่าการอัปเดตแบบ real-time
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'joint_car_notifications' 
        }, 
        () => fetchNotifications()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('joint_car_notifications')
        .select(`
          *,
          joint_cars (
            brand,
            model
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      const formattedNotifications = data?.map(notif => ({
        ...notif,
        car_brand: notif.joint_cars?.brand,
        car_model: notif.joint_cars?.model
      })) || []

      setNotifications(formattedNotifications)
      setUnreadCount(formattedNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('joint_car_notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      
      const { error } = await supabase
        .from('joint_car_notifications')
        .update({ read: true })
        .in('id', unreadIds)

      if (error) throw error

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('joint_car_notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'profit_share': return '💰'
      case 'expense_share': return '💸'
      case 'reminder': return '⏰'
      default: return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'profit_share': return 'text-green-600 bg-green-50'
      case 'expense_share': return 'text-red-600 bg-red-50'
      case 'reminder': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`relative ${className}`}>
      {/* ปุ่มแจ้งเตือน */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-3.5-3.5a8.38 8.38 0 01-.9-1.4A8 8 0 1112 4v0a8 8 0 016.1 12.9l-.6.6L15 17z" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* แผงแจ้งเตือน */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* หัวข้อ */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">🔔 แจ้งเตือน</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-orange-600 hover:text-orange-700"
                >
                  อ่านทั้งหมด
                </button>
              )}
            </div>
          </div>

          {/* รายการแจ้งเตือน */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                กำลังโหลด...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="text-2xl mb-2">🔕</div>
                <p>ไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                      <span className="text-sm">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.message}
                          </p>
                          
                          {notification.car_brand && (
                            <p className="text-xs text-gray-500 mt-1">
                              รถ: {notification.car_brand} {notification.car_model}
                            </p>
                          )}
                          
                          {notification.amount_owed > 0 && (
                            <p className="text-xs font-medium text-green-600 mt-1">
                              จำนวน: {notification.amount_owed.toLocaleString()} บาท
                            </p>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                        
                        <div className="flex space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700 text-xs"
                              title="ทำเครื่องหมายว่าอ่านแล้ว"
                            >
                              ✓
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700 text-xs"
                            title="ลบ"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ปุ่มดูทั้งหมด */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                ปิด
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ฟังก์ชันสำหรับสร้างการแจ้งเตือนใหม่
export async function createNotification(
  carId: string,
  investorName: string,
  type: 'profit_share' | 'expense_share' | 'reminder',
  message: string,
  amountOwed: number = 0,
  dueDate?: string
) {
  const supabase = createClientComponentClient()
  
  try {
    const { data, error } = await supabase
      .from('joint_car_notifications')
      .insert({
        car_id: carId,
        investor_name: investorName,
        type,
        message,
        amount_owed: amountOwed,
        due_date: dueDate,
        read: false
      })
      .select()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

// ฟังก์ชันสำหรับสร้างการแจ้งเตือนการแบ่งกำไร
export async function createProfitShareNotifications(
  carId: string,
  investors: Array<{ name: string; amount: number; share_percentage: number }>,
  totalProfit: number
) {
  const promises = investors.map(investor => {
    const shareAmount = (totalProfit * investor.share_percentage) / 100
    const message = `🎉 มีกำไรจากการขายรถให้แบ่ง! คุณได้รับ ${shareAmount.toLocaleString()} บาท (${investor.share_percentage}%)`
    
    return createNotification(
      carId,
      investor.name,
      'profit_share',
      message,
      shareAmount
    )
  })

  return Promise.all(promises)
}

// ฟังก์ชันสำหรับสร้างการแจ้งเตือนค่าใช้จ่ายเพิ่มเติม
export async function createExpenseShareNotifications(
  carId: string,
  investors: Array<{ name: string; share_percentage: number }>,
  expenseAmount: number,
  expenseDescription: string
) {
  const promises = investors.map(investor => {
    const shareAmount = (expenseAmount * investor.share_percentage) / 100
    const message = `💸 มีค่าใช้จ่ายเพิ่มเติม: ${expenseDescription} คุณต้องจ่าย ${shareAmount.toLocaleString()} บาท (${investor.share_percentage}%)`
    
    return createNotification(
      carId,
      investor.name,
      'expense_share',
      message,
      shareAmount
    )
  })

  return Promise.all(promises)
}
