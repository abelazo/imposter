import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { join } from "path";

const isProd = process.env.NODE_ENV === "production";
const { version } = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf-8"),
);

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/impostor" : "",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION:
      process.env.NEXT_PUBLIC_APP_VERSION ?? `v${version}`,
  },
};

export default nextConfig;
