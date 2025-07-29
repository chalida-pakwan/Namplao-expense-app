'use client'

import { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service
      this.logErrorToService(error, errorInfo)
    }
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Implementation for error logging service
    console.log('Logging error to service:', { error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-200">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              
              {/* Error Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                เกิดข้อผิดพลาด
              </h1>
              
              {/* Error Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิดขึ้น 
                โปรดรีเฟรชหน้าเว็บหรือลองใหม่อีกครั้ง
              </p>
              
              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-red-600 hover:text-red-800 font-medium mb-2">
                    รายละเอียดข้อผิดพลาด (Development)
                  </summary>
                  <div className="bg-red-50 p-3 rounded-lg text-sm text-red-800 font-mono">
                    <p className="font-bold mb-1">Error:</p>
                    <p className="mb-2">{this.state.error.message}</p>
                    <p className="font-bold mb-1">Stack:</p>
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </details>
              )}
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  🔄 รีเฟรชหน้าเว็บ
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  ← กลับไปหน้าก่อนหน้า
                </button>
                
                <a
                  href="/"
                  className="block w-full text-center py-3 px-6 text-orange-600 hover:text-orange-800 font-medium transition-colors"
                >
                  🏠 กลับไปหน้าแรก
                </a>
              </div>
              
              {/* Contact Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  หากปัญหายังคงมีอยู่ โปรดติดต่อทีมสนับสนุน
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  📧 support@brokerpro.app
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
