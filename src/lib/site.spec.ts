import { describe, expect, it } from 'vitest';

import { siteName } from './site';

describe('site configuration', () => {
	it('has the expected site name', () => {
		expect(siteName).toBe('Skorovas Camping');
	});
});
