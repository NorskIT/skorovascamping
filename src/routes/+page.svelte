<script lang="ts">
	import { siteName } from '$lib/site';
</script>

<svelte:head>
	<title>{siteName}</title>
	<meta name="description" content="Ny nettside kommer." />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main>
	<h1>{siteName}</h1>
	<p>Ny nettside kommer.</p>
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		font-family: system-ui, sans-serif;
		color: #17231b;
		background: #f4f6f2;
	}

	main {
		display: grid;
		min-height: 100vh;
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
