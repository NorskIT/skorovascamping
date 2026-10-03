<script lang="ts">
	import { getImageUrl } from '$lib/images';
	import { alternateDocuments, canonicalUrl, type SeoDocument } from '$lib/seo';
	import { productionOrigin, siteConfig, siteName } from '$lib/site';

	let {
		document,
		structuredData
	}: { document: SeoDocument; structuredData?: Record<string, unknown> } = $props();

	const canonical = $derived(canonicalUrl(document.path));
	const robots = $derived(
		siteConfig.isProduction && document.indexable ? 'index, follow' : 'noindex, nofollow'
	);
	const alternates = $derived(alternateDocuments(document));
	const norwegianAlternate = $derived(alternates.find((alternate) => alternate.locale === 'nb'));
	const image = $derived(
		document.image
			? new URL(getImageUrl(document.image), productionOrigin).toString()
			: undefined
	);
	const jsonLd = $derived(
		structuredData ? JSON.stringify(structuredData).replaceAll('<', '\\u003c') : ''
	);
	const jsonLdTag = $derived(`<script type="application/ld+json">${jsonLd}</` + 'script>');
</script>

<svelte:head>
	<title>{document.title}</title>
	<meta name="description" content={document.description} />
	<meta name="robots" content={robots} />
	<link rel="canonical" href={canonical} />
	{#each alternates as alternate (alternate.locale)}
		<link rel="alternate" hreflang={alternate.locale} href={canonicalUrl(alternate.path)} />
	{/each}
	{#if norwegianAlternate}
		<link rel="alternate" hreflang="x-default" href={canonicalUrl(norwegianAlternate.path)} />
	{/if}
	<meta property="og:type" content={document.type} />
	<meta property="og:locale" content={document.locale === 'nb' ? 'nb_NO' : document.locale} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={document.title} />
	<meta property="og:description" content={document.description} />
	<meta property="og:url" content={canonical} />
	{#if image}<meta property="og:image" content={image} />{/if}
	<meta name="twitter:card" content="summary_large_image" />
	{#if structuredData}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON is serialized from validated, local data and escapes opening angle brackets. -->
		{@html jsonLdTag}
	{/if}
</svelte:head>
