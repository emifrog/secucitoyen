/**
 * Origine publique du site, source unique pour metadataBase, le sitemap et
 * robots.txt (auparavant codée en dur à trois endroits).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://secucitoyen.vercel.app').replace(/\/$/, '');
