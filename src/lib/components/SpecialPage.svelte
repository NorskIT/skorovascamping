<script lang="ts">
	import { resolve } from '$app/paths';
	import { showCookiePreferences } from '$lib/analytics/consent';
	import { ContactMethod, trackContact } from '$lib/analytics/tracking';
	import ContactForm from '$lib/components/ContactForm.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getNews } from '$lib/content';
	import { getMessages, type LocalizedRoute } from '$lib/i18n';
	import { getImageUrl } from '$lib/images';
	import { getSeoDocument } from '$lib/seo';
	import { siteConfig } from '$lib/site';

	let { route }: { route: LocalizedRoute } = $props();
	const text = $derived(getMessages(route.locale));
	const news = $derived(getNews(route.locale, !siteConfig.isProduction));
	const heading = $derived(
		route.id === 'news'
			? text.latestNews
			: route.id === 'contact'
				? text.contactHeading
				: route.id === 'privacy'
					? text.privacy
					: text.cookies
	);
	const legal = {
		nb: {
			privacy: [
				'Behandlingsansvarlig',
				`${siteConfig.operator.name}, organisasjonsnummer ${siteConfig.operator.organisationNumber}, er behandlingsansvarlig. Adresse: ${siteConfig.operator.address}. Kontakt: ${siteConfig.operator.privacyEmail} / ${siteConfig.operator.privacyPhone}.`,
				'Kontaktskjema og analyse',
				'Vi bruker opplysningene du sender bare for å svare på henvendelsen. Skjemaet beskyttes av Cloudflare Turnstile. Google Analytics brukes bare etter samtykke, og vi sender aldri innhold fra skjemaet til Analytics. Google Calendar lastes først etter eget samtykke til eksternt innhold.'
			],
			cookies: [
				'Våre informasjonskapsler',
				'Vi bruker en nødvendig informasjonskapsel for å lagre samtykkevalget i 180 dager. Google Analytics (_ga og _ga_*) kan lagres i opptil to år hvis du godtar analyse.',
				'Eksternt innhold',
				'Aktivitetskalenderen leveres av Google og lastes bare hvis du godtar kategorien eksternt innhold. Du kan endre alle valg når som helst.'
			]
		},
		en: {
			privacy: [
				'Data controller',
				`${siteConfig.operator.name}, organisation number ${siteConfig.operator.organisationNumber}, is the data controller. Address: ${siteConfig.operator.address}. Contact: ${siteConfig.operator.privacyEmail} / ${siteConfig.operator.privacyPhone}.`,
				'Contact form and analytics',
				'We use submitted details only to answer your enquiry. Cloudflare Turnstile protects the form. Google Analytics runs only after consent, and form content is never sent to Analytics. Google Calendar loads only after separate consent to external content.'
			],
			cookies: [
				'Our cookies',
				'We use one necessary cookie to store your consent choice for 180 days. Google Analytics cookies (_ga and _ga_*) may be stored for up to two years if you consent to analytics.',
				'External content',
				'The activity calendar is provided by Google and loads only after consent to external content. You can change your choices at any time.'
			]
		},
		de: {
			privacy: [
				'Verantwortlicher',
				`${siteConfig.operator.name}, Organisationsnummer ${siteConfig.operator.organisationNumber}, ist verantwortlich. Adresse: ${siteConfig.operator.address}. Kontakt: ${siteConfig.operator.privacyEmail} / ${siteConfig.operator.privacyPhone}.`,
				'Kontaktformular und Analyse',
				'Wir verwenden Ihre Angaben nur zur Beantwortung Ihrer Anfrage. Cloudflare Turnstile schützt das Formular. Google Analytics wird nur nach Einwilligung verwendet; Formulardaten werden nie an Analytics gesendet. Google Calendar wird erst nach gesonderter Einwilligung geladen.'
			],
			cookies: [
				'Unsere Cookies',
				'Wir verwenden ein notwendiges Cookie, das Ihre Einwilligung 180 Tage speichert. Google-Analytics-Cookies (_ga und _ga_*) können nach Einwilligung bis zu zwei Jahre gespeichert werden.',
				'Externe Inhalte',
				'Der Veranstaltungskalender wird von Google bereitgestellt und erst nach Einwilligung geladen. Sie können Ihre Auswahl jederzeit ändern.'
			]
		}
	} as const;
