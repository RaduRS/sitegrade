import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'],
    },
    sitemap: 'https://sitegrade.co.uk/sitemap.xml',
    host: 'https://sitegrade.co.uk',
  }
}