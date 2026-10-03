import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { POST } from './+server';

vi.mock('$lib/site', () => ({
	siteConfig: { target: 'production', bookingEmail: 'booking@example.com' }
}));
beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}));
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

const payload = {
	name: 'Test Person',
	email: 'test@example.com',
	message: 'A booking enquiry',
	turnstileToken: 'fresh-token'
};
async function submit(
	result: unknown,
	token: unknown = payload.turnstileToken,
	status = 200,
	overrides: Record<string, unknown> = {}
) {
	const send = vi.fn().mockResolvedValue({ messageId: 'test' });
	const verify = vi.fn().mockImplementation(() => {
		if (result instanceof Error) return Promise.reject(result);
		return Promise.resolve(
			result instanceof Response ? result : Response.json(result, { status })
		);
	});
	vi.stubGlobal('fetch', verify);
	const response = await POST({
		request: new Request('https://skorovascamping.no/api/contact', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ ...payload, turnstileToken: token })
		}),
		platform: {
			env: { TURNSTILE_SECRET: 'test-secret', CONTACT_EMAIL: { send }, ...overrides }
		},
		getClientAddress: () => '192.0.2.1'
	} as unknown as Parameters<typeof POST>[0]);
	return { response, send, verify };
}
it('verifies the token before delivering the enquiry', async () => {
	const { response, send, verify } = await submit({
		success: true,
		action: 'contact',
		hostname: 'skorovascamping.no'
	});
	expect(response.status).toBe(200);
	expect(send).toHaveBeenCalledOnce();
	expect(send.mock.calls[0][0]).toMatchObject({
		from: 'booking@example.com',
		to: 'booking@example.com',
		replyTo: payload.email,
		text: expect.stringContaining(payload.message)
	});
	expect(JSON.parse(verify.mock.calls[0][1].body)).toMatchObject({
		secret: 'test-secret',
		response: 'fresh-token'
	});
});
it.each([
	{ success: false, 'error-codes': ['timeout-or-duplicate'] },
	{ success: true, action: 'signup', hostname: 'skorovascamping.no' },
	{ success: true, action: 'contact', hostname: 'localhost' },
	{ success: true, action: 'contact', hostname: 'beta.skorovascamping.no' },
	{ success: 'true', action: 'contact', hostname: 'skorovascamping.no' },
	null
])('rejects untrusted verification without delivering: %j', async (result) => {
	const { response, send } = await submit(result);
	expect(response.status).toBe(400);
	expect(send).not.toHaveBeenCalled();
});
it.each(['', 'x'.repeat(2049), null])('rejects missing or oversized tokens', async (token) => {
	const { response, send, verify } = await submit({}, token);
	expect(response.status).toBe(400);
	expect(send).not.toHaveBeenCalled();
	expect(verify).not.toHaveBeenCalled();
});
it('fails closed when Siteverify returns an HTTP error', async () => {
	const { response, send } = await submit(
		{ success: true, action: 'contact', hostname: 'skorovascamping.no' },
		'token',
		503
	);
	expect(response.status).toBe(503);
	expect(send).not.toHaveBeenCalled();
});

it.each([new Error('Network unavailable'), new Response('not-json')])(
	'fails closed on transport or malformed verification responses',
	async (result) => {
		const { response, send } = await submit(result);
		expect(response.status).toBe(503);
		expect(send).not.toHaveBeenCalled();
	}
);

it('rejects a null request body without attempting verification', async () => {
	const verify = vi.fn();
	vi.stubGlobal('fetch', verify);
	const response = await POST({
		request: new Request('https://skorovascamping.no/api/contact', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: 'null'
		})
	} as Parameters<typeof POST>[0]);
	expect(response.status).toBe(400);
	expect(verify).not.toHaveBeenCalled();
});

const verified = { success: true, action: 'contact', hostname: 'skorovascamping.no' };
it.each([
	'E_SENDER_NOT_VERIFIED',
	'E_SENDER_DOMAIN_NOT_AVAILABLE',
	'E_RECIPIENT_NOT_ALLOWED',
	'E_DELIVERY_FAILED',
	'E_DAILY_LIMIT_EXCEEDED',
	'visitor@example.com'
])('handles email failure %s without exposing message data', async (code) => {
	const send = vi
		.fn()
		.mockRejectedValue(
			Object.assign(new Error('secret-token visitor@example.com private message'), { code })
		);
	const { response } = await submit(verified, 'fresh-token', 200, { CONTACT_EMAIL: { send } });
	expect(response.status).toBe(502);
	const body = (await response.json()) as { requestId: string };
	expect(body).toMatchObject({ ok: false, error: 'unavailable', requestId: expect.any(String) });
	expect(console.error).toHaveBeenCalledWith({
		event: 'contact_failed',
		operation: 'email',
		code: code.includes('@') ? 'UNKNOWN' : code,
		requestId: body.requestId
	});
	expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toMatch(
		/visitor@|secret-token|private message/
	);
	expect(send).toHaveBeenCalledOnce();
});
it('does not claim success when the email service returns no acceptance ID', async () => {
	const { response } = await submit(verified, 'token', 200, {
		CONTACT_EMAIL: { send: vi.fn().mockResolvedValue(undefined) }
	});
	expect(response.status).toBe(502);
});
it.each([{ TURNSTILE_SECRET: '' }, { CONTACT_EMAIL: undefined }])(
	'reports missing configuration without verification or sending',
	async (env) => {
		const { response, send, verify } = await submit(verified, 'token', 200, env);
		expect(response.status).toBe(503);
		expect(send).not.toHaveBeenCalled();
		expect(verify).not.toHaveBeenCalled();
	}
);
it('rejects rate-limited requests before verification or delivery', async () => {
	const { response, send, verify } = await submit(verified, 'token', 200, {
		CONTACT_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: false }) }
	});
	expect(response.status).toBe(429);
	expect(response.headers.get('retry-after')).toBe('60');
	expect(send).not.toHaveBeenCalled();
	expect(verify).not.toHaveBeenCalled();
});
it('fails closed when rate limiting is unavailable', async () => {
	const { response, send, verify } = await submit(verified, 'token', 200, {
		CONTACT_RATE_LIMITER: { limit: vi.fn().mockRejectedValue(new Error('private')) }
	});
	expect(response.status).toBe(503);
	expect(send).not.toHaveBeenCalled();
	expect(verify).not.toHaveBeenCalled();
});
