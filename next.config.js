/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/conversation',
        destination: '/chat',
        permanent: true,
      },
      {
        source: '/code',
        destination: '/chat',
        permanent: true,
      },
      {
        source: '/images',
        destination: '/chat',
        permanent: true,
      },
      {
        source: '/music',
        destination: '/chat',
        permanent: true,
      },
      {
        source: '/video',
        destination: '/chat',
        permanent: true,
      },
    ];
  },
};
