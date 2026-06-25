import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    // Ensure Turbopack uses this folder as the workspace root
    root: path.resolve(__dirname),
  },
  webpack: (config, { isServer }) => {
    config.resolve.symlinks = false

    // pdfjs-dist optionally imports 'canvas' for server-side rendering.
    // We don't need it — stub it out to avoid bundling errors.
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    }

    return config
  },

  // Allow the server-side API routes enough time to process large PDFs
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
