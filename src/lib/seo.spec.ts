import { describe, expect, it } from 'vitest';

import { contentDocuments, newsDocuments } from './content';
import { locales, localizedRoutes } from './i18n';
import {
	alternateDocuments,
	canonicalUrl,
	createOrganizationStructuredData,
	createSitemapXml,
	getSeoDocument,
	seoDocuments
} from './seo';
import { createPublicSiteConfig } from './site';

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
		for (const document of [...contentDocuments, ...newsDocuments]) {
			const entry = `<loc>${canonicalUrl(document.path)}</loc>`;
			if (document.status === 'published') expect(sitemap).toContain(entry);
			else expect(sitemap).not.toContain(entry);
		}
		for (const route of localizedRoutes.filter((route) => route.id === 'news')) {
			const hasPublishedNews = newsDocuments.some(
				(document) => document.locale === route.locale && document.status === 'published'
			);
			expect(getSeoDocument(route.path).indexable).toBe(hasPublishedNews);
			const entry = `<loc>${canonicalUrl(route.path)}</loc>`;
			if (hasPublishedNews) expect(sitemap).toContain(entry);
			else expect(sitemap).not.toContain(entry);
		}
		expect(sitemap).not.toContain('beta.skorovascamping.no');
	});

	it('gives every indexable page distinct metadata and omits unsupported update dates', () => {
		const pages = seoDocuments.filter((document) => document.indexable);
		for (const field of ['path', 'title', 'description'] as const)
			expect(new Set(pages.map((document) => document[field])).size).toBe(pages.length);
		const entries = createSitemapXml().match(/<url>[\s\S]*?<\/url>/g) ?? [];
		for (const document of pages) {
			const entry = entries.find((value) =>
				value.includes(`<loc>${canonicalUrl(document.path)}</loc>`)
			);
			expect(entry).toBeDefined();
			if (document.updatedAt)
				expect(entry).toContain(`<lastmod>${document.updatedAt}</lastmod>`);
			else expect(entry).not.toContain('<lastmod>');
		}
	});

	it('registers translated picture routes and previews reciprocal language links', () => {
		const paths = ['/bilder', '/en/pictures', '/de/bilder'];
		for (const path of paths) {
			const document = getSeoDocument(path);
			expect(document.status).toBe(
				contentDocuments.find((page) => page.path === path)?.status
			);
			expect(alternateDocuments(document).map((alternate) => alternate.path)).toEqual(
				expect.arrayContaining(paths)
			);
		}
		expect(new Set(paths.map((path) => getSeoDocument(path).title)).size).toBe(3);
		expect(new Set(paths.map((path) => getSeoDocument(path).description)).size).toBe(3);
		expect(() => getSeoDocument('/en/bilder')).toThrow('Missing SEO configuration');
	});

	it('registers the existing news articles in every language without publishing review content', () => {
		for (const key of ['skorovasmarsjen', 'trim-og-trivsel-2026']) {
			const translations = newsDocuments.filter(
				(document) => document.translationKey === key
			);
			expect(translations.map((document) => document.locale).sort()).toEqual(
				[...locales].sort()
			);
			for (const document of translations) {
				const seo = getSeoDocument(document.path);
				expect(seo.status).toBe(document.status);
				expect(seo.indexable).toBe(document.status === 'published');
				expect(alternateDocuments(seo).map((alternate) => alternate.path)).toEqual(
					expect.arrayContaining(translations.map((translation) => translation.path))
				);
			}
		}
	});

	it('includes only confirmed company facts in organization structured data', () => {
		const preview = createOrganizationStructuredData(createPublicSiteConfig({}));
		expect(preview).toMatchObject({
			'@type': 'Organization',
			name: 'Skorovas Camping',
			email: 'booking@skorovascamping.no'
		});
		expect(JSON.stringify(preview)).not.toContain('XXX');
		expect(preview).not.toHaveProperty('telephone');
		expect(preview).not.toHaveProperty('address');

		const confirmed = createOrganizationStructuredData(
			createPublicSiteConfig({
				PUBLIC_SITE_OPERATOR_NAME: 'Verified Operator SA',
				PUBLIC_SITE_OPERATOR_ORG_NUMBER: '999 999 999',
				PUBLIC_SITE_OPERATOR_ADDRESS: 'Verified address, Norway'
			})
		);
		expect(confirmed).toMatchObject({
			legalName: 'Verified Operator SA',
			identifier: { value: '999 999 999' },
			address: 'Verified address, Norway'
		});
	});
});
