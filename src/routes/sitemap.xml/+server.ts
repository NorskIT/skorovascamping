import type { RequestHandler } from './$types';

import { createSitemapXml } from '$lib/seo';

export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(createSitemapXml(), {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
