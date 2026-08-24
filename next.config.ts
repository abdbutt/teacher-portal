import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXTAUTH_URL:
      process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim() !== ""
        ? process.env.NEXTAUTH_URL
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000",
    NEXTAUTH_SECRET:
      process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.trim() !== ""
        ? process.env.NEXTAUTH_SECRET
        : "teacher-portal-super-secret-key-123456789",
  },
};

export default nextConfig;
