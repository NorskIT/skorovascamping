import { afterEach, expect, it, vi } from 'vitest';
import { POST } from './+server';

vi.mock('$lib/site', () => ({ siteConfig: { bookingEmail: 'booking@example.com' } }));
afterEach(() => vi.unstubAllGlobals());

it('uses the single public booking email for sender and recipient, and the visitor as reply-to', async () => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ success: true })));
	const send = vi.fn().mockResolvedValue({ messageId: 'test-message' });
	const response = await POST({
		request: new Request('https://example.com/api/contact', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				name: 'Test visitor',
				email: 'visitor@example.com',
				message: 'A test booking inquiry.',
				turnstileToken: 'test-token'
			})
		}),
		platform: { env: { TURNSTILE_SECRET_KEY: 'test-secret', CONTACT_EMAIL: { send } } },
		getClientAddress: () => '127.0.0.1'
	} as unknown as Parameters<typeof POST>[0]);
	expect(response.status).toBe(200);
	expect(send).toHaveBeenCalledWith(
		expect.objectContaining({
			from: 'booking@example.com',
			to: 'booking@example.com',
			replyTo: 'visitor@example.com'
		})
	);
});
