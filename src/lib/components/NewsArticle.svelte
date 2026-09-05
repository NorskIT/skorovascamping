<script lang="ts">
	import { resolve } from '$app/paths';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { NewsDocument } from '$lib/content';
	import { getMessages, localizedPath } from '$lib/i18n';
	import { getEnhancedImage, getImageUrl } from '$lib/images';
	import { getSeoDocument, canonicalUrl } from '$lib/seo';
	import { siteConfig, siteName } from '$lib/site';

	let { document }: { document: NewsDocument } = $props();
	const Body = $derived(document.component);
	const text = $derived(getMessages(document.locale));
	const hero = $derived(getEnhancedImage(document.heroImage));
	const structuredData = $derived({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: document.heading,
		datePublished: document.publishedAt,
		dateModified: document.updatedAt,
		mainEntityOfPage: canonicalUrl(document.path),
		publisher: { '@type': 'Organization', name: siteName },
		image: new URL(getImageUrl(document.heroImage), canonicalUrl('/')).toString()
	});
</script>

<SeoHead document={getSeoDocument(document.path)} {structuredData} />
<main class="wrap article-page">
	<a
		class="back"
		href={resolve('/[...path]', { path: localizedPath('news', document.locale).slice(1) })}
		>← {text.latestNews}</a
	>
	{#if document.status === 'review' && !siteConfig.isProduction}<p class="review">
			{text.reviewBadge}
		</p>{/if}
	<p class="eyebrow">{document.eyebrow}</p>
	<h1>{document.heading}</h1>
	<time datetime={document.publishedAt}
		>{new Intl.DateTimeFormat(document.locale, { dateStyle: 'long' }).format(
			new Date(document.publishedAt)
		)}</time
	>
	<div class="hero"><enhanced:img src={hero} alt={document.heroAlt} /></div>
	<article><Body /></article>
</main>

<style>
	.article-page {
		padding-top: clamp(3rem, 7vw, 6rem);
		padding-bottom: 6rem;
	}
	.back {
		display: inline-block;
		margin-bottom: 2.5rem;
		font-weight: 700;
	}
	.review {
		padding: 0.7rem 1rem;
		background: #fff4d9;
		border-left: 4px solid #c58a17;
	}
	.eyebrow {
		margin-top: 2rem;
		color: #8c5c09;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.13em;
	}
	h1 {
		max-width: 15ch;
		margin: 0.5rem 0 1rem;
		font:
			500 clamp(2.7rem, 7vw, 5.5rem)/1 Georgia,
			serif;
	}
	time {
		color: #5c695f;
	}
	.hero {
		margin: 2.5rem 0;
		max-height: 42rem;
		overflow: hidden;
		border-radius: 1rem;
	}
	.hero :global(picture),
	.hero :global(img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	article {
		max-width: 46rem;
		font-size: 1.1rem;
		line-height: 1.75;
	}
</style>
