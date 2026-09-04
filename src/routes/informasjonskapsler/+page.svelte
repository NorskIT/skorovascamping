<script lang="ts">
	import { resolve } from '$app/paths';

	import SeoHead from '$lib/components/SeoHead.svelte';
	import { showCookiePreferences } from '$lib/analytics/consent';
	import { getSeoRoute } from '$lib/seo';

	const seo = getSeoRoute('/informasjonskapsler');
</script>

<SeoHead route={seo} />

<main>
	<a href={resolve('/')}>← Til forsiden</a>
	<h1>Informasjonskapsler</h1>
	<p>
		Informasjonskapsler er små datafiler som nettleseren lagrer. Vi bruker én nødvendig
		informasjonskapsel for å huske valget ditt. Google Analytics-cookies brukes bare når du har
		godtatt analyse.
	</p>

	<div class="table-wrapper">
		<table>
			<caption>Informasjonskapsler som kan brukes på nettsiden</caption>
			<thead>
				<tr><th>Navn</th><th>Kategori</th><th>Formål</th><th>Varighet</th></tr>
			</thead>
			<tbody>
				<tr>
					<td><code>skorovas_cookie_consent</code></td>
					<td>Nødvendig</td>
					<td>Husker valgene dine.</td>
					<td>180 dager</td>
				</tr>
				<tr>
					<td><code>_ga</code>, <code>_ga_*</code></td>
					<td>Analyse</td>
					<td>Skiller besøk og økter i Google Analytics.</td>
					<td>Opptil 2 år</td>
				</tr>
			</tbody>
		</table>
	</div>

	<button type="button" onclick={showCookiePreferences}>Endre cookie-innstillinger</button>
</main>

<style>
	main {
		max-width: 58rem;
		margin: 0 auto;
		padding: 3rem 1.5rem 5rem;
		line-height: 1.65;
	}

	h1 {
		margin: 2rem 0 1rem;
	}

	.table-wrapper {
		overflow-x: auto;
		margin: 2rem 0;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		background: white;
	}

	caption {
		padding-bottom: 0.75rem;
		font-weight: 700;
		text-align: left;
	}

	th,
	td {
		padding: 0.75rem;
		border: 1px solid #ced8d0;
		text-align: left;
		vertical-align: top;
	}

	button {
		padding: 0.75rem 1rem;
		border: 0;
		border-radius: 0.35rem;
		background: #244d35;
		color: white;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}
</style>
