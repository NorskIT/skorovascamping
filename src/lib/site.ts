import { defaultBookingEmail } from './contact-email.js';

export const siteName = 'Skorovas Camping';
export const productionOrigin = 'https://skorovascamping.no';

export enum DeployTarget {
	Local = 'local',
	Beta = 'beta',
	Production = 'production'
}

export interface PublicSiteEnvironment {
	PUBLIC_DEPLOY_TARGET?: string;
	PUBLIC_GTM_CONTAINER_ID?: string;
	PUBLIC_SITE_OPERATOR_NAME?: string;
	PUBLIC_SITE_OPERATOR_ORG_NUMBER?: string;
	PUBLIC_SITE_OPERATOR_ADDRESS?: string;
	PUBLIC_PRIVACY_CONTACT_PHONE?: string;
	PUBLIC_BOOKING_PHONE?: string;
	PUBLIC_BOOKING_EMAIL?: string;
	PUBLIC_TURNSTILE_SITE_KEY?: string;
}

export interface SiteOperator {
	name: string;
	organisationNumber: string;
	address: string;
	privacyEmail: string;
	privacyPhone: string;
}

export interface PublicSiteConfig {
	target: DeployTarget;
	isProduction: boolean;
	gtmContainerId: string;
	operator: SiteOperator;
	operatorIsComplete: boolean;
	analyticsEnabled: boolean;
	bookingPhone: string;
	bookingEmail: string;
	turnstileSiteKey: string;
	contactFormEnabled: boolean;
}

export const unconfirmedValue = 'XXX';

const isUnconfirmed = (value?: string) => !value || /^X{3,5}$/i.test(value);
const valueOrPlaceholder = (value?: string) => {
	const trimmed = value?.trim();
	return isUnconfirmed(trimmed) ? unconfirmedValue : trimmed || unconfirmedValue;
};
const optionalPhone = (value?: string) => {
	const trimmed = value?.trim();
	return isUnconfirmed(trimmed) ? '' : trimmed || '';
};

export function createPublicSiteConfig(environment: PublicSiteEnvironment): PublicSiteConfig {
	const target = Object.values(DeployTarget).includes(
		environment.PUBLIC_DEPLOY_TARGET as DeployTarget
	)
		? (environment.PUBLIC_DEPLOY_TARGET as DeployTarget)
		: DeployTarget.Local;
	const gtmContainerId = environment.PUBLIC_GTM_CONTAINER_ID?.trim() ?? '';
	const configuredBookingEmail = environment.PUBLIC_BOOKING_EMAIL?.trim();
	const bookingEmail = isUnconfirmed(configuredBookingEmail)
		? defaultBookingEmail
		: configuredBookingEmail || defaultBookingEmail;
	const operator = {
		name: valueOrPlaceholder(environment.PUBLIC_SITE_OPERATOR_NAME),
		organisationNumber: valueOrPlaceholder(environment.PUBLIC_SITE_OPERATOR_ORG_NUMBER),
		address: valueOrPlaceholder(environment.PUBLIC_SITE_OPERATOR_ADDRESS),
		privacyEmail: bookingEmail,
		privacyPhone: optionalPhone(environment.PUBLIC_PRIVACY_CONTACT_PHONE)
	};
	const operatorIsComplete =
		operator.name !== unconfirmedValue &&
		operator.organisationNumber !== unconfirmedValue &&
		operator.address !== unconfirmedValue &&
		(operator.privacyEmail !== unconfirmedValue || Boolean(operator.privacyPhone));
	const isProduction = target === DeployTarget.Production;
	if (isProduction && !operatorIsComplete)
		throw new Error(
			'Production requires confirmed operator name, organisation number and address'
		);
	const bookingPhone = optionalPhone(environment.PUBLIC_BOOKING_PHONE);
	const turnstileSiteKey = environment.PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? '';

	return {
		target,
		isProduction,
		gtmContainerId,
		operator,
		operatorIsComplete,
		bookingPhone,
		bookingEmail,
		turnstileSiteKey,
		contactFormEnabled: Boolean(turnstileSiteKey && bookingEmail !== unconfirmedValue),
		analyticsEnabled:
			isProduction && operatorIsComplete && /^GTM-[A-Z0-9]+$/.test(gtmContainerId)
	};
}

export const siteConfig = createPublicSiteConfig(import.meta.env);
