<script lang="ts">
	import { resolve } from '$app/paths';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { initializeConsentAndAnalytics, showCookiePreferences } from '$lib/analytics/consent';
	import { ContactMethod, trackBooking, trackContact } from '$lib/analytics/tracking';
	import { bookingUrl } from '$lib/booking';
	import norwegianFlag from 'flag-icons/flags/4x3/no.svg?url';
	import englishFlag from 'flag-icons/flags/4x3/gb.svg?url';
	import germanFlag from 'flag-icons/flags/4x3/de.svg?url';
	import { getNewsDocumentByPath, newsDocuments } from '$lib/content';
	import { getMessages, localizedPath, routeFromPath, type Locale } from '$lib/i18n';
	import { siteConfig, siteName } from '$lib/site';

	let { children } = $props();
	let menuOpen = $state(false);
	const locale = $derived(
		(routeFromPath(page.url.pathname)?.locale ??
			(page.url.pathname.startsWith('/en')
				? 'en'
				: page.url.pathname.startsWith('/de')
					? 'de'
					: 'nb')) as Locale
	);
	const text = $derived(getMessages(locale));
	const currentRoute = $derived(routeFromPath(page.url.pathname));
	const currentNews = $derived(getNewsDocumentByPath(page.url.pathname));
	const overHero = $derived(
		['home', 'camping', 'experiences', 'skorovas', 'practical'].includes(currentRoute?.id ?? '')
	);
	const navigation = $derived([
		['camping', text.nav.camping],
		['experiences', text.nav.experiences],
		['skorovas', text.nav.skorovas],
		['practical', text.nav.practical],
		['news', text.nav.news],
		['pictures', text.nav.pictures]
	] as const);
	const languageLinks = $derived(
		(['nb', 'en', 'de'] as const).map((language) => ({
			locale: language,
			label: getMessages(language).languageName,
			flag: { nb: norwegianFlag, en: englishFlag, de: germanFlag }[language],
			path: currentNews
				? (newsDocuments.find(
						(document) =>
							document.translationKey === currentNews.translationKey &&
							document.locale === language
					)?.path ?? localizedPath('news', language))
				: localizedPath(currentRoute?.id ?? 'home', language)
		}))
	);

	onMount(() => {
		void initializeConsentAndAnalytics();
	});
	afterNavigate(() => {
		menuOpen = false;
	});
	$effect(() => {
		if (typeof document !== 'undefined') document.documentElement.lang = locale;
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="16x16 32x32 48x48" />
	<link rel="icon" href="/favicon.png" type="image/png" sizes="96x96" />
</svelte:head>
<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') menuOpen = false;
	}}
