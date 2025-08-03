/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.1.131:3000']
    }
  },
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
