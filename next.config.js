/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    // Project cards use GitHub's generated social preview for each repo.
    remotePatterns: [{ protocol: "https", hostname: "opengraph.githubassets.com" }],
  },
};

export default config;
