/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for development and production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Use regular build for Vercel deployment (better for dynamic routes)
  output: process.env.GITHUB_PAGES ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Configure for mobile development
  devIndicators: {
    position: 'bottom-right'
  },

  // Enable external access for mobile testing
  experimental: {
    allowedOrigins: ['*']
  },

  // Allow external access
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
