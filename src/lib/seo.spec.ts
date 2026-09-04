import { readdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { canonicalUrl, createSitemapXml, seoRoutes } from './seo';

describe('SEO configuration', () => {
	it('registers every static page route', () => {
		const routesDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', 'routes');
		const pageDirectories: string[] = [];
		const visit = (directory: string) => {
			for (const entry of readdirSync(directory, { withFileTypes: true })) {
				const entryPath = join(directory, entry.name);
				if (entry.isDirectory()) visit(entryPath);
				if (entry.isFile() && entry.name === '+page.svelte')
					pageDirectories.push(directory);
			}
		};
		visit(routesDirectory);
		const discoveredPaths = pageDirectories.map((directory) => {
			const routePath = relative(routesDirectory, directory).split(sep).join('/');
			return routePath ? `/${routePath}` : '/';
		});

		expect(discoveredPaths.sort()).toEqual(seoRoutes.map((route) => route.path).sort());
	});

	it('contains unique routes with canonical production URLs', () => {
		const paths = seoRoutes.map((route) => route.path);

		expect(new Set(paths).size).toBe(paths.length);
		expect(paths).toContain('/');
		expect(canonicalUrl('/personvern')).toBe('https://skorovascamping.no/personvern');
	});

	it('generates a sitemap containing indexable production routes only once', () => {
		const sitemap = createSitemapXml();

		expect(sitemap).toContain('<loc>https://skorovascamping.no/</loc>');
		expect(sitemap).toContain('<loc>https://skorovascamping.no/personvern</loc>');
		expect(sitemap.match(/https:\/\/skorovascamping\.no\/personvern/g)).toHaveLength(1);
		expect(sitemap).not.toContain('beta.skorovascamping.no');
	});
});
