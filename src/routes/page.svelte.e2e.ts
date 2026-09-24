import { expect, test } from '@playwright/test';

test('serves the new Norwegian landing page with safe SEO metadata', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle('Skorovas Camping | Camping i Namdalen');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Camping mellom fjell, vatn og villmark'
	);
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
		'content',
		'noindex, nofollow'
	);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		'https://skorovascamping.no/'
	);
	const structuredData = JSON.parse(
		(await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}'
	);
	expect(structuredData['@type']).toBe('Campground');
});

test('serves localized routes with the correct document language', async ({ page }) => {
	await page.goto('/en/camping');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Camping in Skorovas');
	await page.goto('/de/praktische-informationen');
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Praktische Informationen');
});

test('shows confirmed business contact fields and organization data in every language', async ({
	page
}) => {
	for (const [path, heading, labels] of [
		[
			'/kontakt',
			'Firmaopplysninger',
			['Driftsansvarlig', 'Organisasjonsnummer', 'Firmaadresse']
		],
		[
			'/en/contact',
			'Business details',
			['Operator', 'Organisation number', 'Business address']
		],
		[
			'/de/kontakt',
			'Unternehmensangaben',
			['Betreiber', 'Organisationsnummer', 'Geschäftsanschrift']
		]
	] as const) {
		await page.goto(path);
		const details = page.getByRole('region', { name: heading });
		await expect(details.locator('dt')).toHaveText(labels);
		await expect(details.locator('dd')).toHaveText([
			'Skorovas samvirkelag SA',
			'947 534 777',
			'Kleiva 2, 7893 Skorovas'
		]);
		await expect(
			page.getByRole('link', { name: /booking@skorovascamping.no/ }).first()
		).toHaveAttribute('href', 'mailto:booking@skorovascamping.no');
		await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
		const data = JSON.parse(
			(await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}'
		);
		expect(data['@type']).toBe('Organization');
		expect(data.email).toBe('booking@skorovascamping.no');
		expect(data.legalName).toBe('Skorovas samvirkelag SA');
		expect(data.identifier.value).toBe('947 534 777');
		expect(data.address).toBe('Kleiva 2, 7893 Skorovas');
		expect(JSON.stringify(data)).not.toContain('XXX');
	}
});

test('serves crawler instructions and a sitemap without review content', async ({ request }) => {
	const robots = await (await request.get('/robots.txt')).text();
	expect(robots).toContain('Disallow: /');
	const sitemapResponse = await request.get('/sitemap.xml');
	const sitemap = await sitemapResponse.text();
	expect(sitemapResponse.ok()).toBe(true);
	expect(sitemap).toContain('<urlset');
	expect(sitemap).not.toContain('<loc>');
	expect(sitemap).not.toContain('/nyheter/skorovasmarsjen');
	expect(sitemap).not.toContain('beta.skorovascamping.no');
});

test('shows review news on beta and keeps external calendar blocked before consent', async ({
	page
}) => {
	for (const path of ['/nyheter', '/en/news', '/de/neuigkeiten']) {
		await page.goto(path);
		await expect(page.locator('.news-card')).toHaveCount(2);
		await expect(page.getByRole('link', { name: /Skorovasmarsjen/ })).toBeVisible();
	}
	await page.goto('/en/news/skorovasmarsjen');
	await page.getByRole('link', { name: 'Deutsch' }).click();
	await expect(page).toHaveURL(/\/de\/neuigkeiten\/skorovasmarsjen$/);
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		'https://skorovascamping.no/de/neuigkeiten/skorovasmarsjen'
	);
	await page.goto('/opplevelser');
	await expect(page.locator('iframe[title="Aktivitetskalender"]')).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Åpne cookie-innstillinger' })).toBeVisible();
});

test('offers accessible consent choices and persists a necessary-only choice', async ({
	page,
	context
}) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, 'webdriver', { get: () => false });
	});
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Valg for informasjonskapsler' })).toBeVisible();
	await page.getByRole('button', { name: 'Avvis valgfrie' }).click();
	await expect(page.getByRole('heading', { name: 'Valg for informasjonskapsler' })).toBeHidden();
	const consentCookie = (await context.cookies()).find(
		(cookie) => cookie.name === 'skorovas_cookie_consent'
	);
	expect(consentCookie).toBeDefined();
});

test('does not load Google Tag Manager in a beta or local build', async ({ page }) => {
	let requestedTagManager = false;
	await page.route('https://www.googletagmanager.com/**', async (route) => {
		requestedTagManager = true;
		await route.abort();
	});
	await page.goto('/');
	await page.waitForTimeout(100);
	expect(requestedTagManager).toBe(false);
});
