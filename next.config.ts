import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['three'],
  experimental: { optimizePackageImports: ['lucide-react', 'framer-motion', 'gsap'] },
};

export default config;
