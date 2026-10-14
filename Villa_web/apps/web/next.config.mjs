/** @type {import('next').NextConfig} */
const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kost/ui', '@kost/types'],
  // Lint dijalankan oleh task `build` di turbo.json (satu sumber kebenaran),
  // bukan oleh internal `next build`.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: r2PublicUrl
      ? [{ protocol: 'https', hostname: new URL(r2PublicUrl).hostname, pathname: '/**' }]
      : [],
  },
};

export default nextConfig;
