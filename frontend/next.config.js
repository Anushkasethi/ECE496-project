/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
      ignoreDuringBuilds: true, // This will allow the build to continue despite ESLint errors
    },
  };
  
  module.exports = nextConfig;