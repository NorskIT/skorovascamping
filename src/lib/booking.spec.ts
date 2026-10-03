import { describe, expect, it } from 'vitest';
import { addDays, bookingUrl, osloToday, validBookingDates } from './booking';

describe('booking dates', () => {
	it('uses Oslo calendar dates even when UTC is on the previous day', () => {
		expect(osloToday(new Date('2026-10-03T22:30:00Z'))).toBe('2026-10-04');
	});
	it.each([
		['2026-12-31', '2027-01-01'],
		['2028-02-28', '2028-02-29'],
		['2026-03-29', '2026-03-30'],
		['2026-10-25', '2026-10-26']
	])('adds a calendar night to %s', (start, expected) => {
		expect(addDays(start, 1)).toBe(expected);
	});
	it.each([
		['2026-10-02', '2026-10-04'],
		['2026-10-03', '2026-10-03'],
		['2026-10-04', '2026-10-03'],
		['2027-02-29', '2027-03-02'],
		['', '2026-10-04'],
		['2026-13-01', '2027-01-01']
	])('rejects invalid range %s to %s', (startDate, endDate) => {
		expect(validBookingDates({ startDate, endDate }, '2026-10-03')).toBe(false);
	});
	it.each(['nb', 'en', 'de'] as const)(
		'preserves existing %s links and adds date-only search parameters',
		(locale) => {
			const base = bookingUrl(locale);
			expect(base).toBe(
				`https://campio.no${locale === 'en' ? '' : `/${locale}`}/campsite/skorovas-camping-6464381175533198`
			);
			expect(bookingUrl(locale, { startDate: '2026-10-03', endDate: '2026-10-04' })).toBe(
				`${base}/accommodations?startDate=2026-10-03&endDate=2026-10-04`
			);
			expect(
				validBookingDates({ startDate: '2026-10-03', endDate: '2026-10-04' }, '2026-10-03')
			).toBe(true);
		}
	);
});
