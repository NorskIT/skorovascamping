<script lang="ts">
	import { onMount } from 'svelte';

	import { isExternalMediaAccepted, showCookiePreferences } from '$lib/analytics/consent';
	import type { Locale } from '$lib/i18n';

	let { locale }: { locale: Locale } = $props();
	let accepted = $state(false);

	const copy = {
		nb: {
			title: 'Aktivitetskalender',
			text: 'Godta eksternt innhold for å vise kalenderen fra Google.',
			button: 'Åpne cookie-innstillinger'
		},
		en: {
			title: 'Activity calendar',
			text: 'Accept external content to display the Google calendar.',
			button: 'Open cookie settings'
		},
		de: {
			title: 'Veranstaltungskalender',
			text: 'Akzeptieren Sie externe Inhalte, um den Google-Kalender anzuzeigen.',
			button: 'Cookie-Einstellungen öffnen'
		}
	} as const;

	onMount(() => {
		const refresh = () => (accepted = isExternalMediaAccepted());
		refresh();
		window.addEventListener('skorovas:consent-change', refresh);
		return () => window.removeEventListener('skorovas:consent-change', refresh);
	});
</script>

<section class="calendar" aria-labelledby="calendar-title">
	<h2 id="calendar-title">{copy[locale].title}</h2>
	{#if accepted}
		<iframe
			title={copy[locale].title}
			src="https://calendar.google.com/calendar/embed?src=skorovas.liv%40gmail.com&amp;ctz=Europe%2FOslo"
			loading="lazy"
		></iframe>
	{:else}
		<p>{copy[locale].text}</p>
		<button type="button" onclick={showCookiePreferences}>{copy[locale].button}</button>
	{/if}
</section>

<style>
	.calendar {
		margin-top: 3rem;
		padding: clamp(1.25rem, 4vw, 2rem);
		border-radius: 1rem;
		background: #e7eee8;
	}

	iframe {
		width: 100%;
		height: min(70vh, 38rem);
		border: 0;
		border-radius: 0.5rem;
		background: white;
	}

	button {
		padding: 0.75rem 1rem;
		border: 0;
		border-radius: 999px;
		background: #214b34;
		color: white;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}
</style>
