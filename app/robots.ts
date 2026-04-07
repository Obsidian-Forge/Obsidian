import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/api',
        '/onboarding',
        '/client',
      ],
    },
    sitemap: 'https://novatrum.eu/sitemap.xml',
  }
}