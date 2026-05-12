import prisma from "@/backend-actions/lib/prisma";

export default async function sitemap() {
    const baseUrl = 'https://gocycle.africa';
    
    // 1. Core Public Pages
    const staticRoutes = [
      '',
      '/about',
      '/shop',
      '/marketplace',
      '/sustainability',
      '/trade-process',
      '/sell4me',
      '/faq',
      '/pricing',
      '/terms',
      '/sourcing-policy',
      '/blog',
      '/signup',
      '/login'
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: route === '' ? 1 : 0.8,
    }));

    // 2. Dynamic Product Listings (Only Approved)
    let productRoutes = [];
    try {
        const products = await prisma.product.findMany({
            where: { 
                status: 'approved',
                inStock: true 
            },
            select: { 
                id: true, 
                createdAt: true 
            },
            orderBy: { createdAt: 'desc' },
            take: 1000 // Limit for performance
        });
        
        productRoutes = products.map((p) => ({
            url: `${baseUrl}/product/${p.id}`,
            lastModified: p.createdAt,
            changeFrequency: 'daily',
            priority: 0.6,
        }));
    } catch (e) {
        console.error("SITEMAP_GENERATION_ERROR:", e);
        // Fail-safe: return static routes only
    }

    return [...staticRoutes, ...productRoutes];
}
