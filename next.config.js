/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
    optimizeCss: true
  },
  webpack: (config, { isServer }) => {
    // AI modelleri için önbellek ayarları
    config.module.rules.push({
      test: /\.(onnx|bin|json)$/,
      type: 'asset/resource'
    });

    return config;
  },
  // Statik dosya optimizasyonları
  images: {
    domains: ['localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60
  }
}

module.exports = nextConfig 