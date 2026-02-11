import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Enable strict mode for better type safety
    ignoreBuildErrors: false,
  },
}

export default nextConfig
