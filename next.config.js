const { withSuperjson } = require("next-superjson")

/** @type {import('next').NextConfig} */
module.exports = withSuperjson()({
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 3600
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/img/:all*(svg|jpg|png|gif|mp4|jpeg|webp)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=57600, s-max-age=604800",
          },
          {
            key: "Age",
            value: "0",
          }
        ],
      },
      {
        source: "/favicon.ico",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, s-max-age=604800",
          },
          {
            key: "Age",
            value: "0",
          }
        ],
      }
    ]
  },
})
