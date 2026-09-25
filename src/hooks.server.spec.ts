import { describe, expect, it, vi } from 'vitest';

import { handle } from './hooks.server';

const resolve = vi.fn(async () => new Response('ok'));

function request(url: string) {
	return handle({ event: { url: new URL(url) }, resolve } as unknown as Parameters<
		typeof handle
	>[0]);
}

describe('public hostname redirects', () => {
	it('redirects HTTP and www directly to the matching HTTPS apex URL', async () => {
		await expect(
			request('http://www.skorovascamping.no/en/camping?utm_source=test')
		).rejects.toMatchObject({
			status: 308,
			location: 'https://skorovascamping.no/en/camping?utm_source=test'
		});
		await expect(request('http://skorovascamping.no/bilder')).rejects.toMatchObject({
			status: 308,
			location: 'https://skorovascamping.no/bilder'
		});
	});

	it('preserves HTTPS beta and local preview URLs', async () => {
		await expect(
			request('https://beta.skorovascamping.no/en/pictures')
		).resolves.toBeInstanceOf(Response);
		await expect(request('http://localhost:4173/en/pictures')).resolves.toBeInstanceOf(
			Response
		);
	});
});
