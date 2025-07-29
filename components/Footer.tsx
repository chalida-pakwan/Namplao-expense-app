'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Footer() {
  const [currentYear] = useState(new Date().getFullYear())

  return (
    <footer className="bg-gradient-to-r from-orange-50 via-orange-25 to-peach-50 border-t border-orange-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-md">
                <span className="text-white text-lg">💰</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Broker<span className="text-orange-400">Pro</span>
              </h3>
            </div>
            <p className="text-orange-700/80 text-sm leading-relaxed mb-4">
              ระบบจัดการรายรับ-รายจ่ายสำหรับนายหน้าอสังหาริมทรัพย์ 
              ที่ทันสมัย ใช้งานง่าย และปลอดภัย
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              <SocialButton href="#" icon="📧" label="Email" />
              <SocialButton href="#" icon="📱" label="Line" />
              <SocialButton href="#" icon="📞" label="Phone" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-orange-800 font-semibold mb-4 text-sm uppercase tracking-wide">
              เมนูหลัก
            </h4>
            <nav className="space-y-2">
              <FooterLink href="/dashboard" icon="🏠" text="หน้าแรก" />
              <FooterLink href="/income" icon="💰" text="รายรับ" />
              <FooterLink href="/expense" icon="💸" text="รายจ่าย" />
              <FooterLink href="/records" icon="📄" text="รายการย้อนหลัง" />
            </nav>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-orange-800 font-semibold mb-4 text-sm uppercase tracking-wide">
              เครื่องมือ
            </h4>
            <nav className="space-y-2">
              <FooterLink href="/report" icon="📊" text="รายงานสรุป" />
              <FooterLink href="/settings" icon="⚙️" text="ตั้งค่า" />
              <FooterLink href="/test" icon="🧪" text="ทดสอบระบบ" />
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-orange-800 font-semibold mb-4 text-sm uppercase tracking-wide">
              ช่วยเหลือ
            </h4>
            <nav className="space-y-2">
              <FooterLink href="#" icon="📚" text="คู่มือการใช้งาน" />
              <FooterLink href="#" icon="❓" text="คำถามที่พบบ่อย" />
              <FooterLink href="#" icon="🛡️" text="นโยบายความเป็นส่วนตัว" />
              <FooterLink href="#" icon="📋" text="เงื่อนไขการใช้งาน" />
            </nav>
          </div>
        </div>

        {/* Separator */}
        <div className="mt-12 pt-8 border-t border-orange-200/50">
          <div className="md:flex md:items-center md:justify-between">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-orange-700/70 text-sm">
                © {currentYear} <span className="font-medium text-orange-600">BrokerPro</span>. 
                สร้างด้วย ❤️ สำหรับนายหน้าอสังหาริมทรัพย์
              </p>
            </div>

            {/* Tech Badge */}
            <div className="mt-4 md:mt-0 text-center md:text-right">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/60 rounded-full shadow-sm">
                <span className="text-xs text-orange-600 font-medium">Powered by</span>
                <TechBadge name="Next.js" />
                <TechBadge name="Supabase" />
                <TechBadge name="Tailwind" />
              </div>
            </div>
          </div>
        </div>

        {/* SEO Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "BrokerPro - แอพรายรับรายจ่ายสำหรับนายหน้า",
              "description": "ระบบจัดการรายรับ-รายจ่ายสำหรับนายหน้าอสังหาริมทรัพย์ที่ทันสมัย",
              "url": "https://brokerpro.app",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "THB"
              },
              "author": {
                "@type": "Organization",
                "name": "BrokerPro Team"
              }
            })
          }}
        />
      </div>
    </footer>
  )
}

// Footer Link Component
function FooterLink({ href, icon, text }: { href: string; icon: string; text: string }) {
  return (
    <Link 
      href={href}
      className="group flex items-center space-x-2 text-orange-700/80 hover:text-orange-600 transition-all duration-300 text-sm"
    >
      <span className="text-base transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      <span className="group-hover:translate-x-1 transition-transform duration-300">
        {text}
      </span>
    </Link>
  )
}

// Social Button Component
function SocialButton({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="group relative p-2 bg-white/60 hover:bg-white/80 rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-orange-100 hover:scale-110"
    >
      <span className="text-lg transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      
      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        {label}
      </div>
    </a>
  )
}

// Tech Badge Component
function TechBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors duration-300">
      {name}
    </span>
  )
}
