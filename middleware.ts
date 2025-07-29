import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// เส้นทางที่ต้องการป้องกัน
const protectedRoutes = ['/dashboard', '/income', '/expense', '/records', '/report', '/settings']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // ปิดการใช้งาน middleware ชั่วคราว เพื่อให้ ClientLayout จัดการแทน
  // ตรวจสอบว่าเป็นเส้นทางที่ต้องป้องกันหรือไม่
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  if (false && isProtectedRoute) { // ปิดการทำงานชั่วคราว
    // ตรวจสอบ Supabase cookies
    const cookies = request.cookies
    
    // Supabase ใช้ cookies ที่ขึ้นต้นด้วย sb-
    const supabaseCookies = Array.from(cookies.getAll())
      .filter(cookie => cookie.name.startsWith('sb-'))
    
    console.log('🍪 Available cookies:', supabaseCookies.map(c => c.name))
    
    // หาค้นหา access_token ใน cookies
    const hasValidSession = supabaseCookies.some(cookie => {
      try {
        if (cookie.name.includes('auth-token') && cookie.value) {
          const tokenData = JSON.parse(cookie.value)
          return tokenData.access_token && tokenData.expires_at > Date.now() / 1000
        }
      } catch (e) {
        // ถ้า parse ไม่ได้ ให้ดูว่ามี value อยู่ไหม
        return cookie.value && cookie.value.length > 10
      }
      return false
    })
    
    if (!hasValidSession) {
      console.log('🔒 No valid session found, redirecting to /auth')
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    
    console.log('✅ Valid session found')
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}