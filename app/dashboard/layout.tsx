import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'แดชบอร์ด | น้ำเปล่ารายรับรายจ่าย',
  description: 'ระบบจัดการรายรับรายจ่ายสำหรับนายหน้า ใช้งานง่าย รองรับมือถือ SEO ครบ',
  keywords: 'รายรับรายจ่าย, เว็บแอพนายหน้า, น้ำเปล่ารถสวย, ระบบการเงิน, คำนวณกำไร, เชียงใหม่',
  openGraph: {
    title: 'แดชบอร์ด | น้ำเปล่ารายรับรายจ่าย',
    description: 'ระบบจัดการรายรับรายจ่ายสำหรับนายหน้า ใช้งานง่าย รองรับมือถือ SEO ครบ',
    type: 'website',
    locale: 'th_TH',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'แดชบอร์ด | น้ำเปล่ารายรับรายจ่าย',
    description: 'ระบบจัดการรายรับรายจ่ายสำหรับนายหน้า ใช้งานง่าย รองรับมือถือ SEO ครบ',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
