import { expect, test } from '@playwright/test';

test('mobile menu closes for navigation, the current page, and language changes', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	const nav = page.locator('#main-nav');
	await page.getByRole('button', { name: 'Meny', exact: true }).click();
	await nav.getByRole('link', { name: 'Bilder', exact: true }).click();
	await expect(page).toHaveURL(/\/bilder$/);
	await expect(nav).toBeHidden();
	await page.getByRole('button', { name: 'Meny', exact: true }).click();
	await nav.getByRole('link', { name: 'Bilder', exact: true }).click();
	await expect(nav).toBeHidden();
	await page.getByRole('button', { name: 'Meny', exact: true }).click();
	await nav.getByRole('link', { name: 'English', exact: true }).click();
	await expect(page).toHaveURL(/\/en\/pictures$/);
	await expect(nav).toBeHidden();
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await page.getByRole('button', { name: 'Menu', exact: true }).click();
	await nav.getByRole('link', { name: 'Deutsch', exact: true }).click();
	await expect(page).toHaveURL(/\/de\/bilder$/);
	await expect(nav).toBeHidden();
	await page.getByRole('button', { name: 'Menü', exact: true }).click();
	await page.goBack();
	await expect(page).toHaveURL(/\/en\/pictures$/);
	await expect(nav).toBeHidden();
});

test('picture pages contain all photos, translated SEO and an accessible full-image dialog', async ({
	page
}) => {
	for (const [locale, path] of [
		['nb', '/bilder'],
		['en', '/en/pictures'],
		['de', '/de/bilder']
	]) {
		await page.goto(path);
		await expect(page.locator('html')).toHaveAttribute('lang', locale);
		await expect(page.locator('main .photo-grid img')).toHaveCount(20);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			`https://skorovascamping.no${path}`
		);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
			'content',
			'noindex, nofollow'
		);
		for (const [language, alternate] of [
			['nb', '/bilder'],
			['en', '/en/pictures'],
			['de', '/de/bilder']
		]) {
			await expect(
				page.locator(`link[rel="alternate"][hreflang="${language}"]`)
			).toHaveAttribute('href', `https://skorovascamping.no${alternate}`);
		}
		const opener = page.locator('main .photo-grid button').first();
		await opener.click();
		await expect(page.getByRole('dialog')).toBeVisible();
		await expect(page.getByRole('dialog').locator('.stage img')).toHaveAttribute(
			'alt',
			(await opener.locator('img').getAttribute('alt')) ?? ''
		);
		await expect(page.getByRole('dialog').locator('.thumbnail')).toHaveCount(20);
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toBeHidden();
		await expect(opener).toBeFocused();
	}
});

test('gallery browses in order with controls, thumbnails and arrow keys', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/bilder');
	const opener = page.locator('main .photo-grid button').first();
	await opener.click();
	const dialog = page.getByRole('dialog');
	const photo = dialog.locator('.stage img');
	await expect(photo).toHaveAttribute('alt', 'Campingliv på Sletta, ved Lisskorovatnet');
	await dialog.getByRole('button', { name: 'Neste bilde' }).click();
	await expect(photo).toHaveAttribute('alt', 'Bobiler mellom bjørketrærne');
	await expect(dialog.locator('.thumbnail[aria-pressed="true"]')).toHaveAttribute(
		'aria-label',
		'2: Bobiler mellom bjørketrærne'
	);
	await page.keyboard.press('ArrowLeft');
	await expect(photo).toHaveAttribute('alt', 'Campingliv på Sletta, ved Lisskorovatnet');
	await page.keyboard.press('ArrowLeft');
	await expect(photo).toHaveAttribute(
		'alt',
		(await page.locator('main .photo-grid button').last().locator('img').getAttribute('alt')) ??
			''
	);
	await expect(dialog.locator('.thumbnail[aria-pressed="true"]')).toHaveAttribute(
		'aria-label',
		/20:/
	);
	await dialog.getByRole('button', { name: '3: Bobilplasser, Kleiva' }).click();
	await expect(photo).toHaveAttribute('alt', 'Bobilplasser, Kleiva');
	await dialog.getByRole('button', { name: 'Forrige bilde' }).click();
	await expect(photo).toHaveAttribute('alt', 'Bobiler mellom bjørketrærne');
	await dialog.getByRole('button', { name: 'Lukk bildet' }).click();
	await expect(dialog).toBeHidden();
	await expect(opener).toBeFocused();
});

test('news photos retain their proportions and the back link clears the header', async ({
	page
}) => {
	for (const width of [390, 768, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/nyheter/skorovasmarsjen');
		await expect(page.getByText('Innhold til faktakontroll')).toHaveCount(0);
		const header = await page.locator('header').boundingBox();
		const back = await page.getByRole('link', { name: '← Siste nytt' }).boundingBox();
		expect(back!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
		const photo = page.locator('main .hero img');
		await expect(photo).toBeVisible();
		await expect
			.poll(() =>
				photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)
			)
			.toBe(true);
		const ratio = await photo.evaluate((img: HTMLImageElement) => {
			const rect = img.getBoundingClientRect();
			return {
				rendered: rect.width / rect.height,
				original: img.naturalWidth / img.naturalHeight
			};
		});
		expect(ratio.rendered).toBeCloseTo(ratio.original, 2);
	}
});

test('booking uses localized Campio links while contact and prices use confirmed content', async ({
	page
}) => {
	for (const { path, prefix, prices, electricity, toilets, tent } of [
		{
			path: '/camping',
			prefix: '/nb',
			prices: ['350 kroner per døgn', '400 kroner per døgn', '100 kroner per døgn'],
			electricity: 'strøm',
			toilets: 'toalett',
			tent: 'Telt'
		},
		{
			path: '/en/camping',
			prefix: '',
			prices: ['NOK 350 per day', 'NOK 400 per day', 'NOK 100 per day'],
			electricity: 'electricity',
			toilets: 'toilet access',
			tent: 'Tent'
		},
		{
			path: '/de/camping',
			prefix: '/de',
			prices: ['350 NOK pro Tag', '400 NOK pro Tag', '100 NOK pro Tag'],
			electricity: 'Strom',
			toilets: 'Toilettenzugang',
			tent: 'Zelt'
		}
	]) {
		await page.goto(path);
		const book = page.locator('main a.button').first();
		await expect(book).toHaveAttribute(
			'href',
			`https://campio.no${prefix}/campsite/skorovas-camping-6464381175533198`
		);
		await expect(book).not.toHaveAttribute('target', '_blank');
		const rows = page.locator('main .prose').getByRole('listitem');
		for (const [index, area] of ['Kleiva', 'Sletta', tent].entries()) {
			const row = rows.filter({ hasText: area });
			await expect(row.locator('strong')).toHaveText(prices[index]);
			await expect(row).toContainText(toilets);
			if (area !== tent) await expect(row).toContainText(electricity);
			else await expect(row).not.toContainText(electricity);
		}
		await expect(page.locator('main .prose')).not.toContainText(/XXX|48 12 91 15/);
		await expect(page.locator('.review')).toHaveCount(0);
	}
	await page.goto('/kontakt');
	await expect(
		page.getByRole('link', { name: /booking@skorovascamping.no/ }).first()
	).toHaveAttribute('href', 'mailto:booking@skorovascamping.no');
	await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
});
