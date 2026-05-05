export default function sitemap() {
    const baseUrl = 'https://gocycle.ng';
    
    // Main public routes
    const routes = [
      '',
      '/about',
      '/marketplace',
      '/sustainability',
      '/trade-process',
      '/sell4me',
      '/faq',
      '/pricing',
      '/terms',
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: route === '' ? 1 : 0.8,
    }));
  
    return routes;
  }
