<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getSeoRoute } from '$lib/seo';
	import { siteName } from '$lib/site';

	const seo = getSeoRoute('/');
</script>

<SeoHead route={seo} />

<main>
	<h1>{siteName}</h1>
	<p>Ny nettside kommer.</p>
</main>

<style>
	main {
		display: grid;
		min-height: calc(100vh - 4rem);
		place-content: center;
		padding: 2rem;
		text-align: center;
	}

	h1,
	p {
		margin: 0;
	}

	p {
		margin-top: 0.75rem;
		color: #526157;
	}
</style>
