import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "ibzobgpwprzxdchbjjju.supabase.co";

const nextConfig: NextConfig = {
  // Warm static routes in the client router. Keep dynamic at 0 so Payload Admin
  // stays fresh (Payload warns against non-zero dynamic staleTimes).
  experimental: {
    // Limit parallel prerender workers so their DB pools fit the Supabase pooler.
    cpus: 4,
    staleTimes: {
      dynamic: 0,
      static: 180,
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
      {
        protocol: "https",
        hostname: supabaseHost.replace(".supabase.co", ".storage.supabase.co"),
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withPayload(withNextIntl(nextConfig));
