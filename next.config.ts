import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/arena", destination: "/lobby", permanent: true },
      { source: "/raid", destination: "/shadow-raid", permanent: true },
      { source: "/dungeon", destination: "/shadow-raid", permanent: true },
      { source: "/teacher-dashboard", destination: "/teacher", permanent: true },
    ];
  },
};

export default nextConfig;
