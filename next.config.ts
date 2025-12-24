/** @type {import('next').NextConfig} */
const nextConfig = {
  // 完整版：启用类型检查，提高代码质量
  typescript: {
    ignoreBuildErrors: false, // 改为false，确保类型安全
  },
  eslint: {
    ignoreDuringBuilds: false, // 改为false，确保代码质量
  },
};

export default nextConfig;


