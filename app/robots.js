export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/buyer/', '/seller/', '/api/'],
    },
    sitemap: 'https://gocycle.ng/sitemap.xml',
  }
}
