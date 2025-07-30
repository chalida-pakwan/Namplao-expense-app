/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for development and production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Enable standalone output for deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
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
