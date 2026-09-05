export const locales = ['nb', 'en', 'de'] as const;
export type Locale = (typeof locales)[number];

export type PageId =
	| 'home'
	| 'camping'
	| 'experiences'
	| 'skorovas'
	| 'practical'
	| 'news'
	| 'contact'
	| 'privacy'
	| 'cookies';

export interface LocalizedRoute {
	id: PageId;
	locale: Locale;
	path: string;
}

const paths: Record<PageId, Record<Locale, string>> = {
	home: { nb: '/', en: '/en', de: '/de' },
	camping: { nb: '/camping', en: '/en/camping', de: '/de/camping' },
	experiences: { nb: '/opplevelser', en: '/en/experiences', de: '/de/erlebnisse' },
	skorovas: { nb: '/skorovas', en: '/en/skorovas', de: '/de/skorovas' },
	practical: {
		nb: '/praktisk-informasjon',
		en: '/en/practical-information',
		de: '/de/praktische-informationen'
	},
	news: { nb: '/nyheter', en: '/en/news', de: '/de/neuigkeiten' },
	contact: { nb: '/kontakt', en: '/en/contact', de: '/de/kontakt' },
	privacy: { nb: '/personvern', en: '/en/privacy', de: '/de/datenschutz' },
	cookies: { nb: '/informasjonskapsler', en: '/en/cookies', de: '/de/cookies' }
};

export const localizedRoutes: readonly LocalizedRoute[] = Object.entries(paths).flatMap(
	([id, routes]) => locales.map((locale) => ({ id: id as PageId, locale, path: routes[locale] }))
);

export function localizedPath(id: PageId, locale: Locale): string {
	return paths[id][locale];
}

export function routeFromPath(path: string): LocalizedRoute | undefined {
	const normalized = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
	return localizedRoutes.find((route) => route.path === normalized);
}

export const messages = {
	nb: {
		languageName: 'Norsk',
		nav: {
			camping: 'Camping',
			experiences: 'Opplevelser',
			skorovas: 'Om Skorovas',
			practical: 'Praktisk informasjon',
			news: 'Nyheter',
			contact: 'Kontakt / bestill'
		},
		menu: 'Meny',
		closeMenu: 'Lukk meny',
		book: 'Bestill plass',
		readMore: 'Les mer',
		latestNews: 'Siste nytt',
		noNews: 'Ingen publiserte nyheter ennå.',
		backHome: 'Til forsiden',
		contactHeading: 'Kontakt og bestilling',
		contactIntro: 'Ring oss eller send en forespørsel. Vi svarer så raskt vi kan.',
		name: 'Navn',
		email: 'E-post',
		phone: 'Telefon',
		message: 'Melding',
		send: 'Send forespørsel',
		contactUnavailable: 'Kontaktskjemaet er ikke konfigurert ennå. Ta kontakt på telefon.',
		privacyNotice: 'Opplysningene brukes bare for å svare på henvendelsen din.',
		reviewBadge: 'Innhold til faktakontroll',
		cookieSettings: 'Cookie-innstillinger',
		privacy: 'Personvern',
		cookies: 'Informasjonskapsler'
	},
	en: {
		languageName: 'English',
		nav: {
			camping: 'Camping',
			experiences: 'Experiences',
			skorovas: 'About Skorovas',
			practical: 'Practical information',
			news: 'News',
			contact: 'Contact / book'
		},
		menu: 'Menu',
		closeMenu: 'Close menu',
		book: 'Book a pitch',
		readMore: 'Read more',
		latestNews: 'Latest news',
		noNews: 'No published news yet.',
		backHome: 'Back to the front page',
		contactHeading: 'Contact and booking',
		contactIntro: 'Call us or send an enquiry. We will reply as soon as possible.',
		name: 'Name',
		email: 'Email',
		phone: 'Phone',
		message: 'Message',
		send: 'Send enquiry',
		contactUnavailable: 'The contact form has not been configured yet. Please call us.',
		privacyNotice: 'Your details are used only to answer your enquiry.',
		reviewBadge: 'Content awaiting fact check',
		cookieSettings: 'Cookie settings',
		privacy: 'Privacy',
		cookies: 'Cookies'
	},
	de: {
		languageName: 'Deutsch',
		nav: {
			camping: 'Camping',
			experiences: 'Erlebnisse',
			skorovas: 'Über Skorovas',
			practical: 'Praktische Informationen',
			news: 'Neuigkeiten',
			contact: 'Kontakt / buchen'
		},
		menu: 'Menü',
		closeMenu: 'Menü schließen',
		book: 'Stellplatz anfragen',
		readMore: 'Mehr erfahren',
		latestNews: 'Aktuelles',
		noNews: 'Noch keine veröffentlichten Neuigkeiten.',
		backHome: 'Zur Startseite',
		contactHeading: 'Kontakt und Buchung',
		contactIntro:
			'Rufen Sie uns an oder senden Sie eine Anfrage. Wir antworten so bald wie möglich.',
		name: 'Name',
		email: 'E-Mail',
		phone: 'Telefon',
		message: 'Nachricht',
		send: 'Anfrage senden',
		contactUnavailable:
			'Das Kontaktformular ist noch nicht eingerichtet. Bitte rufen Sie uns an.',
		privacyNotice: 'Ihre Angaben werden nur zur Beantwortung Ihrer Anfrage verwendet.',
		reviewBadge: 'Inhalt wartet auf Faktenprüfung',
		cookieSettings: 'Cookie-Einstellungen',
		privacy: 'Datenschutz',
		cookies: 'Cookies'
	}
} as const;

export function getMessages(locale: Locale) {
	return messages[locale];
}
