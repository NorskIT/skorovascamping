import { redirect, type Handle } from '@sveltejs/kit';

import type { Locale } from '$lib/i18n';

const localeFromPath = (pathname: string): Locale => {
	if (pathname === '/en' || pathname.startsWith('/en/')) return 'en';
	if (pathname === '/de' || pathname.startsWith('/de/')) return 'de';
	return 'nb';
};

export const handle: Handle = async ({ event, resolve }) => {
	if (
		['skorovascamping.no', 'www.skorovascamping.no', 'beta.skorovascamping.no'].includes(
			event.url.hostname
		) &&
		(event.url.protocol !== 'https:' || event.url.hostname === 'www.skorovascamping.no')
	) {
		const destination = new URL(event.url);
		destination.protocol = 'https:';
		if (destination.hostname === 'www.skorovascamping.no')
			destination.hostname = 'skorovascamping.no';
		redirect(308, destination.toString());
	}
	const locale = localeFromPath(event.url.pathname);
	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('<html lang="nb">', `<html lang="${locale}">`)
	});
};
