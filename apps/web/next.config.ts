import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development", // Habilitar solo en producción por comodidad
});

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore: Next 16 Turbopack empty config requirement
  turbopack: {}
};

export default withSerwist(nextConfig);
