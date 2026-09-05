<script lang="ts">
	import { resolve } from '$app/paths';
	import { trackContact, ContactMethod } from '$lib/analytics/tracking';
	import ExternalCalendar from '$lib/components/ExternalCalendar.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { ContentDocument } from '$lib/content';
	import { getMessages, localizedPath } from '$lib/i18n';
	import { getEnhancedImage, getImageUrl } from '$lib/images';
	import { getSeoDocument } from '$lib/seo';
	import { productionOrigin, siteConfig, siteName } from '$lib/site';

	let { document }: { document: ContentDocument } = $props();
	const Body = $derived(document.component);
	const text = $derived(getMessages(document.locale));
	const seo = $derived(getSeoDocument(document.path));
	const hero = $derived(getEnhancedImage(document.heroImage));
	const contactPath = $derived(localizedPath('contact', document.locale));
	const supportingLinks = $derived(
		[
			{ id: 'camping' as const, label: text.nav.camping },
			{ id: 'experiences' as const, label: text.nav.experiences },
			{ id: 'practical' as const, label: text.nav.practical }
		].filter((item) => item.id !== document.id)
	);
	const structuredData = $derived({
		'@context': 'https://schema.org',
		'@type': 'Campground',
		name: siteName,
		url: new URL(document.path, productionOrigin).toString(),
		...(siteConfig.bookingPhone !== 'XXXXX' ? { telephone: siteConfig.bookingPhone } : {})
	});
	const practicalGallery = $derived(
		document.id === 'practical'
			? [
					{
						image: 'gruvekafeen',
						alt:
							document.locale === 'de'
								? 'Das Gruvekafeen in Skorovas'
								: document.locale === 'en'
									? 'Gruvekafeen café in Skorovas'
									: 'Gruvekafeen i Skorovas'
					},
					{
						image: 'skjenkestova',
						alt:
							document.locale === 'de'
								? 'Die Skjenkestova in Skorovas'
								: document.locale === 'en'
									? 'Skjenkestova pub in Skorovas'
									: 'Skjenkestova i Skorovas'
					},
					{
						image: 'skorovatn-chapel',
						alt:
							document.locale === 'de'
								? 'Die Kapelle von Skorovatn'
								: document.locale === 'en'
									? 'Skorovatn chapel'
									: 'Skorovatn kapell'
					}
				]
			: []
	);
</script>

<SeoHead document={seo} {structuredData} />

