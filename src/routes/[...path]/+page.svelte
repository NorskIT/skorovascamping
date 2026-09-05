<script lang="ts">
	import ContentPage from '$lib/components/ContentPage.svelte';
	import NewsArticle from '$lib/components/NewsArticle.svelte';
	import SpecialPage from '$lib/components/SpecialPage.svelte';
	import { getContentDocumentByPath, getNewsDocumentByPath } from '$lib/content';
	import { routeFromPath } from '$lib/i18n';
	let { data }: { data: { path: string } } = $props();
	const content = $derived(getContentDocumentByPath(data.path));
	const article = $derived(getNewsDocumentByPath(data.path));
	const route = $derived(routeFromPath(data.path));
</script>

{#if content}<ContentPage document={content} />{:else if article}<NewsArticle
		document={article}
	/>{:else if route}<SpecialPage {route} />{/if}
