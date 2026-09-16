import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 allows only [75] by default and silently coerces anything else to
    // it. 90 is for the full-bleed parallax bands, where a photograph is shown
    // edge to edge at viewport width and q75 artefacts read as blur.
    qualities: [75, 90],
  },
};

export default nextConfig;
