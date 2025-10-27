/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },
};

module.exports = nextConfig;