<main>
	<section class="hero">
		<div class="hero-media">
			<enhanced:img src={hero} alt={document.heroAlt} fetchpriority="high" />
		</div>
		<div class="hero-overlay"></div>
		<div class="hero-content wrap">
			<p class="eyebrow">{document.eyebrow}</p>
			<h1>{document.heading}</h1>
			<p class="intro">{document.description}</p>
			<a
				class="button"
				href={resolve('/[...path]', { path: contactPath.slice(1) })}
				onclick={() => trackContact(ContactMethod.Booking)}>{text.book}</a
			>
		</div>
	</section>

	{#if document.status === 'review' && !siteConfig.isProduction}
		<div class="review wrap" role="status">{text.reviewBadge}</div>
	{/if}

	<section class="article wrap">
		<div class="prose"><Body /></div>
		<aside>
			<p class="aside-kicker">{text.book}</p>
			<h2>{text.contactHeading}</h2>
			<p>{text.contactIntro}</p>
			<a class="text-link" href={resolve('/[...path]', { path: contactPath.slice(1) })}
				>{text.nav.contact} →</a
			>
		</aside>
	</section>

	{#if document.id === 'home'}
		<section class="link-section wrap" aria-labelledby="explore-title">
			<p class="eyebrow dark">Skorovas</p>
			<h2 id="explore-title">
				{document.locale === 'nb'
					? 'Planlegg oppholdet'
					: document.locale === 'en'
						? 'Plan your stay'
						: 'Planen Sie Ihren Aufenthalt'}
			</h2>
			<div class="cards">
				{#each supportingLinks as item (item.id)}
					<a
						href={resolve('/[...path]', {
							path: localizedPath(item.id, document.locale).slice(1)
						})}><strong>{item.label}</strong><span>{text.readMore} →</span></a
					>
				{/each}
			</div>
		</section>
	{/if}

	{#if document.id === 'experiences'}
		<div class="wrap"><ExternalCalendar locale={document.locale} /></div>
	{/if}

	{#if practicalGallery.length}
		<section
			class="gallery wrap"
			aria-label={document.locale === 'nb'
				? 'Steder i Skorovas'
				: document.locale === 'en'
					? 'Places in Skorovas'
					: 'Orte in Skorovas'}
		>
			{#each practicalGallery as item (item.image)}
				<figure>
					<img src={getImageUrl(item.image)} alt={item.alt} loading="lazy" />
					<figcaption>{item.alt}</figcaption>
				</figure>
			{/each}
		</section>
	{/if}
</main>

<style>
	.hero {
		position: relative;
		min-height: min(46rem, 78vh);
		display: grid;
		align-items: end;
		overflow: hidden;
		background: #173326;
		color: white;
	}
	.hero-media,
	.hero-overlay {
		position: absolute;
		inset: 0;
	}
	.hero-media :global(picture),
	.hero-media :global(img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.hero-overlay {
		background: linear-gradient(180deg, rgb(9 28 20 / 12%) 15%, rgb(9 28 20 / 82%) 100%);
	}
	.hero-content {
		position: relative;
		z-index: 1;
		padding-top: 9rem;
		padding-bottom: clamp(3rem, 8vw, 6rem);
	}
	.eyebrow {
		margin: 0 0 0.75rem;
		color: #f4cf78;
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}
	.eyebrow.dark {
		color: #8c5c09;
	}
	h1 {
		max-width: 13ch;
		margin: 0;
		font-family: Georgia, serif;
		font-size: clamp(2.8rem, 8vw, 6.5rem);
		font-weight: 500;
		line-height: 0.98;
		text-wrap: balance;
	}
	.intro {
		max-width: 42rem;
		margin: 1.35rem 0 1.8rem;
		font-size: clamp(1.05rem, 2vw, 1.3rem);
		line-height: 1.55;
	}
	.button {
		display: inline-flex;
		padding: 0.9rem 1.3rem;
		border-radius: 999px;
		background: #f2bd4e;
		color: #173326;
		font-weight: 800;
		text-decoration: none;
	}
	.review {
		margin-top: 1.5rem;
		padding: 0.75rem 1rem;
		border-left: 4px solid #c58a17;
		background: #fff4d9;
		font-weight: 700;
	}
	.article {
		display: grid;
		gap: clamp(2rem, 6vw, 6rem);
		padding-top: clamp(3rem, 7vw, 6rem);
		padding-bottom: clamp(3rem, 7vw, 6rem);
	}
	.prose {
		min-width: 0;
	}
	.prose :global(h2) {
		margin: 0 0 1rem;
		font-family: Georgia, serif;
		font-size: clamp(1.8rem, 4vw, 2.7rem);
		font-weight: 500;
		color: #173326;
	}
	.prose :global(h2:not(:first-child)) {
		margin-top: 3rem;
	}
	.prose :global(p),
	.prose :global(li) {
		font-size: 1.08rem;
		line-height: 1.75;
	}
	.prose :global(ul) {
		padding-left: 1.3rem;
	}
	aside {
		align-self: start;
		padding: 1.6rem;
		border-radius: 1rem;
		background: #e3ece4;
	}
	aside h2 {
		margin: 0.25rem 0 0.65rem;
		font-family: Georgia, serif;
		font-weight: 500;
	}
	.aside-kicker {
		margin: 0;
		color: #7c560c;
		font-size: 0.78rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}
	.text-link {
		font-weight: 800;
		color: #214b34;
	}
	.link-section {
		padding-bottom: clamp(4rem, 8vw, 7rem);
	}
	.link-section h2 {
		margin: 0 0 1.5rem;
		font:
			500 clamp(2rem, 5vw, 3.5rem)/1.1 Georgia,
			serif;
	}
	.cards {
		display: grid;
		gap: 1rem;
	}
	.cards a {
		display: grid;
		min-height: 10rem;
		align-content: space-between;
		padding: 1.4rem;
		border-radius: 0.8rem;
		background: #173326;
		color: white;
		text-decoration: none;
	}
	.cards strong {
		font:
			500 1.7rem Georgia,
			serif;
	}
	.cards span {
		color: #f4cf78;
		font-weight: 700;
	}
	.gallery {
		display: grid;
		gap: 1rem;
		padding-bottom: clamp(4rem, 8vw, 7rem);
	}
	.gallery figure {
		margin: 0;
		overflow: hidden;
		border-radius: 0.8rem;
		background: #e3ece4;
	}
	.gallery img {
		display: block;
		width: 100%;
		aspect-ratio: 4/3;
		object-fit: cover;
	}
	.gallery figcaption {
		padding: 0.75rem 1rem;
		font-weight: 700;
	}
	@media (min-width: 48rem) {
		.article {
			grid-template-columns: minmax(0, 2fr) minmax(16rem, 1fr);
		}
		.cards {
			grid-template-columns: repeat(3, 1fr);
		}
		.gallery {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
