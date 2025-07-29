import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'เข้าสู่ระบบ/สมัครสมาชิก - ระบบรายรับ-รายจ่าย | BrokerPro',
  description: 'เข้าสู่ระบบหรือสมัครสมาชิกใหม่ ด้วยเบอร์โทร OTP หรือ Email สำหรับนายหน้าอสังหาริมทรัพย์',
  keywords: 'เข้าสู่ระบบ, สมัครสมาชิก, OTP, Email, Login, Sign up, นายหน้า',
  openGraph: {
    title: 'เข้าสู่ระบบ/สมัครสมาชิก - ระบบรายรับ-รายจ่าย | BrokerPro',
    description: 'เข้าสู่ระบบหรือสมัครสมาชิกใหม่ ด้วยเบอร์โทร OTP หรือ Email สำหรับนายหน้าอสังหาริมทรัพย์',
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
