import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Bypass SWC WASM typecheck runner bug on Windows during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
