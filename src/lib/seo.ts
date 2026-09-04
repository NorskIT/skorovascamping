import { productionOrigin } from '$lib/site';

export interface SeoRoute {
	path: `/${string}` | '/';
	title: string;
	description: string;
	changeFrequency: 'weekly' | 'monthly' | 'yearly';
	priority: number;
	indexable: boolean;
}

export const seoRoutes = [
	{
		path: '/',
		title: 'Skorovas Camping',
		description: 'Camping og oppstillingsplasser i Skorovas.',
		changeFrequency: 'weekly',
		priority: 1,
		indexable: true
	},
	{
		path: '/personvern',
		title: 'Personvern | Skorovas Camping',
		description: 'Informasjon om hvordan Skorovas Camping behandler personopplysninger.',
		changeFrequency: 'yearly',
		priority: 0.2,
		indexable: true
	},
	{
		path: '/informasjonskapsler',
		title: 'Informasjonskapsler | Skorovas Camping',
		description: 'Informasjon om informasjonskapsler og analyse på Skorovas Camping.',
		changeFrequency: 'yearly',
		priority: 0.2,
		indexable: true
	}
] as const satisfies readonly SeoRoute[];

export type SeoPath = (typeof seoRoutes)[number]['path'];

export function getSeoRoute(path: SeoPath): SeoRoute {
	const route = seoRoutes.find((candidate) => candidate.path === path);
	if (!route) throw new Error(`Missing SEO configuration for ${path}`);
	return route;
}

export function canonicalUrl(path: string): string {
	return new URL(path, productionOrigin).toString();
}

const escapeXml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');

export function createSitemapXml(): string {
	const urls = seoRoutes
		.filter((route) => route.indexable)
		.map(
			(route) => `  <url>
    <loc>${escapeXml(canonicalUrl(route.path))}</loc>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`
		)
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
