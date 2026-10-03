import type { Locale } from '$lib/i18n';

const campsite = 'skorovas-camping-6464381175533198';

export type BookingDates = { startDate: string; endDate: string };

// Calendar arithmetic in UTC avoids daylight-saving shifts; values remain date-only.
export function addDays(value: string, days: number): string {
	const date = new Date(`${value}T12:00:00Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

export function osloToday(now = new Date()): string {
	return new Intl.DateTimeFormat('sv-SE', {
		timeZone: 'Europe/Oslo',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(now);
}

export function validBookingDates(dates: BookingDates, today: string): boolean {
	const valid = (value: string) =>
		/^\d{4}-\d{2}-\d{2}$/.test(value) &&
		Number.isFinite(Date.parse(`${value}T12:00:00Z`)) &&
		addDays(value, 0) === value;
	return (
		valid(dates.startDate) &&
		valid(dates.endDate) &&
		dates.startDate >= today &&
		dates.endDate > dates.startDate
	);
}

export function bookingUrl(locale: Locale, dates?: BookingDates): string {
	const prefix = locale === 'en' ? '' : `/${locale}`;
	const base = `https://campio.no${prefix}/campsite/${campsite}`;
	return dates ? `${base}/accommodations?${new URLSearchParams(dates)}` : base;
}
