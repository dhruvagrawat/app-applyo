/** @type {import('next').NextConfig} */
const nextConfig = {
  // Used over CDP to drive the Steel cloud browser (auto-applier); keep it out of the bundle.
  serverExternalPackages: ["playwright-core"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
