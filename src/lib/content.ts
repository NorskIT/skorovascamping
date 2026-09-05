import type { Component } from 'svelte';
import { z } from 'zod';

import { locales, localizedPath, type Locale, type PageId } from '$lib/i18n';
import { siteConfig } from '$lib/site';

export const contentStatus = ['review', 'published'] as const;
export type ContentStatus = (typeof contentStatus)[number];
export type ContentKind = 'page' | 'news';

const dateSchema = z
	.union([z.string(), z.date()])
	.transform((value) => new Date(value).toISOString().slice(0, 10))
	.refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), 'Invalid date');

const pageMetadataSchema = z.object({
	id: z.enum(['home', 'camping', 'experiences', 'skorovas', 'practical']),
	locale: z.enum(locales),
	kind: z.literal('page'),
	status: z.enum(contentStatus),
	title: z.string().min(1),
	description: z.string().min(1).max(180),
	heading: z.string().min(1),
	eyebrow: z.string().min(1),
	heroImage: z.string().min(1),
	heroAlt: z.string().min(1),
	updatedAt: dateSchema
});

const newsMetadataSchema = z.object({
	id: z.string().min(1),
	translationKey: z.string().min(1),
	locale: z.enum(locales),
	kind: z.literal('news'),
	status: z.enum(contentStatus),
	slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	title: z.string().min(1),
	description: z.string().min(1).max(180),
	heading: z.string().min(1),
	eyebrow: z.string().min(1),
	heroImage: z.string().min(1),
	heroAlt: z.string().min(1),
	publishedAt: dateSchema,
	updatedAt: dateSchema
});

export interface ContentDocument {
	id: PageId;
	locale: Locale;
	kind: ContentKind;
	status: ContentStatus;
	path: string;
	title: string;
	description: string;
	heading: string;
	eyebrow: string;
	heroImage: string;
	heroAlt: string;
	updatedAt: string;
	component: Component;
}

export interface NewsDocument extends Omit<ContentDocument, 'id' | 'kind'> {
	id: string;
	kind: 'news';
	translationKey: string;
	slug: string;
	publishedAt: string;
}

interface SvxModule {
	default: Component;
	metadata: unknown;
}

const modules = import.meta.glob<SvxModule>('/src/content/pages/*.svx', { eager: true });
const newsModules = import.meta.glob<SvxModule>('/src/content/news/*.svx', { eager: true });

export const contentDocuments: readonly ContentDocument[] = Object.values(modules).map((module) => {
	const metadata = pageMetadataSchema.parse(module.metadata);
	return {
		...metadata,
		path: localizedPath(metadata.id, metadata.locale),
		component: module.default
	};
});

export const newsDocuments: readonly NewsDocument[] = Object.values(newsModules).map((module) => {
	const metadata = newsMetadataSchema.parse(module.metadata);
	return {
		...metadata,
		path: `${localizedPath('news', metadata.locale)}/${metadata.slug}`,
		component: module.default
	};
});

export function getContentDocument(id: PageId, locale: Locale): ContentDocument | undefined {
	return contentDocuments.find((document) => document.id === id && document.locale === locale);
}

export function getContentDocumentByPath(path: string): ContentDocument | undefined {
	return contentDocuments.find((document) => document.path === path);
}

export function getNewsDocumentByPath(path: string): NewsDocument | undefined {
	return newsDocuments.find((document) => document.path === path);
}

export function getNews(locale: Locale, includeReview = false): readonly NewsDocument[] {
	return newsDocuments
		.filter(
			(document) =>
				document.locale === locale && (includeReview || document.status === 'published')
		)
		.toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function assertContentIntegrity(): void {
	const keys = contentDocuments.map((document) => `${document.id}:${document.locale}`);
	if (new Set(keys).size !== keys.length) throw new Error('Duplicate localized content document');
	const newsPaths = newsDocuments.map((document) => document.path);
	if (new Set(newsPaths).size !== newsPaths.length) throw new Error('Duplicate news path');

	for (const id of ['home', 'camping', 'experiences', 'skorovas', 'practical'] as const) {
		for (const locale of locales) {
			if (!getContentDocument(id, locale))
				throw new Error(`Missing content: ${id}:${locale}`);
		}
	}
}

assertContentIntegrity();

if (siteConfig.isProduction) {
	const reviewDocument = [...contentDocuments, ...newsDocuments].find(
		(document) => document.status === 'review'
	);
	if (reviewDocument)
		throw new Error(`Production content is awaiting fact check: ${reviewDocument.path}`);
}
