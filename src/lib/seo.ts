import { contentDocuments, newsDocuments, type ContentStatus } from '$lib/content';
import { locales, localizedPath, type Locale, type PageId } from '$lib/i18n';
import { productionOrigin, siteName } from '$lib/site';

export interface SeoDocument {
	path: string;
	locale: Locale;
	translationKey: string;
	title: string;
	description: string;
	updatedAt: string;
	indexable: boolean;
	status: ContentStatus;
	type: 'website' | 'article';
	image?: string;
}

const specialCopy: Record<
	Extract<PageId, 'news' | 'contact' | 'privacy' | 'cookies'>,
	Record<Locale, { title: string; description: string }>
> = {
	news: {
		nb: {
			title: `Nyheter | ${siteName}`,
			description: 'Nyheter og arrangementer fra Skorovas.'
		},
		en: { title: `News | ${siteName}`, description: 'News and events from Skorovas.' },
		de: {
			title: `Neuigkeiten | ${siteName}`,
			description: 'Neuigkeiten und Veranstaltungen aus Skorovas.'
		}
	},
	contact: {
		nb: {
			title: `Kontakt og bestilling | ${siteName}`,
			description: 'Kontakt Skorovas Camping for å bestille plass eller stille spørsmål.'
		},
		en: {
			title: `Contact and booking | ${siteName}`,
			description: 'Contact Skorovas Camping to request a pitch or ask a question.'
		},
		de: {
			title: `Kontakt und Buchung | ${siteName}`,
			description:
				'Kontaktieren Sie Skorovas Camping für eine Stellplatzanfrage oder bei Fragen.'
		}
	},
	privacy: {
		nb: {
			title: `Personvern | ${siteName}`,
			description: `Informasjon om hvordan ${siteName} behandler personopplysninger.`
		},
		en: {
			title: `Privacy | ${siteName}`,
			description: `How ${siteName} processes personal information.`
		},
		de: {
			title: `Datenschutz | ${siteName}`,
			description: `Informationen zur Verarbeitung personenbezogener Daten durch ${siteName}.`
		}
	},
	cookies: {
		nb: {
			title: `Informasjonskapsler | ${siteName}`,
			description: `Informasjon om informasjonskapsler og analyse på ${siteName}.`
		},
		en: {
			title: `Cookies | ${siteName}`,
			description: `Information about cookies and analytics on ${siteName}.`
		},
		de: {
			title: `Cookies | ${siteName}`,
			description: `Informationen zu Cookies und Analyse auf ${siteName}.`
		}
	}
};

const specialDocuments: SeoDocument[] = (
	['news', 'contact', 'privacy', 'cookies'] as const
).flatMap((id) =>
	locales.map((locale) => ({
		path: localizedPath(id, locale),
		locale,
		translationKey: id,
		...specialCopy[id][locale],
		updatedAt: '2026-09-05',
		indexable: true,
		status: 'published' as const,
		type: 'website' as const
	}))
);

export const seoDocuments: readonly SeoDocument[] = [
	...contentDocuments.map((document) => ({
		path: document.path,
		locale: document.locale,
		translationKey: document.id,
		title: document.title,
		description: document.description,
		updatedAt: document.updatedAt,
		indexable: document.status === 'published',
		status: document.status,
		type: 'website' as const,
		image: document.heroImage
	})),
	...newsDocuments.map((document) => ({
		path: document.path,
		locale: document.locale,
		translationKey: document.translationKey,
		title: document.title,
		description: document.description,
		updatedAt: document.updatedAt,
		indexable: document.status === 'published',
		status: document.status,
		type: 'article' as const,
		image: document.heroImage
	})),
	...specialDocuments
];

export function getSeoDocument(path: string): SeoDocument {
	const normalized = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
	const document = seoDocuments.find((candidate) => candidate.path === normalized);
	if (!document) throw new Error(`Missing SEO configuration for ${path}`);
	return document;
}

export function canonicalUrl(path: string): string {
	return new URL(path, productionOrigin).toString();
}

export function alternateDocuments(document: SeoDocument): readonly SeoDocument[] {
	return seoDocuments.filter(
		(candidate) =>
			candidate.translationKey === document.translationKey && candidate.status === 'published'
	);
}

const escapeXml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');

export function createSitemapXml(): string {
	const urls = seoDocuments
		.filter((document) => document.indexable && document.status === 'published')
		.map(
			(document) => `  <url>
    <loc>${escapeXml(canonicalUrl(document.path))}</loc>
    <lastmod>${document.updatedAt}</lastmod>
  </url>`
		)
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