</script>

<SeoHead document={getSeoDocument(route.path)} />
<main class="wrap special">
	<p class="eyebrow">Skorovas Camping</p>
	<h1>{heading}</h1>
	{#if route.id === 'news'}
		<div class="news-grid">
			{#each news as item (item.path)}
				<a class="news-card" href={resolve('/[...path]', { path: item.path.slice(1) })}
					><img src={getImageUrl(item.heroImage)} alt={item.heroAlt} loading="lazy" />
					<div>
						{#if item.status === 'review'}<small>{text.reviewBadge}</small>{/if}
						<h2>{item.heading}</h2>
						<p>{item.description}</p>
					</div></a
				>
			{:else}<p>{text.noNews}</p>{/each}
		</div>
	{:else if route.id === 'contact'}
		<p class="lead">{text.contactIntro}</p>
		<div class="contact-grid">
			<div class="contact-details">
				{#if siteConfig.bookingPhone !== 'XXXXX'}<a
						href={`tel:${siteConfig.bookingPhone.replaceAll(' ', '')}`}
						onclick={() => trackContact(ContactMethod.Phone)}
						><small>{text.phone}</small>{siteConfig.bookingPhone}</a
					>{/if}
				{#if siteConfig.bookingEmail !== 'XXXXX'}<a
						href={`mailto:${siteConfig.bookingEmail}`}
						onclick={() => trackContact(ContactMethod.Email)}
						><small>{text.email}</small>{siteConfig.bookingEmail}</a
					>{/if}
			</div>
			<ContactForm locale={route.locale} />
		</div>
	{:else if route.id === 'privacy' || route.id === 'cookies'}
		<div class="legal">
			<h2>{legal[route.locale][route.id][0]}</h2>
			<p>{legal[route.locale][route.id][1]}</p>
			<h2>{legal[route.locale][route.id][2]}</h2>
			<p>{legal[route.locale][route.id][3]}</p>
			{#if route.id === 'cookies'}<button type="button" onclick={showCookiePreferences}
					>{text.cookieSettings}</button
				>{/if}
		</div>
	{/if}
</main>

<style>
	.special {
		padding-top: 9rem;
		padding-bottom: 6rem;
	}
	.eyebrow {
		color: #8c5c09;
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	h1 {
		max-width: 16ch;
		margin: 0.4rem 0 2.5rem;
		font:
			500 clamp(2.8rem, 7vw, 5.5rem)/1 Georgia,
			serif;
	}
	.lead {
		max-width: 40rem;
		margin-top: -1rem;
		margin-bottom: 2.5rem;
		font-size: 1.2rem;
	}
	.news-grid {
		display: grid;
		gap: 1.3rem;
	}
	.news-card {
		overflow: hidden;
		border-radius: 1rem;
		background: white;
		text-decoration: none;
	}
	.news-card img {
		display: block;
		width: 100%;
		aspect-ratio: 16/10;
		object-fit: cover;
	}
	.news-card div {
		padding: 1.3rem;
	}
	.news-card small {
		color: #8c5c09;
		font-weight: 800;
	}
	.news-card h2 {
		font:
			500 1.8rem Georgia,
			serif;
	}
	.contact-grid {
		display: grid;
		gap: 2rem;
	}
	.contact-details {
		display: grid;
		align-content: start;
		gap: 1rem;
	}
	.contact-details a {
		display: flex;
		flex-direction: column;
		padding: 1.2rem;
		border-radius: 0.7rem;
		background: #e3ece4;
		font-size: 1.25rem;
		font-weight: 800;
	}
	.contact-details small {
		margin-bottom: 0.35rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}
	.legal {
		max-width: 48rem;
		font-size: 1.08rem;
		line-height: 1.75;
	}
	.legal h2 {
		margin-top: 2.5rem;
		font:
			500 2rem Georgia,
			serif;
	}
	.legal button {
		padding: 0.8rem 1rem;
		border: 0;
		border-radius: 999px;
		background: #214b34;
		color: white;
		font: inherit;
		font-weight: 700;
	}
	@media (min-width: 48rem) {
		.news-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.contact-grid {
			grid-template-columns: minmax(14rem, 1fr) minmax(0, 2fr);
		}
	}
</style>
