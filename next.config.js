/** @type {import('next').NextConfig} */
const nextConfig = {
    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    
    // Compression
    compress: true,
    
    // Disable x-powered-by for security
    poweredByHeader: false,
    
    // Turbopack configuration (Next.js 16 default)
    turbopack: {},
};

module.exports = nextConfig;