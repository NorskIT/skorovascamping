<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	import { initializeConsentAndAnalytics, showCookiePreferences } from '$lib/analytics/consent';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	onMount(() => {
		void initializeConsentAndAnalytics();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="site-shell">
	<div class="site-content">{@render children()}</div>
	<footer>
		<nav aria-label="Juridisk informasjon">
			<a href={resolve('/personvern')}>Personvern</a>
			<a href={resolve('/informasjonskapsler')}>Informasjonskapsler</a>
			<button type="button" onclick={showCookiePreferences}>Cookie-innstillinger</button>
		</nav>
	</footer>
</div>

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

	:global(a) {
		color: inherit;
	}

	.site-shell {
		display: flex;
		min-height: 100vh;
		flex-direction: column;
	}

	.site-content {
		flex: 1;
	}

	footer {
		padding: 1.25rem 2rem;
		border-top: 1px solid #d9dfda;
		background: #e9eee9;
	}

	nav {
		display: flex;
		max-width: 70rem;
		margin: 0 auto;
		flex-wrap: wrap;
		gap: 1rem 1.5rem;
		align-items: center;
		font-size: 0.9rem;
	}

	button {
		padding: 0;
		border: 0;
		font: inherit;
		text-decoration: underline;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	:global(#cc-main) {
		--cc-btn-primary-bg: #244d35;
		--cc-btn-primary-hover-bg: #193b28;
		--cc-btn-secondary-bg: #dfe8e1;
		--cc-btn-secondary-hover-bg: #d1ddd4;
		--cc-toggle-on-bg: #244d35;
	}
</style>
