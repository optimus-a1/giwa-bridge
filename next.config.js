/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 开发机跨域提示仅为警告，Next 14 不需要 experimental.allowedDevOrigins
  // 如果你必须允许远程访问静态资源，可以用 devIndicators 或自定义 headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
      ],
    },
  ],
};

module.exports = nextConfig;
