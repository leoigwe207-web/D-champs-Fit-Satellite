import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do not advertise the framework version in production responses.
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;
