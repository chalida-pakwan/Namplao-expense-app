import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://brokerpro.app'),
  title: {
    default: 'BrokerPro - แอพรายรับรายจ่ายสำหรับนายหน้า',
    template: '%s | BrokerPro'
  },
  description: 'ระบบจัดการรายรับ-รายจ่ายสำหรับนายหน้าอสังหาริมทรัพย์ที่ทันสมัย ใช้งานง่าย ปลอดภัย พร้อมรายงานแบบเรียลไทม์',
  keywords: [
    'นายหน้า',
    'รายรับรายจ่าย', 
    'อสังหาริมทรัพย์',
    'บัญชี',
    'การเงิน',
    'แอพบัญชี',
    'broker',
    'real estate',
    'accounting app',
    'expense tracker',
    'income management'
  ],
  authors: [{ name: 'BrokerPro Team' }],
  creator: 'BrokerPro',
  publisher: 'BrokerPro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://brokerpro.app',
    title: 'BrokerPro - แอพรายรับรายจ่ายสำหรับนายหน้า',
    description: 'ระบบจัดการรายรับ-รายจ่ายสำหรับนายหน้าอสังหาริมทรัพย์ที่ทันสมัย',
    siteName: 'BrokerPro',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BrokerPro - แอพรายรับรายจ่ายสำหรับนายหน้า',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BrokerPro - แอพรายรับรายจ่ายสำหรับนายหน้า',
    description: 'ระบบจัดการรายรับ-รายจ่ายสำหรับนายหน้าอสังหาริมทรัพย์ที่ทันสมัย',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fff7ed' },
    { media: '(prefers-color-scheme: dark)', color: '#9a3412' }
  ],
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className="scroll-smooth">
      <head>
        {/* Preload Critical Fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to External Domains */}
        <link rel="preconnect" href="https://vceydzpvcuscbphleyhw.supabase.co" />
        <link rel="dns-prefetch" href="https://vceydzpvcuscbphleyhw.supabase.co" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "BrokerPro",
              "description": "ระบบจัดการรายรับ-รายจ่ายสำหรับนายหน้าอสังหาริมทรัพย์",
              "url": "https://brokerpro.app",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web Browser",
              "browserRequirements": "HTML5, CSS3, JavaScript",
              "softwareVersion": "1.0.0",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "THB",
                "availability": "https://schema.org/InStock"
              },
              "author": {
                "@type": "Organization",
                "name": "BrokerPro Team"
              },
              "inLanguage": "th-TH",
              "featureList": [
                "จัดการรายรับ-รายจ่าย",
                "รายงานแบบเรียลไทม์", 
                "กราฟและสถิติ",
                "ระบบความปลอดภัย",
                "รองรับมือถือ"
              ]
            })
          }}
        />
      </head>
      <body className="font-prompt antialiased bg-pastel-cream text-gray-900 selection:bg-pastelOrange/30 selection:text-orange-900">
        {/* Skip to main content for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-orange-600 text-white px-4 py-2 rounded-md z-50 transition-all duration-300"
        >
          ข้ามไปยังเนื้อหาหลัก
        </a>
        
        <ClientLayout>
          <main id="main-content" role="main" className="focus:outline-none">
            {children}
          </main>
        </ClientLayout>
        
        {/* Performance Monitoring (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <script src="/test-otp.js" defer></script>
        )}
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `
          }}
        />
      </body>
    </html>
  )
}
