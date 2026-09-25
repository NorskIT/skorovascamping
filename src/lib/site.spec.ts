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
		expect(config.operator.name).toBe('XXX');
		expect(config.operator.organisationNumber).toBe('XXX');
		expect(config.operator.address).toBe('XXX');
		expect(config.contactFormEnabled).toBe(false);
	});

	it('enables the contact form only with public booking details and Turnstile', () => {
		const config = createPublicSiteConfig({
			PUBLIC_BOOKING_EMAIL: 'booking@example.no',
			PUBLIC_TURNSTILE_SITE_KEY: 'site-key'
		});
		expect(config.contactFormEnabled).toBe(true);
		expect(config.operator.privacyEmail).toBe(config.bookingEmail);
	});

	it('uses the confirmed email without inventing a phone number', () => {
		const config = createPublicSiteConfig({});
		expect(config.bookingEmail).toBe('booking@skorovascamping.no');
		expect(config.bookingPhone).toBe('');
		expect(config.operator.privacyPhone).toBe('');
		expect(createPublicSiteConfig({ PUBLIC_BOOKING_PHONE: 'XXXXX' }).bookingPhone).toBe('');
		expect(createPublicSiteConfig({ PUBLIC_BOOKING_PHONE: 'XXX' }).bookingPhone).toBe('');
	});

	it('only enables analytics for a completely configured production build', () => {
		const config = createPublicSiteConfig({
			PUBLIC_DEPLOY_TARGET: 'production',
			PUBLIC_GTM_CONTAINER_ID: 'GTM-THZ27K96',
			PUBLIC_SITE_OPERATOR_NAME: 'Skorovas S-lag SA',
			PUBLIC_SITE_OPERATOR_ORG_NUMBER: '947 534 777',
			PUBLIC_SITE_OPERATOR_ADDRESS: 'Myra 2, 7893 Skorovatn',
			PUBLIC_BOOKING_EMAIL: 'booking@example.no'
		});

		expect(config.isProduction).toBe(true);
		expect(config.operatorIsComplete).toBe(true);
		expect(config.analyticsEnabled).toBe(true);
	});

	it('does not enable analytics with placeholder operator details', () => {
		expect(() =>
			createPublicSiteConfig({
				PUBLIC_DEPLOY_TARGET: 'production',
				PUBLIC_GTM_CONTAINER_ID: 'GTM-THZ27K96'
			})
		).toThrow('Production requires confirmed operator');
		expect(() =>
			createPublicSiteConfig({
				PUBLIC_DEPLOY_TARGET: 'production',
				PUBLIC_SITE_OPERATOR_NAME: 'XXX',
				PUBLIC_SITE_OPERATOR_ORG_NUMBER: 'XXXXX',
				PUBLIC_SITE_OPERATOR_ADDRESS: 'XXX'
			})
		).toThrow('Production requires confirmed operator');
	});
});
