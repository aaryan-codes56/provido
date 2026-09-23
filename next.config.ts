import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Listings store a plain image URL (no upload pipeline in this project),
    // so we can't know the hostname ahead of time. A wildcard is fine for a
    // demo; a real product would restrict this to its actual asset host
    // (e.g. an S3 bucket or Cloudinary) to avoid proxying arbitrary URLs.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
