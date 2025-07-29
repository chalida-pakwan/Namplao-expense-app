/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for development and production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Enable standalone output for deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
}

module.exports = nextConfig
