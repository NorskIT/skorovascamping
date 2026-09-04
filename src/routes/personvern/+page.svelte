<script lang="ts">
	import { resolve } from '$app/paths';

	import SeoHead from '$lib/components/SeoHead.svelte';
	import { getSeoRoute } from '$lib/seo';
	import { siteConfig } from '$lib/site';

	const seo = getSeoRoute('/personvern');
	const operator = siteConfig.operator;
</script>

<SeoHead route={seo} />

<main>
	<a href={resolve('/')}>← Til forsiden</a>
	<h1>Personvernerklæring</h1>

	<section>
		<h2>Behandlingsansvarlig</h2>
		<p>
			{operator.name}, organisasjonsnummer {operator.organisationNumber}, er
			behandlingsansvarlig for denne nettsiden.
		</p>
		<p>Adresse: {operator.address}</p>
		<p>E-post: {operator.privacyEmail}<br />Telefon: {operator.privacyPhone}</p>
	</section>

	<section>
		<h2>Analyse av nettsiden</h2>
		<p>
			Vi bruker Google Analytics 4 for å forstå hvordan nettsiden brukes og for å forbedre
			innholdet. Analytics kan behandle opplysninger som besøkte sider, tidspunkt, omtrentlig
			geografisk område, nettleser, enhetstype og interaksjoner på siden. Vi sender ikke navn,
			telefonnummer, e-post eller innhold fra skjemaer til Analytics.
		</p>
		<p>
			Google Consent Mode brukes med lagring avslått som standard. Begrensede signaler uten
			Analytics-cookies kan sendes før du har tatt et valg. Analytics-cookies opprettes først
			når du godtar analyse.
		</p>
		<p>
			Google behandler opplysninger på våre vegne og kan behandle data utenfor Norge. Les mer
			i
			<a href="https://policies.google.com/privacy" rel="noreferrer"
				>Googles personvernregler</a
			>.
		</p>
	</section>

	<section>
		<h2>Dine valg og rettigheter</h2>
		<p>
			Du kan avvise analyse og senere endre valget via «Cookie-innstillinger» nederst på
			siden. Du kan kontakte oss for spørsmål om innsyn, retting, sletting eller andre
			rettigheter.
		</p>
	</section>
</main>

<style>
	main {
		max-width: 48rem;
		margin: 0 auto;
		padding: 3rem 1.5rem 5rem;
		line-height: 1.65;
	}

	h1 {
		margin: 2rem 0;
	}

	section + section {
		margin-top: 2.5rem;
	}
</style>
