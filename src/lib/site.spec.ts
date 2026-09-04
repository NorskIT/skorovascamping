import { describe, expect, it } from 'vitest';

import { createPublicSiteConfig, DeployTarget, siteName } from './site';

describe('site configuration', () => {
	it('has the expected site name', () => {
		expect(siteName).toBe('Skorovas Camping');
	});

	it('defaults to a non-indexable local environment', () => {
		const config = createPublicSiteConfig({});

		expect(config.target).toBe(DeployTarget.Local);
		expect(config.isProduction).toBe(false);
		expect(config.analyticsEnabled).toBe(false);
		expect(config.operator.name).toBe('XXXXX');
	});

	it('only enables analytics for a completely configured production build', () => {
		const config = createPublicSiteConfig({
			PUBLIC_DEPLOY_TARGET: 'production',
			PUBLIC_GTM_CONTAINER_ID: 'GTM-THZ27K96',
			PUBLIC_SITE_OPERATOR_NAME: 'Skorovas S-lag SA',
			PUBLIC_SITE_OPERATOR_ORG_NUMBER: '947 534 777',
			PUBLIC_SITE_OPERATOR_ADDRESS: 'Myra 2, 7893 Skorovatn',
			PUBLIC_PRIVACY_CONTACT_EMAIL: 'personvern@example.no'
		});

		expect(config.isProduction).toBe(true);
		expect(config.operatorIsComplete).toBe(true);
		expect(config.analyticsEnabled).toBe(true);
	});

	it('does not enable analytics with placeholder operator details', () => {
		const config = createPublicSiteConfig({
			PUBLIC_DEPLOY_TARGET: 'production',
			PUBLIC_GTM_CONTAINER_ID: 'GTM-THZ27K96'
		});

		expect(config.analyticsEnabled).toBe(false);
	});
});
