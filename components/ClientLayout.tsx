'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './Navbar'
import Footer from './Footer'  
// import BottomNav from './BottomNav'
import ErrorBoundary from './ErrorBoundary'
import supabase from '@/lib/supabaseClient'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // หน้าที่ไม่ต้องแสดง Navbar, Footer และ BottomNav
  const publicPages = ['/auth', '/login', '/test', '/create-test-user', '/']
  const isPublicPage = pathname ? publicPages.includes(pathname) : false
  
  // เปิดใช้งาน authentication check
  const shouldShowNavbar = !isPublicPage && isAuthenticated
  const shouldShowFooter = !isPublicPage && isAuthenticated
  const shouldShowBottomNav = !isPublicPage && isAuthenticated

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth check error:', error)
          setIsAuthenticated(false)
        } else if (session) {
          console.log('✅ User authenticated:', session.user?.email)
          setIsAuthenticated(true)
        } else {
          console.log('❌ No session found')
          setIsAuthenticated(false)
          
          // Redirect ไปหน้า auth สำหรับหน้าที่ต้อง authentication
          if (!isPublicPage) {
            console.log('Redirecting to /auth from:', pathname)
            router.push('/auth')
            return
          }
        }
      } catch (error) {
        console.error('Auth check exception:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // ฟัง auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true)
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        router.push('/auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router, isPublicPage])

  // แสดง loading ขณะตรวจสอบ auth
  if (isLoading && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="relative mb-8">
            {/* Loading Spinner */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-orange-100 border-t-transparent animate-pulse mx-auto"></div>
            
            {/* Logo in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-orange-800 mb-2">BrokerPro</h2>
          <p className="text-orange-700 font-medium mb-1">กำลังตรวจสอบการเข้าสู่ระบบ</p>
          <p className="text-orange-600 text-sm">โปรดรอสักครู่...</p>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        {/* Navbar - Semantic Header */}
        {shouldShowNavbar && (
          <header role="banner" className="flex-shrink-0">
            <Navbar />
          </header>
        )}
        
        {/* Main Content Area */}
        <main 
          className={`flex-1 ${shouldShowNavbar ? 'pt-0' : ''} ${shouldShowBottomNav ? 'pb-20 md:pb-0' : ''}`}
          role="main"
          aria-label="เนื้อหาหลัก"
        >
          <div className={`
            min-h-full
            ${shouldShowNavbar ? 'bg-gradient-to-br from-gray-50 to-orange-25' : ''}
          `}>
            {/* Container for better content width management */}
            <div className="w-full">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </div>
        </main>
        
        {/* Footer - Semantic Footer */}
        {shouldShowFooter && (
          <footer role="contentinfo" className="flex-shrink-0 mt-auto">
            <Footer />
          </footer>
        )}
        
        {/* Mobile Bottom Navigation */}
        {/* {shouldShowBottomNav && <BottomNav />} */}
        
        {/* React Hot Toast */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Default options for all toasts
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '8px',
              padding: '12px 16px',
              maxWidth: '400px'
            },
            // Success
            success: {
              duration: 6000,
              style: {
                background: '#10B981',
                color: '#fff'
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10B981'
              }
            },
            // Error
            error: {
              duration: 6000,
              style: {
                background: '#EF4444',
                color: '#fff'
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#EF4444'
              }
            }
          }}
        />
      </div>
    </ErrorBoundary>
  )
}
