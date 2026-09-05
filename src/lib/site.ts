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
	PUBLIC_PRIVACY_CONTACT_EMAIL?: string;
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

const placeholder = 'XXXXX';

const valueOrPlaceholder = (value?: string) => value?.trim() || placeholder;

export function createPublicSiteConfig(environment: PublicSiteEnvironment): PublicSiteConfig {
	const target = Object.values(DeployTarget).includes(
		environment.PUBLIC_DEPLOY_TARGET as DeployTarget
	)
		? (environment.PUBLIC_DEPLOY_TARGET as DeployTarget)
		: DeployTarget.Local;
	const gtmContainerId = environment.PUBLIC_GTM_CONTAINER_ID?.trim() ?? '';
	const operator = {
		name: valueOrPlaceholder(environment.PUBLIC_SITE_OPERATOR_NAME),
		organisationNumber: valueOrPlaceholder(environment.PUBLIC_SITE_OPERATOR_ORG_NUMBER),
		address: valueOrPlaceholder(environment.PUBLIC_SITE_OPERATOR_ADDRESS),
		privacyEmail: valueOrPlaceholder(environment.PUBLIC_PRIVACY_CONTACT_EMAIL),
		privacyPhone: valueOrPlaceholder(environment.PUBLIC_PRIVACY_CONTACT_PHONE)
	};
	const operatorIsComplete =
		operator.name !== placeholder &&
		operator.organisationNumber !== placeholder &&
		operator.address !== placeholder &&
		(operator.privacyEmail !== placeholder || operator.privacyPhone !== placeholder);
	const isProduction = target === DeployTarget.Production;
	const bookingPhone = valueOrPlaceholder(environment.PUBLIC_BOOKING_PHONE);
	const bookingEmail = valueOrPlaceholder(environment.PUBLIC_BOOKING_EMAIL);
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
		contactFormEnabled: Boolean(turnstileSiteKey && bookingEmail !== placeholder),
		analyticsEnabled:
			isProduction && operatorIsComplete && /^GTM-[A-Z0-9]+$/.test(gtmContainerId)
	};
}

export const siteConfig = createPublicSiteConfig(import.meta.env);
