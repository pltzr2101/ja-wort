import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Native module – must stay external so the standalone build loads it
  // from node_modules at runtime (see Dockerfile).
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