/>
<div class="site-shell">
	<header class:over-hero={overHero}>
		<div class="header-inner wrap">
			<a
				class="brand"
				onclick={() => (menuOpen = false)}
				href={locale === 'nb'
					? resolve('/')
					: resolve('/[...path]', { path: localizedPath('home', locale).slice(1) })}
				aria-label={`${siteName} – ${text.backHome}`}
				><span>Skorovas</span><small>Camping</small></a
			>
			<button
				class="menu-button"
				type="button"
				aria-expanded={menuOpen}
				aria-controls="main-nav"
				onclick={() => (menuOpen = !menuOpen)}
				>{menuOpen ? text.closeMenu : text.menu}</button
			>
			<nav id="main-nav" class:open={menuOpen} aria-label={text.mainNavigation}>
				{#each navigation as [id, label] (id)}<a
						href={resolve('/[...path]', { path: localizedPath(id, locale).slice(1) })}
						onclick={() => (menuOpen = false)}>{label}</a
					>{/each}
				<a
					class="book"
					href={bookingUrl(locale)}
					rel="external"
					onclick={() => {
						menuOpen = false;
						trackBooking();
					}}>{text.book}</a
				>
				<div class="languages" aria-label={text.languageSelection}>
					{#each languageLinks as language (language.locale)}<a
							class:active={language.locale === locale}
							aria-label={language.label}
							title={language.label}
							aria-current={language.locale === locale ? 'true' : undefined}
							onclick={() => (menuOpen = false)}
							hreflang={language.locale}
							href={language.path === '/'
								? resolve('/')
								: resolve('/[...path]', { path: language.path.slice(1) })}
							><img src={language.flag} alt="" width="28" height="21" /></a
						>{/each}
				</div>
			</nav>
		</div>
	</header>
	<div class="site-content">{@render children()}</div>
	<footer>
		<div class="footer-inner wrap">
			<div>
				<strong>{siteName}</strong>
				<p>{text.tagline}</p>
			</div>
			<address class="footer-contact">
				<b>{siteConfig.operator.name}</b>
				<span>{text.organisationNumber}: {siteConfig.operator.organisationNumber}</span>
				<span>{siteConfig.operator.address}</span>
				<a
					href={`mailto:${siteConfig.bookingEmail}`}
					onclick={() => trackContact(ContactMethod.Email)}>{siteConfig.bookingEmail}</a
				>
				{#if siteConfig.bookingPhone}<a
						class="phone"
						href={`tel:${siteConfig.bookingPhone.replaceAll(' ', '')}`}
						onclick={() => trackContact(ContactMethod.Phone)}
						>{siteConfig.bookingPhone}</a
					>{/if}
			</address>
			<nav aria-label={text.legalInformation}>
				<a href={resolve('/[...path]', { path: localizedPath('contact', locale).slice(1) })}
					>{text.contactHeading}</a
				>
				<a href={resolve('/[...path]', { path: localizedPath('privacy', locale).slice(1) })}
					>{text.privacy}</a
				><a
					href={resolve('/[...path]', {
						path: localizedPath('cookies', locale).slice(1)
					})}>{text.cookies}</a
				><button type="button" onclick={showCookiePreferences}>{text.cookieSettings}</button
				>
			</nav>
		</div>
	</footer>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}
	:global(html) {
		scroll-behavior: smooth;
	}
	:global(body) {
		margin: 0;
		font-family: Inter, ui-sans-serif, system-ui, sans-serif;
		color: #1b2920;
		background: #f5f4ee;
	}
	:global(a) {
		color: inherit;
	}
	:global(.wrap) {
		width: min(100% - 2rem, 76rem);
		margin-inline: auto;
	}
	:global(:focus-visible) {
		outline: 3px solid #e5a927;
		outline-offset: 4px;
	}
	.site-shell {
		display: flex;
		min-height: 100vh;
		flex-direction: column;
	}
	.site-content {
		flex: 1;
	}
	header {
		position: relative;
		z-index: 20;
		top: 0;
		left: 0;
		width: 100%;
		color: white;
		background: #173326;
	}
	header.over-hero {
		position: absolute;
		background: linear-gradient(180deg, rgb(10 35 23 / 72%), rgb(10 35 23 / 5%));
	}
	.header-inner {
		min-height: 5.6rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		border-bottom: 1px solid rgb(255 255 255 / 35%);
	}
	.brand {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		font-family: Georgia, serif;
		font-size: 1.5rem;
		line-height: 0.8;
	}
	.brand small {
		margin-top: 0.5rem;
		font: 700 0.67rem/1 sans-serif;
		letter-spacing: 0.24em;
		text-transform: uppercase;
	}
	.menu-button {
		border: 1px solid rgb(255 255 255 / 60%);
		padding: 0.65rem 0.9rem;
		border-radius: 999px;
		color: inherit;
		background: rgb(10 38 25 / 30%);
		font: inherit;
		font-weight: 700;
	}
	header nav {
		display: none;
		position: absolute;
		top: 100%;
		left: 1rem;
		right: 1rem;
		padding: 1rem;
		border-radius: 0.8rem;
		background: #173326;
		box-shadow: 0 1rem 3rem rgb(0 0 0 / 25%);
	}
	header nav.open {
		display: grid;
		gap: 0.3rem;
	}
	header nav > a {
		padding: 0.7rem;
		text-decoration: none;
		font-weight: 700;
	}
	header .book {
		color: #173326;
		background: #f2bd4e;
		border-radius: 999px;
		text-align: center;
	}
	.languages {
		display: flex;
		gap: 0.3rem;
		padding: 0.5rem;
	}
	.languages a {
		display: grid;
		place-items: center;
		min-width: 44px;
		min-height: 44px;
		text-decoration: none;
	}
	.languages a img {
		filter: grayscale(100%);
		opacity: 0.7;
	}
	.languages a.active img {
		filter: grayscale(0);
		opacity: 1;
	}
	footer {
		padding: 3rem 0;
		background: #102b1e;
		color: #eaf1eb;
	}
	.footer-inner {
		display: grid;
		gap: 2rem;
	}
	.footer-inner strong {
		font:
			500 1.7rem Georgia,
			serif;
	}
	.footer-inner p {
		max-width: 32rem;
		color: #b9c9be;
	}
	.footer-contact {
		display: grid;
		align-content: start;
		gap: 0.7rem;
		font-style: normal;
		line-height: 1.5;
		overflow-wrap: anywhere;
	}
	footer nav {
		display: grid;
		gap: 0.7rem;
		align-content: start;
	}
	footer button {
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		text-decoration: underline;
		cursor: pointer;
	}
	.phone {
		font-size: 1.25rem;
		font-weight: 800;
	}
	:global(#cc-main) {
		--cc-btn-primary-bg: #244d35;
		--cc-btn-primary-hover-bg: #193b28;
		--cc-btn-secondary-bg: #dfe8e1;
		--cc-btn-secondary-hover-bg: #d1ddd4;
		--cc-toggle-on-bg: #244d35;
	}
	@media (min-width: 80rem) {
		.menu-button {
			display: none;
		}
		header nav,
		header nav.open {
			display: flex;
			position: static;
			align-items: center;
			gap: 0.15rem;
			padding: 0;
			background: none;
			box-shadow: none;
		}
		header nav > a {
			font-size: 0.88rem;
		}
		.footer-inner {
			grid-template-columns: 1.3fr 1.3fr 1fr;
		}
	}
</style>
