'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import supabase from '@/lib/supabaseClient'

export default function Navbar() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-orange-100 via-orange-50 to-peach-50 backdrop-blur-md border-b border-orange-200/20 shadow-lg shadow-orange-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 group">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-3 text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent hover:from-orange-500 hover:to-orange-400 transition-all duration-300 transform group-hover:scale-105"
            >
              <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:rotate-3">
                <span className="text-white text-lg">💰</span>
              </div>
              <span className="hidden sm:inline font-semibold tracking-tight">
                Broker<span className="text-orange-400">Pro</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/dashboard" icon="🏠" text="หน้าแรก" />
            <NavLink href="/income" icon="💰" text="รายรับ" />
            <NavLink href="/expense" icon="💸" text="รายจ่าย" />
            <NavLink href="/records" icon="📄" text="รายการ" />
            <NavLink href="/report" icon="📊" text="รายงาน" />
            <NavLink href="/settings" icon="⚙️" text="ตั้งค่า" />
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="ml-4 group relative px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center space-x-2">
                <span>{isLoggingOut ? '⏳' : '🚪'}</span>
                <span className="hidden lg:inline">{isLoggingOut ? 'กำลังออก...' : 'ออกจากระบบ'}</span>
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative p-2 bg-gradient-to-br from-orange-200 to-orange-300 rounded-xl text-orange-700 hover:bg-gradient-to-br hover:from-orange-300 hover:to-orange-400 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">เปิดเมนูหลัก</span>
              <div className="w-6 h-6 relative">
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6 transition-transform duration-300 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-orange-200 shadow-xl shadow-orange-100/50 animate-fade-in">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <MobileNavLink href="/dashboard" icon="🏠" text="หน้าแรก" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink href="/income" icon="💰" text="รายรับ" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink href="/expense" icon="💸" text="รายจ่าย" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink href="/records" icon="📄" text="รายการย้อนหลัง" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink href="/report" icon="📊" text="รายงาน" onClick={() => setIsMobileMenuOpen(false)} />
            <MobileNavLink href="/settings" icon="⚙️" text="ตั้งค่า" onClick={() => setIsMobileMenuOpen(false)} />
            
            <div className="pt-2 border-t border-orange-200">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full text-left flex items-center space-x-3 px-4 py-3 text-base font-medium bg-gradient-to-r from-red-400 to-red-500 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-200 disabled:opacity-50"
              >
                <span>{isLoggingOut ? '⏳' : '🚪'}</span>
                <span>{isLoggingOut ? 'กำลังออก...' : 'ออกจากระบบ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

// Desktop Navigation Link Component
function NavLink({ href, icon, text }: { href: string; icon: string; text: string }) {
  return (
    <Link 
      href={href}
      className="group relative px-4 py-2 text-sm font-medium text-orange-700 hover:text-orange-600 transition-all duration-300 rounded-xl hover:bg-white/60 hover:shadow-md hover:shadow-orange-100 hover:scale-105"
    >
      <span className="flex items-center space-x-2">
        <span className="text-base transition-transform duration-300 group-hover:scale-110">{icon}</span>
        <span className="hidden lg:inline">{text}</span>
      </span>
      
      {/* Subtle hover background */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-100 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
      
      {/* Bottom border indicator */}
      <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 group-hover:w-3/4 group-hover:left-1/8 transition-all duration-300 rounded-full"></div>
    </Link>
  )
}

// Mobile Navigation Link Component
function MobileNavLink({ href, icon, text, onClick }: { href: string; icon: string; text: string; onClick: () => void }) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-orange-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-xl transition-all duration-300 hover:shadow-md hover:shadow-orange-100"
    >
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </Link>
  )
}
