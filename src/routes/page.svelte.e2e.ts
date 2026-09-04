import { expect, test } from '@playwright/test';

test('serves the infrastructure placeholder', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveTitle('Skorovas Camping');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Skorovas Camping');
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
		'content',
		process.env.PUBLIC_DEPLOY_TARGET === 'production' ? 'index, follow' : 'noindex, nofollow'
	);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		'https://skorovascamping.no/'
	);
});

test('serves environment-specific crawler instructions', async ({ request }) => {
	const response = await request.get('/robots.txt');
	const robots = await response.text();

	expect(response.ok()).toBe(true);
	if (process.env.PUBLIC_DEPLOY_TARGET === 'production') {
		expect(robots).toContain('Allow: /');
		expect(robots).toContain('Sitemap: https://skorovascamping.no/sitemap.xml');
	} else {
		expect(robots).toContain('Disallow: /');
		expect(robots).not.toContain('Sitemap:');
	}
});

test('serves the production sitemap and privacy pages', async ({ page, request }) => {
	const sitemapResponse = await request.get('/sitemap.xml');
	const sitemap = await sitemapResponse.text();

	expect(sitemapResponse.ok()).toBe(true);
	expect(sitemap).toContain('https://skorovascamping.no/personvern');
	expect(sitemap).not.toContain('beta.skorovascamping.no');

	await page.goto('/personvern');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Personvernerklæring');
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
	await expect(page.getByRole('button', { name: 'Godta analyse' })).toBeVisible();
	await page.getByRole('button', { name: 'Avvis valgfrie' }).click();
	await expect(page.getByRole('heading', { name: 'Valg for informasjonskapsler' })).toBeHidden();

	const consentCookie = (await context.cookies()).find(
		(cookie) => cookie.name === 'skorovas_cookie_consent'
	);
	expect(consentCookie).toBeDefined();
});

test('loads GTM only for a completely configured production build', async ({ page }) => {
	let requestedTagManager = false;
	await page.route('https://www.googletagmanager.com/**', async (route) => {
		requestedTagManager = true;
		await route.abort();
	});

	await page.goto('/');
	await page.waitForTimeout(100);

	const operatorIsComplete = Boolean(
		process.env.PUBLIC_SITE_OPERATOR_NAME &&
		process.env.PUBLIC_SITE_OPERATOR_ORG_NUMBER &&
		process.env.PUBLIC_SITE_OPERATOR_ADDRESS &&
		(process.env.PUBLIC_PRIVACY_CONTACT_EMAIL || process.env.PUBLIC_PRIVACY_CONTACT_PHONE)
	);
	const shouldLoadTagManager =
		process.env.PUBLIC_DEPLOY_TARGET === 'production' &&
		operatorIsComplete &&
		/^GTM-[A-Z0-9]+$/.test(process.env.PUBLIC_GTM_CONTAINER_ID ?? '');

	expect(requestedTagManager).toBe(shouldLoadTagManager);
});
