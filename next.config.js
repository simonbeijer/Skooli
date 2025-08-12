/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for dev/Next.js
              "style-src 'self' 'unsafe-inline'", // Allow inline styles for Tailwind
              "img-src 'self' data: https:", // Allow images from self, data URLs, and HTTPS
              "font-src 'self' data:", // Allow fonts from self and data URLs
              "connect-src 'self'", // Allow connections to same origin
              "frame-src 'none'", // Block all frames
              "object-src 'none'", // Block objects/embeds
              "base-uri 'self'", // Restrict base URI
              "form-action 'self'", // Restrict form submissions
              "upgrade-insecure-requests", // Upgrade HTTP to HTTPS
            ].join('; ')
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), ambient-light-sensor=(), accelerometer=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
