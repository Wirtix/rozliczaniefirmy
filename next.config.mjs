/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      '/api/invoice': [
        './node_modules/pdfkit/js/data/**',
        './node_modules/fontkit/**',
      ],
    },
  },
};

export default nextConfig;
