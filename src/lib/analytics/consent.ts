import * as CookieConsent from 'vanilla-cookieconsent';
import 'vanilla-cookieconsent/dist/cookieconsent.css';

import { siteConfig } from '$lib/site';

const analyticsCategory = 'analytics';
const externalMediaCategory = 'external-media';
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

function handleConsentChange(): void {
	updateGoogleConsent();
	window.dispatchEvent(new Event('skorovas:consent-change'));
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
	revision: 2,
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
		},
		[externalMediaCategory]: {}
	},
	onConsent: handleConsentChange,
	onChange: handleConsentChange,
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
		autoDetect: 'document',
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
						},
						{
							title: 'Eksternt innhold',
							description:
								'Lar oss vise Google Calendar. Kalenderen lastes ikke før du godtar denne kategorien.',
							linkedCategory: externalMediaCategory
						}
					]
				}
			},
			en: {
				consentModal: {
					title: 'Cookie choices',
					description:
						'We use optional cookies for analytics and external content. You can change your choices at any time.',
					acceptAllBtn: 'Accept all',
					acceptNecessaryBtn: 'Reject optional',
					showPreferencesBtn: 'Customise',
					footer: '<a href="/en/cookies">About cookies</a><a href="/en/privacy">Privacy</a>'
				},
				preferencesModal: {
					title: 'Cookie settings',
					acceptAllBtn: 'Accept all',
					acceptNecessaryBtn: 'Reject optional',
					savePreferencesBtn: 'Save choices',
					closeIconLabel: 'Close',
					sections: [
						{
							title: 'Your choices',
							description:
								'Necessary cookies remember your choice. Other categories are optional.'
						},
						{
							title: 'Necessary cookies',
							description: 'Used to remember your cookie choices and protect forms.',
							linkedCategory: 'necessary'
						},
						{
							title: 'Analytics',
							description: 'Google Analytics helps us improve the website.',
							linkedCategory: analyticsCategory
						},
						{
							title: 'External content',
							description: 'Allows Google Calendar to load.',
							linkedCategory: externalMediaCategory
						}
					]
				}
			},
			de: {
				consentModal: {
					title: 'Cookie-Auswahl',
					description:
						'Wir verwenden optionale Cookies für Analyse und externe Inhalte. Sie können Ihre Auswahl jederzeit ändern.',
					acceptAllBtn: 'Alle akzeptieren',
					acceptNecessaryBtn: 'Optionale ablehnen',
					showPreferencesBtn: 'Anpassen',
					footer: '<a href="/de/cookies">Über Cookies</a><a href="/de/datenschutz">Datenschutz</a>'
				},
				preferencesModal: {
					title: 'Cookie-Einstellungen',
					acceptAllBtn: 'Alle akzeptieren',
					acceptNecessaryBtn: 'Optionale ablehnen',
					savePreferencesBtn: 'Auswahl speichern',
					closeIconLabel: 'Schließen',
					sections: [
						{
							title: 'Ihre Auswahl',
							description:
								'Notwendige Cookies speichern Ihre Auswahl. Andere Kategorien sind optional.'
						},
						{
							title: 'Notwendige Cookies',
							description: 'Speichern die Cookie-Auswahl und schützen Formulare.',
							linkedCategory: 'necessary'
						},
						{
							title: 'Analyse',
							description: 'Google Analytics hilft uns, die Website zu verbessern.',
							linkedCategory: analyticsCategory
						},
						{
							title: 'Externe Inhalte',
							description: 'Erlaubt das Laden von Google Calendar.',
							linkedCategory: externalMediaCategory
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
	handleConsentChange();
}

export function showCookiePreferences(): void {
	CookieConsent.showPreferences();
}

export function isAnalyticsActive(): boolean {
	return siteConfig.analyticsEnabled;
}

export function isExternalMediaAccepted(): boolean {
	return CookieConsent.acceptedCategory(externalMediaCategory);
}
