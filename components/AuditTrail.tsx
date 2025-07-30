'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'

interface AuditLog {
  id: string
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_values: any
  new_values: any
  user_id: string
  user_email: string
  created_at: string
  description?: string
}

interface AuditTrailProps {
  recordId?: string
  tableName?: string
  limit?: number
}

export default function AuditTrail({ recordId, tableName, limit = 20 }: AuditTrailProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAuditLogs()
  }, [recordId, tableName])

  const fetchAuditLogs = async () => {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (recordId) {
        query = query.eq('record_id', recordId)
      }

      if (tableName) {
        query = query.eq('table_name', tableName)
      }

      const { data, error } = await query

      if (error) throw error

      setLogs(data || [])
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT':
        return '➕'
      case 'UPDATE':
        return '✏️'
      case 'DELETE':
        return '🗑️'
      default:
        return '📝'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'text-green-600 bg-green-50'
      case 'UPDATE':
        return 'text-blue-600 bg-blue-50'
      case 'DELETE':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'ไม่ระบุ'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
        📋 ประวัติการแก้ไข
      </h3>

      {logs.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          ไม่มีประวัติการแก้ไข
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-sm ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)} {log.action}
                  </span>
                  <span className="text-sm text-gray-600">
                    ตาราง: {log.table_name}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString('th-TH')}
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-2">
                ผู้ใช้: {log.user_email}
              </div>

              {log.description && (
                <div className="text-sm text-gray-700 mb-3">
                  {log.description}
                </div>
              )}

              {/* Show changes for UPDATE actions */}
              {log.action === 'UPDATE' && log.old_values && log.new_values && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">ค่าเดิม:</h4>
                    <div className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                      <pre className="whitespace-pre-wrap">
                        {formatValue(log.old_values)}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">ค่าใหม่:</h4>
                    <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                      <pre className="whitespace-pre-wrap">
                        {formatValue(log.new_values)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Show values for INSERT/DELETE actions */}
              {(log.action === 'INSERT' || log.action === 'DELETE') && (
                <div className="mt-3">
                  <h4 className="font-medium text-gray-700 mb-2">ข้อมูล:</h4>
                  <div className={`border rounded p-2 text-sm ${
                    log.action === 'INSERT' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <pre className="whitespace-pre-wrap">
                      {formatValue(log.new_values || log.old_values)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Hook to create audit logs
export const useAuditLog = () => {
  const createAuditLog = async (
    tableName: string,
    recordId: string,
    action: 'INSERT' | 'UPDATE' | 'DELETE',
    oldValues?: any,
    newValues?: any,
    description?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('No user found for audit log')
        return
      }

      const auditLog = {
        table_name: tableName,
        record_id: recordId,
        action,
        old_values: oldValues,
        new_values: newValues,
        user_id: user.id,
        user_email: user.email,
        description,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('audit_logs')
        .insert([auditLog])

      if (error) {
        console.error('Error creating audit log:', error)
      }

    } catch (error) {
      console.error('Error in createAuditLog:', error)
    }
  }

  return { createAuditLog }
}
