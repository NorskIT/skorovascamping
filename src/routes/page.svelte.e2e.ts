import { expect, test } from '@playwright/test';

test('serves the infrastructure placeholder', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveTitle('Skorovas Camping');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Skorovas Camping');
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
		'content',
		'noindex, nofollow'
	);
});
