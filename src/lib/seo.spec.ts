import { describe, expect, it } from 'vitest';

import { contentDocuments } from './content';
import { locales, localizedRoutes } from './i18n';
import { canonicalUrl, createSitemapXml, seoDocuments } from './seo';

describe('SEO configuration', () => {
	it('registers every localized route and content document', () => {
		for (const route of localizedRoutes)
			expect(seoDocuments.some((item) => item.path === route.path)).toBe(true);
		for (const document of contentDocuments)
			expect(seoDocuments.some((item) => item.path === document.path)).toBe(true);
	});

	it('contains unique canonical routes for all languages', () => {
		const paths = seoDocuments.map((document) => document.path);
		expect(new Set(paths).size).toBe(paths.length);
		expect(
			locales.every((locale) => seoDocuments.some((document) => document.locale === locale))
		).toBe(true);
		expect(canonicalUrl('/personvern')).toBe('https://skorovascamping.no/personvern');
	});

	it('includes published pages and excludes review content from the sitemap', () => {
		const sitemap = createSitemapXml();
		expect(sitemap).toContain('<loc>https://skorovascamping.no/personvern</loc>');
		expect(sitemap).toContain('<loc>https://skorovascamping.no/en/privacy</loc>');
		expect(sitemap).not.toContain('/nyheter/skorovasmarsjen');
		expect(sitemap).not.toContain('beta.skorovascamping.no');
	});
});
