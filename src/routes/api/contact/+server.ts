import { json } from '@sveltejs/kit';

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

	if (text(raw.company, 100)) return json({ ok: true });

	const payload = {
		name: text(raw.name, 100),
		email: text(raw.email, 254),
		phone: text(raw.phone, 40),
		message: text(raw.message, 2_000),
		locale: ['nb', 'en', 'de'].includes(text(raw.locale, 2)) ? text(raw.locale, 2) : 'nb',
		turnstileToken: text(raw.turnstileToken, 2_048)
	};

	if (
		payload.name.length < 2 ||
		payload.message.length < 10 ||
		(!payload.email && !payload.phone) ||
		(payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
	) {
		return json({ ok: false, error: 'validation' }, { status: 400 });
	}

	const env = platform?.env;
	if (
		!env?.TURNSTILE_SECRET_KEY ||
		!env.CONTACT_EMAIL ||
		!env.CONTACT_RECIPIENT_EMAIL ||
		!env.CONTACT_FROM_EMAIL
	) {
		return json({ ok: false, error: 'unavailable' }, { status: 503 });
	}

	const clientAddress = getClientAddress();
	if (env.CONTACT_RATE_LIMITER) {
		const rateLimit = await env.CONTACT_RATE_LIMITER.limit({ key: clientAddress });
		if (!rateLimit.success) return json({ ok: false, error: 'rate_limited' }, { status: 429 });
	}

	const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			secret: env.TURNSTILE_SECRET_KEY,
			response: payload.turnstileToken,
			remoteip: clientAddress
		})
	});
	const turnstile = (await verification.json()) as TurnstileResult;
	if (!turnstile.success) return json({ ok: false, error: 'verification' }, { status: 400 });

	const replyTo = payload.email || undefined;
	await env.CONTACT_EMAIL.send({
		to: env.CONTACT_RECIPIENT_EMAIL,
		from: env.CONTACT_FROM_EMAIL,
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
