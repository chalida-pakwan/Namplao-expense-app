'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: '📊 สรุปยอด', color: 'bg-gray-600' },
    { href: '/income', label: '➕ รายรับ', color: 'bg-green-600' },
    { href: '/expense', label: '➖ รายจ่าย', color: 'bg-red-600' },
    { href: '/records', label: '📄 ประวัติ', color: 'bg-purple-600' }
  ]

  // Don't show navigation on auth page
  if (pathname === '/auth') return null

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors
                ${item.color} hover:opacity-80
                ${pathname === item.href ? 'ring-2 ring-blue-300' : ''}
              `}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
