import * as CookieConsent from 'vanilla-cookieconsent';
import 'vanilla-cookieconsent/dist/cookieconsent.css';

import { siteConfig } from '$lib/site';

const analyticsCategory = 'analytics';
const consentCookieName = 'skorovas_cookie_consent';
const tagManagerScriptId = 'google-tag-manager';

const deniedConsent = {
	ad_storage: 'denied',
	ad_user_data: 'denied',
	ad_personalization: 'denied',
	analytics_storage: 'denied',
	personalization_storage: 'denied',
	security_storage: 'denied'
} as const;

function ensureGoogleCommandQueue(): void {
	window.dataLayer = window.dataLayer ?? [];
	window.gtag ??= function () {
		// Google Tag Manager expects the function's arguments object on the data layer.
		// eslint-disable-next-line prefer-rest-params
		window.dataLayer.push(arguments);
	};
}

function setDefaultGoogleConsent(): void {
	ensureGoogleCommandQueue();
	window.gtag('consent', 'default', { ...deniedConsent, wait_for_update: 500 });
	window.gtag('set', 'ads_data_redaction', true);
}

function updateGoogleConsent(): void {
	ensureGoogleCommandQueue();
	window.gtag('consent', 'update', {
		...deniedConsent,
		analytics_storage: CookieConsent.acceptedCategory(analyticsCategory) ? 'granted' : 'denied'
	});
}

function loadGoogleTagManager(): void {
	if (!siteConfig.analyticsEnabled || document.getElementById(tagManagerScriptId)) return;

	window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
	const script = document.createElement('script');
	script.id = tagManagerScriptId;
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(siteConfig.gtmContainerId)}`;
	document.head.appendChild(script);
}

const consentConfig: CookieConsent.CookieConsentConfig = {
	mode: 'opt-in',
	revision: 1,
	autoClearCookies: true,
	disablePageInteraction: true,
	cookie: {
		name: consentCookieName,
		expiresAfterDays: 180,
		sameSite: 'Lax',
		secure: true
	},
	categories: {
		necessary: {
			enabled: true,
			readOnly: true
		},
		[analyticsCategory]: {
			autoClear: {
				cookies: [{ name: /^_ga/ }, { name: '_gid' }]
			}
		}
	},
	onConsent: updateGoogleConsent,
	onChange: updateGoogleConsent,
	guiOptions: {
		consentModal: {
			layout: 'box inline',
			position: 'bottom center',
			equalWeightButtons: true
		},
		preferencesModal: {
			layout: 'box',
			equalWeightButtons: true
		}
	},
	language: {
		default: 'nb',
		translations: {
			nb: {
				consentModal: {
					title: 'Valg for informasjonskapsler',
					description:
						'Vi bruker valgfrie informasjonskapsler for å forstå hvordan nettsiden blir brukt. Du kan endre valget ditt når som helst.',
					acceptAllBtn: 'Godta analyse',
					acceptNecessaryBtn: 'Avvis valgfrie',
					showPreferencesBtn: 'Tilpass',
					footer: '<a href="/informasjonskapsler">Om informasjonskapsler</a><a href="/personvern">Personvern</a>'
				},
				preferencesModal: {
					title: 'Innstillinger for informasjonskapsler',
					acceptAllBtn: 'Godta analyse',
					acceptNecessaryBtn: 'Avvis valgfrie',
					savePreferencesBtn: 'Lagre valgene',
					closeIconLabel: 'Lukk',
					sections: [
						{
							title: 'Dine valg',
							description:
								'Nødvendige informasjonskapsler sørger for at siden husker valget ditt. Analyse er frivillig.'
						},
						{
							title: 'Nødvendige informasjonskapsler',
							description:
								'Disse brukes bare til å lagre valgene dine og kan derfor ikke slås av.',
							linkedCategory: 'necessary',
							cookieTable: {
								headers: {
									name: 'Navn',
									description: 'Formål',
									expiration: 'Varighet'
								},
								body: [
									{
										name: consentCookieName,
										description: 'Lagrer valgene dine for informasjonskapsler.',
										expiration: '180 dager'
									}
								]
							}
						},
						{
							title: 'Analyse',
							description:
								'Google Analytics hjelper oss å forstå besøk og bruksmønstre, slik at vi kan forbedre nettsiden.',
							linkedCategory: analyticsCategory,
							cookieTable: {
								headers: {
									name: 'Navn',
									description: 'Formål',
									expiration: 'Varighet'
								},
								body: [
									{
										name: '_ga, _ga_*',
										description: 'Skiller besøk og økter i Google Analytics.',
										expiration: 'Opptil 2 år'
									}
								]
							}
						}
					]
				}
			}
		}
	}
};

export async function initializeConsentAndAnalytics(): Promise<void> {
	setDefaultGoogleConsent();
	loadGoogleTagManager();
	await CookieConsent.run(consentConfig);
	updateGoogleConsent();
}

export function showCookiePreferences(): void {
	CookieConsent.showPreferences();
}

export function isAnalyticsActive(): boolean {
	return siteConfig.analyticsEnabled;
}
