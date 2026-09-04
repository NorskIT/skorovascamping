<script lang="ts">
	import { canonicalUrl, type SeoRoute } from '$lib/seo';
	import { siteConfig, siteName } from '$lib/site';

	let { route }: { route: SeoRoute } = $props();

	const canonical = $derived(canonicalUrl(route.path));
	const robots = $derived(
		siteConfig.isProduction && route.indexable ? 'index, follow' : 'noindex, nofollow'
	);
</script>

<svelte:head>
	<title>{route.title}</title>
	<meta name="description" content={route.description} />
	<meta name="robots" content={robots} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="nb_NO" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={route.title} />
	<meta property="og:description" content={route.description} />
	<meta property="og:url" content={canonical} />
</svelte:head>
