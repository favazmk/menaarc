import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 allows only [75] by default and silently coerces anything else to
    // it. 90 is for the full-bleed parallax bands, where a photograph is shown
    // edge to edge at viewport width and q75 artefacts read as blur.
    qualities: [75, 90],
  },
  // Without these, Hostinger's CDN revalidates every public file with the
  // origin on each request — ~400ms per film frame. Not `immutable`: frame
  // and photo filenames are not content-hashed, so a rebuilt film must still
  // reach returning visitors within a day.
  async headers() {
    const cache = [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }];
    return ['/film/:path*', '/projects/:path*', '/logos/:path*', '/maplibre/:path*'].map((source) => ({
      source,
      headers: cache,
    }));
  },
};

export default nextConfig;
