/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@flowforge/types', '@flowforge/ui'],
  async rewrites() {
    const apiHost = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/v1\/?$/, '');
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiHost}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
