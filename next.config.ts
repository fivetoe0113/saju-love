import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 개발 중 임시 공개 터널(cloudflared 등)로 접속할 때 HMR/리소스 요청이 차단되지 않도록 허용
  allowedDevOrigins: ["copying-spencer-basin-exhibits.trycloudflare.com"],
};

export default nextConfig;
