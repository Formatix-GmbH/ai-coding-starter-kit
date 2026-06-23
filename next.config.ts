import type { NextConfig } from "next";

// PROJ-14: Sicherheits-Header (vgl. .claude/rules/security.md). HSTS ist hinter
// Cloudflare (Full strict) unbedenklich und wird durchgereicht.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // PROJ-14: Eigenständiger Server-Build für den Container — nur im Docker-Build
  // aktiv (NEXT_OUTPUT_STANDALONE=1 im Dockerfile). Lokal bleibt der Build leicht.
  // Standalone kopiert public/ NICHT automatisch → das Dockerfile kopiert es
  // separat (wichtig für serverseitiges PDF: Arimo-Fonts + Banner unter public/).
  output: process.env.NEXT_OUTPUT_STANDALONE === "1" ? "standalone" : undefined,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
