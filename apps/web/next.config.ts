import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
loadEnvConfig(projectRoot);

const nextConfig: NextConfig = {
  transpilePackages: ["@tcharize/ui", "@tcharize/contracts"],
};

export default nextConfig;

