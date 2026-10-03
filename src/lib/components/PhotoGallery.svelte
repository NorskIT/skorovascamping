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
	let selectedIndex = $state<number | null>(null);
	const selected = $derived(selectedIndex === null ? null : (items[selectedIndex] ?? null));
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
		selectedIndex = items.indexOf(photo);
		await tick();
		dialog.showModal();
	}

	async function changePhoto(index: number) {
		if (!items.length) return;
		selectedIndex = (index + items.length) % items.length;
		await tick();
		dialog
			.querySelector<HTMLButtonElement>('.thumbnail[aria-pressed="true"]')
			?.scrollIntoView({ block: 'nearest', inline: 'center' });
	}

	function movePhoto(offset: number) {
		if (selectedIndex !== null) void changePhoto(selectedIndex + offset);
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
	aria-label={`${text.nav.pictures}: ${selected?.alt[locale] ?? ''}`}
	onclose={() => (selectedIndex = null)}
	onclick={(event) => {
		if (event.target === dialog) dialog.close();
	}}
	onkeydown={(event) => {
		if (selectedIndex === null) return;
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			event.preventDefault();
			movePhoto(event.key === 'ArrowLeft' ? -1 : 1);
		}
	}}
>
	{#if selected && selectedIndex !== null}
		<div class="viewer">
			<div class="viewer-header">
				<span aria-live="polite">{selectedIndex + 1} / {items.length}</span>
				<button
					type="button"
					class="close"
					aria-label={text.closePicture}
					onclick={() => dialog.close()}><span aria-hidden="true">×</span></button
				>
			</div>
			<div class="stage">
				<enhanced:img
					src={getEnhancedImage(selected.id)}
					alt={selected.alt[locale]}
					sizes="95vw"
				/>
				{#if items.length > 1}
					<button
						type="button"
						class="arrow previous"
						aria-label={text.previousPicture}
						onclick={() => movePhoto(-1)}><span aria-hidden="true">‹</span></button
					>
					<button
						type="button"
						class="arrow next"
						aria-label={text.nextPicture}
						onclick={() => movePhoto(1)}><span aria-hidden="true">›</span></button
					>
				{/if}
			</div>
			<p class="caption">{selected.alt[locale]}</p>
			<div class="thumbnails" role="group" aria-label={text.galleryThumbnails}>
				{#each items as photo, index (photo.id)}
					<button
						type="button"
						class="thumbnail"
						class:active={index === selectedIndex}
						aria-label={`${index + 1}: ${photo.alt[locale]}`}
						aria-pressed={index === selectedIndex}
						onclick={() => changePhoto(index)}
					>
						<enhanced:img
							src={getEnhancedImage(photo.id)}
							alt=""
							loading="lazy"
							sizes="80px"
						/>
					</button>
				{/each}
			</div>
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
		width: min(90rem, calc(100vw - 1rem));
		height: min(60rem, calc(100dvh - 1rem));
		max-width: none;
		max-height: none;
		padding: 0;
		border: 0;
		border-radius: 0.75rem;
		background: #0d1913;
		color: white;
	}
	dialog::backdrop {
		background: rgb(5 16 11 / 92%);
	}
	.viewer {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto auto;
		height: 100%;
	}
	.viewer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.4rem 0.75rem 0.4rem 1rem;
	}
	.viewer button {
		border: 0;
		background: rgb(13 25 19 / 85%);
		color: white;
		font: inherit;
		cursor: pointer;
	}
	.viewer button:focus-visible {
		outline: 2px solid #f4cf78;
		outline-offset: 2px;
	}
	.viewer .close {
		min-width: 44px;
		min-height: 44px;
		border-radius: 50%;
	}
	.close span {
		font-size: 2rem;
		line-height: 1;
	}
	.stage {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 0;
		overflow: hidden;
	}
	.stage :global(picture) {
		display: block;
		width: 100%;
		height: 100%;
	}
	.stage :global(img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.viewer .arrow {
		position: absolute;
		top: 50%;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		transform: translateY(-50%);
	}
	.arrow span {
		font-size: 2rem;
		line-height: 1;
	}
	.previous {
		left: 0.5rem;
	}
	.next {
		right: 0.5rem;
	}
	.caption {
		margin: 0;
		padding: 0.65rem 1rem;
		text-align: center;
	}
	.thumbnails {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		padding: 0.5rem 1rem 1rem;
	}
	.viewer .thumbnail {
		flex: none;
		width: 5rem;
		height: 4rem;
		padding: 0;
		overflow: hidden;
		border: 3px solid transparent;
		border-radius: 0.35rem;
	}
	.viewer .thumbnail.active {
		border-color: #f4cf78;
	}
	.thumbnail :global(picture),
	.thumbnail :global(img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
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
