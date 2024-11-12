/** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: [
//       "googleusercontent.com",
//       "oaidalleapiprodscus.blob.core.windows.net",
//       "replicate.delivery"
//     ]
//   },
// }

module.exports = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        port: '',
        pathname: '/xezq/**',
      },
    ],
  },
}
