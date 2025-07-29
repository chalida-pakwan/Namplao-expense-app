import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/auth',
          '/dashboard',
          '/income',
          '/expense',
          '/records',
          '/report',
          '/settings'
        ],
        disallow: [
          '/api/',
          '/test/',
          '/create-test-user/',
          '/_next/',
          '/admin/',
          '/private/'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/auth',
          '/dashboard',
          '/income',
          '/expense', 
          '/records',
          '/report',
          '/settings'
        ],
        disallow: [
          '/api/',
          '/test/',
          '/create-test-user/',
          '/_next/',
          '/admin/',
          '/private/'
        ],
      },
    ],
    sitemap: 'https://brokerpro.app/sitemap.xml',
    host: 'https://brokerpro.app',
  }
}
