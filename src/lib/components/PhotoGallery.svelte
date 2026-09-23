<script lang="ts">
	import { tick } from 'svelte';
	import { getMessages, type Locale } from '$lib/i18n';
	import { getEnhancedImage } from '$lib/images';
	import { photoGroups, type Photo } from '$lib/photos';

	let {
		items,
		locale,
		grouped = false
	}: { items: readonly Photo[]; locale: Locale; grouped?: boolean } = $props();
	let dialog: HTMLDialogElement;
	let selected = $state<Photo | null>(null);
	const text = $derived(getMessages(locale));
	const sections = $derived(
		grouped
			? (Object.keys(photoGroups) as (keyof typeof photoGroups)[]).map((group) => ({
					id: group,
					title: photoGroups[group][locale],
					items: items.filter((photo) => photo.group === group)
				}))
			: [{ id: 'all', title: '', items }]
	);

	async function open(photo: Photo) {
		selected = photo;
		await tick();
		dialog.showModal();
	}
</script>

<div class="photo-gallery">
	{#each sections as section (section.id)}
		<section class="photo-section" aria-label={section.title || text.nav.pictures}>
			{#if section.title}<h2>{section.title}</h2>{/if}
			<div class="photo-grid">
				{#each section.items as photo (photo.id)}
					<figure>
						<button
							type="button"
							onclick={() => open(photo)}
							aria-label={`${text.openPicture}: ${photo.alt[locale]}`}
							aria-haspopup="dialog"
						>
							<enhanced:img
								src={getEnhancedImage(photo.id)}
								alt={photo.alt[locale]}
								loading="lazy"
								sizes="(min-width: 768px) 30vw, (min-width: 600px) 45vw, 95vw"
							/>
						</button>
						<figcaption>{photo.alt[locale]}</figcaption>
					</figure>
				{/each}
			</div>
		</section>
	{/each}
</div>

<dialog
	bind:this={dialog}
	aria-label={selected?.alt[locale] || text.nav.pictures}
	onclose={() => (selected = null)}
	onclick={(event) => {
		if (event.target === dialog) dialog.close();
	}}
	onkeydown={(event) => {
		if (event.key === 'Escape') dialog.close();
	}}
>
	{#if selected}
		<div class="viewer">
			<form method="dialog">
				<button type="submit">{text.closePicture} <span aria-hidden="true">×</span></button>
			</form>
			<enhanced:img
				src={getEnhancedImage(selected.id)}
				alt={selected.alt[locale]}
				sizes="95vw"
			/>
			<p>{selected.alt[locale]}</p>
		</div>
	{/if}
</dialog>

<style>
	.photo-gallery {
		display: grid;
		gap: 3.5rem;
	}
	.photo-section h2 {
		margin: 0 0 1.5rem;
		font:
			500 clamp(1.8rem, 4vw, 2.8rem)/1.1 Georgia,
			serif;
	}
	.photo-grid {
		display: grid;
		gap: 1.25rem;
		align-items: start;
	}
	figure {
		margin: 0;
		overflow: hidden;
		border-radius: 0.8rem;
		background: #e3ece4;
	}
	figure button {
		display: block;
		padding: 0;
		width: 100%;
		border: 0;
		background: #e3ece4;
		cursor: zoom-in;
	}
	figure button:focus-visible {
		outline-offset: -4px;
	}
	figure :global(picture),
	figure :global(img) {
		display: block;
		width: 100%;
		height: auto;
	}
	figcaption {
		padding: 0.9rem 1rem;
		font-size: 0.95rem;
		line-height: 1.4;
	}
	dialog {
		max-width: 100vw;
		max-height: 100dvh;
		padding: 1rem;
		border: 0;
		background: transparent;
		color: white;
	}
	dialog::backdrop {
		background: rgb(5 16 11 / 92%);
	}
	.viewer {
		display: grid;
		justify-items: center;
		gap: 0.75rem;
		max-width: 90rem;
	}
	.viewer form {
		justify-self: end;
	}
	.viewer button {
		min-height: 44px;
		padding: 0.6rem 1rem;
		border: 1px solid #b9c9be;
		border-radius: 999px;
		background: #173326;
		color: white;
		font: inherit;
		cursor: pointer;
	}
	.viewer button span {
		margin-left: 0.5rem;
		font-size: 1.4rem;
	}
	.viewer :global(picture) {
		display: contents;
	}
	.viewer :global(img) {
		display: block;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: calc(100dvh - 10rem);
		object-fit: contain;
	}
	.viewer p {
		margin: 0;
		text-align: center;
	}
	@media (min-width: 37.5rem) {
		.photo-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (min-width: 48rem) {
		.photo-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
