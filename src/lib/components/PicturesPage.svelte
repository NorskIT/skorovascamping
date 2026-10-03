<script lang="ts">
	import type { ContentDocument } from '$lib/content';
	import { photos } from '$lib/photos';
	import { getSeoDocument } from '$lib/seo';
	import PhotoGallery from '$lib/components/PhotoGallery.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';

	let { document }: { document: ContentDocument } = $props();
	const Body = $derived(document.component);
</script>

<SeoHead document={getSeoDocument(document.path)} />
<main class="wrap pictures-page">
	<p class="eyebrow">{document.eyebrow}</p>
	<h1>{document.heading}</h1>
	<div class="intro"><Body /></div>
	<PhotoGallery items={photos} locale={document.locale} grouped />
</main>

<style>
	.pictures-page {
		padding-block: clamp(3rem, 7vw, 6rem);
	}
	.eyebrow {
		color: #8c5c09;
		font-weight: 800;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}
	h1 {
		max-width: 16ch;
		margin: 0.5rem 0 1.5rem;
		font:
			500 clamp(2.7rem, 7vw, 5.5rem)/1 Georgia,
			serif;
	}
	.intro {
		max-width: 42rem;
		margin-bottom: 3rem;
		font-size: 1.15rem;
		line-height: 1.7;
	}
</style>
