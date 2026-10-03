import { expect, test } from '@playwright/test';

test('contact verification survives navigation, expires and resets after submissions', async ({
	page
}) => {
	await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js*', (route) =>
		route.fulfill({
			contentType: 'application/javascript',
			body: `
 window.turnstile = {
  render(container, options) {
   container.innerHTML = '<button type="button">Verify test visitor</button><button type="button">Expire test token</button>';
   container.dataset.action = options.action;
   container.children[0].onclick = () => options.callback('test-token');
   container.children[1].onclick = () => options['expired-callback']();
   return 'test-widget';
  },
  reset(id) { document.querySelector('[data-action]').dataset.reset = id; },
  remove() { document.querySelector('[data-action]')?.replaceChildren(); }
 };
 window.skorovasTurnstileReady();`
		})
	);
	let attempts = 0;
	await page.route('**/api/contact', async (route) => {
		expect(route.request().postDataJSON()).toMatchObject({
			turnstileToken: 'test-token',
			email: 'visitor@example.com'
		});
		attempts++;
		await route.fulfill({ status: attempts === 1 ? 400 : 200, json: { ok: attempts > 1 } });
	});
	await page.goto('/en');
	await page.locator('main a[href="/en/contact"]').first().click();
	const form = page.locator('form');
	const send = form.locator('button[type="submit"]');
	await expect(send).toBeDisabled();
	await expect(form.locator('[data-action]')).toHaveAttribute('data-action', 'contact');
	await form.locator('[name="name"]').fill('Visitor Test');
	await form.locator('[name="email"]').fill('visitor@example.com');
	await form.locator('[name="message"]').fill('A camping enquiry for next summer.');
	await page.getByRole('button', { name: 'Verify test visitor' }).click();
	await expect(send).toBeEnabled();
	await page.getByRole('button', { name: 'Expire test token' }).click();
	await expect(send).toBeDisabled();
	await page.getByRole('button', { name: 'Verify test visitor' }).click();
	await send.click();
	await expect(form.locator('.feedback')).toContainText('Unable to send');
	await expect(send).toBeDisabled();
	await expect(form.locator('[data-action]')).toHaveAttribute('data-reset', 'test-widget');
	await expect(form.locator('[name="message"]')).toHaveValue(
		'A camping enquiry for next summer.'
	);
	await page.getByRole('button', { name: 'Verify test visitor' }).click();
	await send.click();
	await expect(form.locator('.feedback')).toContainText('has been sent');
	await expect(send).toBeDisabled();
	await expect(form.locator('[name="message"]')).toHaveValue('');
	await page.locator('header a[href="/en"]').click();
	await page.locator('main a[href="/en/contact"]').click();
	await expect(page.getByRole('button', { name: 'Verify test visitor' })).toBeVisible();
	await expect(send).toBeDisabled();
});

test('keeps sending disabled and offers email when Turnstile cannot load', async ({ page }) => {
	await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js*', (route) =>
		route.abort()
	);
	await page.goto('/en/contact');
	await expect(page.locator('form .feedback')).toContainText('Unable to send');
	await expect(page.locator('form button[type="submit"]')).toBeDisabled();
	await expect(page.locator('main a[href^="mailto:"]').first()).toBeVisible();
});
