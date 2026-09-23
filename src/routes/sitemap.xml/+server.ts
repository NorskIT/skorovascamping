import type { RequestHandler } from './$types';

import { createSitemapXml } from '$lib/seo';
import { siteConfig } from '$lib/site';

export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(
		siteConfig.isProduction
			? createSitemapXml()
			: '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>',
		{
			headers: { 'content-type': 'application/xml; charset=utf-8' }
		}
	);
