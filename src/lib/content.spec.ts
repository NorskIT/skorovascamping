import { expect, it } from 'vitest';

import { assertPublishableSource } from './content';

it('blocks a published page with an unapproved price while allowing beta review', () => {
	expect(() =>
		assertPublishableSource('/camping.nb.svx', 'published', 'Bobil: XXX kroner')
	).toThrow('unverified placeholders');
	expect(() =>
		assertPublishableSource('/camping.nb.svx', 'review', 'Bobil: XXX kroner')
	).not.toThrow();
	expect(() =>
		assertPublishableSource('/camping.nb.svx', 'published', 'Bobil: 350 kroner')
	).not.toThrow();
});
