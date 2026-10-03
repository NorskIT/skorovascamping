import { json } from '@sveltejs/kit';
import { siteConfig } from '$lib/site';

import type { RequestHandler } from './$types';

export const prerender = false;

interface ContactPayload {
	name?: unknown;
	email?: unknown;
	phone?: unknown;
	message?: unknown;
	locale?: unknown;
	turnstileToken?: unknown;
	company?: unknown;
}

interface TurnstileResult {
	success: boolean;
	action?: string;
	hostname?: string;
}

const text = (value: unknown, max: number) =>
	typeof value === 'string' ? value.trim().slice(0, max) : '';

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	if (!request.headers.get('content-type')?.includes('application/json')) {
		return json({ ok: false, error: 'invalid_request' }, { status: 415 });
	}

	const contentLength = Number(request.headers.get('content-length') ?? 0);
	if (contentLength > 16_384) return json({ ok: false, error: 'too_large' }, { status: 413 });

	let raw: ContactPayload;
	try {
		raw = (await request.json()) as ContactPayload;
	} catch {
		return json({ ok: false, error: 'invalid_request' }, { status: 400 });
	}

	if (!raw || typeof raw !== 'object' || Array.isArray(raw))
		return json({ ok: false, error: 'invalid_request' }, { status: 400 });

	if (text(raw.company, 100)) return json({ ok: true });

	const payload = {
		name: text(raw.name, 100),
		email: text(raw.email, 254),
		phone: text(raw.phone, 40),
		message: text(raw.message, 2_000),
		locale: ['nb', 'en', 'de'].includes(text(raw.locale, 2)) ? text(raw.locale, 2) : 'nb',
		turnstileToken: raw.turnstileToken
	};

	if (
		payload.name.length < 2 ||
		payload.message.length < 10 ||
		(!payload.email && !payload.phone) ||
		(payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
	) {
		return json({ ok: false, error: 'validation' }, { status: 400 });
	}

	if (
		typeof payload.turnstileToken !== 'string' ||
		!payload.turnstileToken.length ||
		payload.turnstileToken.length > 2048
	) {
		return json({ ok: false, error: 'verification' }, { status: 400 });
	}

	const env = platform?.env;
	if (!env?.TURNSTILE_SECRET || !env.CONTACT_EMAIL) {
		return json({ ok: false, error: 'unavailable' }, { status: 503 });
	}

	const clientAddress = getClientAddress();
	if (env.CONTACT_RATE_LIMITER) {
		const rateLimit = await env.CONTACT_RATE_LIMITER.limit({ key: clientAddress });
		if (!rateLimit.success) return json({ ok: false, error: 'rate_limited' }, { status: 429 });
	}

	const expectedHostnames: Record<string, string[]> = {
		production: ['skorovascamping.no', 'www.skorovascamping.no'],
		beta: ['beta.skorovascamping.no'],
		local: ['localhost', '127.0.0.1']
	};
	try {
		const verification = await fetch(
			'https://challenges.cloudflare.com/turnstile/v0/siteverify',
			{
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				signal: AbortSignal.timeout(10_000),
				body: JSON.stringify({
					secret: env.TURNSTILE_SECRET,
					response: payload.turnstileToken,
					remoteip: clientAddress
				})
			}
		);
		if (!verification.ok) throw new Error('Verification unavailable');
		const result = (await verification.json()) as TurnstileResult | null;
		if (
			result?.success !== true ||
			result.action !== 'contact' ||
			!expectedHostnames[siteConfig.target]?.includes(result.hostname ?? '')
		) {
			return json({ ok: false, error: 'verification' }, { status: 400 });
		}
	} catch {
		return json({ ok: false, error: 'verification' }, { status: 400 });
	}

	const replyTo = payload.email || undefined;
	await env.CONTACT_EMAIL.send({
		to: siteConfig.bookingEmail,
		from: siteConfig.bookingEmail,
		replyTo,
		subject: `Forespørsel fra Skorovas Camping (${payload.locale})`,
		text: [
			`Navn: ${payload.name}`,
			`E-post: ${payload.email || 'Ikke oppgitt'}`,
			`Telefon: ${payload.phone || 'Ikke oppgitt'}`,
			'',
			payload.message
		].join('\n')
	});

	return json({ ok: true });
};
