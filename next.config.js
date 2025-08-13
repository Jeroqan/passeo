/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
    optimizeCss: true
  },
  // Vercel'de Edge Runtime sorunları yaşandığı için Node.js runtime kullanıyoruz
  runtime: 'nodejs',
  webpack: (config, { isServer }) => {
    // AI modelleri için önbellek ayarları
    config.module.rules.push({
      test: /\.(onnx|bin|json)$/,
      type: 'asset/resource'
    });

    // Vercel için webpack optimizasyonları
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        cluster: false,
        v8: false,
      };
    }

    return config;
  },
  // Statik dosya optimizasyonları
  images: {
    domains: ['localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60
  },
  // Vercel için ek optimizasyonlar
  swcMinify: true,
  compress: true,
  poweredByHeader: false
}

module.exports = nextConfig 