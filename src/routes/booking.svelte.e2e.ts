import { expect, test } from '@playwright/test';

for (const [locale, path, arrival, departure, search, prefix] of [
	['nb', '/', 'Ankomst', 'Avreise', 'Søk og bestill', '/nb'],
	['en', '/en', 'Arrival', 'Departure', 'Search and book', ''],
	['de', '/de', 'Anreise', 'Abreise', 'Suchen und buchen', '/de']
]) {
	test(`booking forwards dates in ${locale} and keeps the calendar accessible`, async ({
		page
	}) => {
		await page.clock.install({ time: new Date('2026-10-03T10:00:00Z') });
		await page.goto(path);
		const bar = page.locator('.booking-bar');
		await expect(bar).toBeVisible();
		await expect(bar.locator('select')).toHaveCount(0);
		await expect(bar.locator('.types span')).toHaveCount(3);
		await bar.getByRole('button', { name: new RegExp(arrival) }).click();
		const dialog = page.getByRole('dialog', { name: arrival, exact: true });
		await expect(dialog.locator('[data-date="2026-10-02"]')).toBeDisabled();
		await expect(dialog.locator('[data-date="2026-10-03"]')).toBeFocused();
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('Enter');
		const end = page.getByRole('dialog', { name: departure, exact: true });
		await expect(end).toBeVisible();
		await expect(end.locator('[data-date="2026-10-04"]')).toBeDisabled();
		await expect(end.locator('[data-date="2026-10-05"]')).toBeFocused();
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('Enter');
		await expect(end).toBeHidden();
		await expect(bar.getByRole('button', { name: new RegExp(arrival) })).toBeFocused();
		await bar.getByRole('button', { name: new RegExp(departure) }).click();
		await page.keyboard.press('Escape');
		await expect(bar.getByRole('button', { name: new RegExp(departure) })).toBeFocused();
		await page.route('https://campio.no/**', (route) =>
			route.fulfill({ body: 'Campio test destination' })
		);
		await bar.getByRole('button', { name: search }).click();
		await expect(page).toHaveURL(
			`https://campio.no${prefix}/campsite/skorovas-camping-6464381175533198/accommodations?startDate=2026-10-04&endDate=2026-10-06`
		);
	});
}

test('booking layout fits desktop and mobile; calendar changes year and closes outside', async ({
	page
}) => {
	await page.clock.install({ time: new Date('2026-12-31T12:00:00Z') });
	for (const width of [390, 768, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/');
		await expect(page.locator('.booking-bar .date-field').first()).toBeEnabled();
		await expect(page.locator('.booking-bar')).toContainText('01.01.2027');
		await page.locator('.booking-bar .date-field').first().click();
		const dialog = page.getByRole('dialog', { name: 'Ankomst', exact: true });
		await expect(dialog.locator('.second-month')).toBeVisible({ visible: width >= 672 });
		await expect(dialog.locator('[data-date="2026-12-31"]')).toBeFocused();
		await page.keyboard.press('ArrowRight');
		await expect(dialog.locator('[data-date="2027-01-01"]')).toBeFocused();
		const bounds = await dialog.boundingBox();
		expect(bounds!.x).toBeGreaterThanOrEqual(0);
		expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
		expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);
		await page.screenshot({ path: `test-results/booking-calendar-${width}.png` });
		await page.mouse.click(2, 2);
		await expect(dialog).toBeHidden();
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
		await page.screenshot({ path: `test-results/booking-${width}.png` });
	}
});
