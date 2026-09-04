import type { RequestHandler } from './$types';

import { productionOrigin, siteConfig } from '$lib/site';

export const prerender = true;

export const GET: RequestHandler = () => {
	const lines = siteConfig.isProduction
		? ['User-agent: *', 'Allow: /', `Sitemap: ${productionOrigin}/sitemap.xml`]
		: ['User-agent: *', 'Disallow: /'];

	return new Response(`${lines.join('\n')}\n`, {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
};
