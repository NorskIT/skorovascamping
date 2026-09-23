import type { Locale } from '$lib/i18n';

const campsite = 'skorovas-camping-6464381175533198';

export function bookingUrl(locale: Locale): string {
	const prefix = locale === 'en' ? '' : `/${locale}`;
	return `https://campio.no${prefix}/campsite/${campsite}`;
}
