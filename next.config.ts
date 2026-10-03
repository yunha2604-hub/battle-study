import type { NextConfig } from "next";

// GitHub Pages 호스팅용 basePath: 개발(dev) 시에는 루트, 빌드(build/export) 시에는 /battle-study
const isDev = process.env.NODE_ENV === "development";
const basePath = isDev ? "" : "/battle-study";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
