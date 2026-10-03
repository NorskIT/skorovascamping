<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import { addDays, bookingUrl, osloToday, validBookingDates } from '$lib/booking';
	import { trackBooking } from '$lib/analytics/tracking';
	import type { Locale } from '$lib/i18n';

	let { locale }: { locale: Locale } = $props();
	const messages = {
		nb: {
			stay: 'Overnatting',
			types: ['Bobil', 'Campingvogn', 'Telt'],
			arrival: 'Ankomst',
			departure: 'Avreise',
			search: 'Søk og bestill',
			hint: 'Bestillingen fortsetter hos Campio',
			close: 'Lukk kalender',
			previous: 'Forrige måned',
			next: 'Neste måned',
			invalid: 'Velg ankomst fra i dag og avreise tidligst dagen etter.'
		},
		en: {
			stay: 'Accommodation',
			types: ['Motorhome', 'Caravan', 'Tent'],
			arrival: 'Arrival',
			departure: 'Departure',
			search: 'Search and book',
			hint: 'Continue your booking on Campio',
			close: 'Close calendar',
			previous: 'Previous month',
			next: 'Next month',
			invalid: 'Choose arrival today or later and departure at least one day after arrival.'
		},
		de: {
			stay: 'Übernachtung',
			types: ['Wohnmobil', 'Wohnwagen', 'Zelt'],
			arrival: 'Anreise',
			departure: 'Abreise',
			search: 'Suchen und buchen',
			hint: 'Die Buchung wird bei Campio fortgesetzt',
			close: 'Kalender schließen',
			previous: 'Vorheriger Monat',
			next: 'Nächster Monat',
			invalid: 'Wählen Sie die Anreise ab heute und die Abreise frühestens am Folgetag.'
		}
	};
	const text = $derived(messages[locale]);
	let today = $state('');
	let startDate = $state('');
	let endDate = $state('');
	let month = $state('');
	let choosing = $state<'startDate' | 'endDate'>('startDate');
	let focused = $state('');
	let error = $state(false);
	let calendar: HTMLDialogElement;
	let invoker: HTMLButtonElement;
	let position = $state({ left: 0, top: 0 });
	const minimum = $derived(choosing === 'startDate' ? today : startDate && addDays(startDate, 1));
	const months = $derived(month ? [month, nextMonth(month, 1)] : []);
	const weekdays = $derived(
		Array.from({ length: 7 }, (_, i) =>
			new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(
				new Date(Date.UTC(2026, 0, 5 + i))
			)
		)
	);
	onMount(() => {
		today = osloToday();
		startDate = today;
		endDate = addDays(today, 1);
	});
	function nextMonth(value: string, offset: number) {
		const date = new SvelteDate(`${value.slice(0, 7)}-01T12:00:00Z`);
		date.setUTCMonth(date.getUTCMonth() + offset);
		return date.toISOString().slice(0, 10);
	}
	function days(value: string) {
		const first = new Date(`${value}T12:00:00Z`);
		const blanks = (first.getUTCDay() + 6) % 7;
		const count = new Date(`${addDays(nextMonth(value, 1), -1)}T12:00:00Z`).getUTCDate();
		return [
			...Array<string>(blanks).fill(''),
			...Array.from({ length: count }, (_, i) => addDays(value, i))
		];
	}
	function label(value: string, full = false) {
		if (!value) return '—';
		return new Intl.DateTimeFormat(locale, {
			dateStyle: full ? 'full' : 'short',
			timeZone: 'UTC'
		}).format(new Date(`${value}T12:00:00Z`));
	}
	async function focusDay(value: string) {
		focused = value < minimum ? minimum : value;
		// Keep the focused day in the first month, also when only one month is visible.
		month = `${focused.slice(0, 7)}-01`;
		await tick();
		calendar.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus();
	}
	async function open(field: 'startDate' | 'endDate', button: HTMLButtonElement) {
		today = osloToday();
		if (startDate < today) startDate = today;
		if (endDate <= startDate) endDate = addDays(startDate, 1);
		choosing = field;
		invoker = button;
		const rect = button.getBoundingClientRect();
		const width = Math.min(736, window.innerWidth - 24);
		position = {
			left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
			top: 12
		};
		await focusDay(field === 'startDate' ? startDate : endDate);
		calendar.showModal();
		await tick();
		const height = calendar.getBoundingClientRect().height;
		position.top =
			rect.top - height - 8 >= 12
				? rect.top - height - 8
				: Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - height - 12));
		await focusDay(focused);
	}
	async function choose(value: string) {
		error = false;
		if (choosing === 'startDate') {
			startDate = value;
			if (endDate <= startDate) endDate = addDays(startDate, 1);
			choosing = 'endDate';
			await tick();
			await focusDay(endDate);
		} else {
			endDate = value;
			calendar.close();
		}
	}
	function keydown(event: KeyboardEvent, value: string) {
		const offsets: Record<string, number> = {
			ArrowLeft: -1,
			ArrowRight: 1,
			ArrowUp: -7,
			ArrowDown: 7
		};
		let target: string;
		if (event.key in offsets) target = addDays(value, offsets[event.key]);
		else if (event.key === 'PageUp' || event.key === 'PageDown')
			target = nextMonth(value, event.key === 'PageUp' ? -1 : 1);
		else if (event.key === 'Home' || event.key === 'End') {
			const weekday = (new Date(`${value}T12:00:00Z`).getUTCDay() + 6) % 7;
			target = addDays(value, event.key === 'Home' ? -weekday : 6 - weekday);
		} else return;
		event.preventDefault();
		void focusDay(target);
	}
	function submit(event: SubmitEvent) {
		event.preventDefault();
		today = osloToday();
		if (!validBookingDates({ startDate, endDate }, today)) {
			error = true;
			return;
		}
		trackBooking();
		window.location.assign(bookingUrl(locale, { startDate, endDate }));
	}
</script>

<div class="booking-bar">
	<form onsubmit={submit} aria-label={text.search}>
		<div class="accommodation">
			<span class="label">{text.stay}</span>
			<div class="types">
				{#each text.types as type, index (type)}
					<span
						><svg
							viewBox="0 0 28 24"
							aria-hidden="true"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
						>
							{#if index === 2}<path d="M2 21 14 3l12 18H2Zm7 0 5-10 5 10M12 3l4 0" />
							{:else}<path d="M2 17V5h16l6 6v6H2Zm16-12v7h6M5 8h7v5H5Z" /><circle
									cx="7"
									cy="18"
									r="2.5"
								/><circle cx="20" cy="18" r="2.5" />{#if index === 1}<path
										d="M24 16h3"
									/>{/if}{/if}
						</svg>{type}</span
					>
				{/each}
			</div>
		</div>
		{#each ['startDate', 'endDate'] as field (field)}
			<button
				class="date-field"
				type="button"
				disabled={!today}
				aria-haspopup="dialog"
				onclick={(event) => open(field as 'startDate' | 'endDate', event.currentTarget)}
			>
				<span class="label">{field === 'startDate' ? text.arrival : text.departure}</span>
				<strong
					>{label(field === 'startDate' ? startDate : endDate)}
					<span aria-hidden="true">⌄</span></strong
				>
			</button>
		{/each}
		<button class="search" type="submit" disabled={!today}
			>{text.search} <span aria-hidden="true">→</span></button
		>
	</form>
	<p class="hint">{text.hint}</p>
	{#if error}<p role="alert">{text.invalid}</p>{/if}
</div>

<dialog
	bind:this={calendar}
	class="calendar"
	style:left={`${position.left}px`}
	style:top={`${position.top}px`}
	aria-label={choosing === 'startDate' ? text.arrival : text.departure}
	onclose={() => invoker?.focus()}
	onclick={(event) => {
		if (event.target === calendar) calendar.close();
	}}
>
	<div class="calendar-inner">
		<div class="calendar-toolbar">
			<strong aria-live="polite"
				>{choosing === 'startDate' ? text.arrival : text.departure}</strong
			>
			<button type="button" onclick={() => calendar.close()} aria-label={text.close}>×</button
			>
		</div>
		<div class="month-navigation">
			<button
				type="button"
				aria-label={text.previous}
				disabled={month <= minimum.slice(0, 7) + '-01'}
				onclick={() => focusDay(nextMonth(month, -1))}>‹</button
			>
			<button
				type="button"
				aria-label={text.next}
				onclick={() => focusDay(nextMonth(month, 1))}>›</button
			>
		</div>
		<div class="months">
			{#each months as value, index (value)}
				<section
					class:second-month={index === 1}
					aria-label={new Intl.DateTimeFormat(locale, {
						month: 'long',
						year: 'numeric',
						timeZone: 'UTC'
					}).format(new Date(`${value}T12:00:00Z`))}
				>
					<h3 aria-live="polite">
						{new Intl.DateTimeFormat(locale, {
							month: 'long',
							year: 'numeric',
							timeZone: 'UTC'
						}).format(new Date(`${value}T12:00:00Z`))}
					</h3>
					<div class="days">
						{#each weekdays as day (day)}<span class="weekday">{day}</span>{/each}
						{#each days(value) as day, dayIndex (dayIndex)}
							{#if day}<button
									type="button"
									data-date={day}
									aria-label={label(day, true)}
									aria-pressed={day === startDate || day === endDate}
									aria-current={day === today ? 'date' : undefined}
									class:in-range={day > startDate && day < endDate}
									disabled={day < minimum}
									tabindex={day === focused ? 0 : -1}
									onkeydown={(event) => keydown(event, day)}
									onclick={() => choose(day)}>{Number(day.slice(-2))}</button
								>
							{:else}<span></span>{/if}
						{/each}
					</div>
				</section>
			{/each}
		</div>
	</div>
</dialog>

<style>
	.booking-bar {
		position: relative;
		z-index: 2;
		color: #173326;
		padding-bottom: 1.25rem;
	}
	form {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: 1.4rem;
		background: #fff;
		box-shadow: 0 0.5rem 2rem #0002;
	}
	.accommodation {
		grid-column: 1 / -1;
		padding: 0.25rem 0.5rem 0.75rem;
		border-bottom: 1px solid #d9e1db;
	}
	.label {
		display: block;
		font-size: 0.8rem;
		color: #506157;
		margin-bottom: 0.3rem;
	}
	.types {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		font-size: 0.9rem;
		font-weight: 700;
	}
	.types span {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}
	svg {
		width: 1.5rem;
		height: 1.5rem;
	}
	button {
		font: inherit;
		cursor: pointer;
		border: 0;
		color: inherit;
		background: transparent;
	}
	button:disabled {
		cursor: default;
		opacity: 0.4;
	}
	.date-field {
		padding: 0.5rem;
		text-align: left;
		border-radius: 0.5rem;
	}
	.date-field:hover {
		background: #edf3ed;
	}
	.date-field strong {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.search {
		grid-column: 1 / -1;
		border-radius: 999px;
		padding: 1rem 1.3rem;
		background: #17563f;
		color: white;
		font-weight: 750;
	}
	.search:hover {
		background: #103c2c;
	}
	.hint {
		margin: 0.65rem 0 0;
		text-align: center;
		color: white;
		font-size: 0.85rem;
	}
	[role='alert'] {
		background: white;
		padding: 0.5rem;
		border-radius: 0.5rem;
	}
	.calendar {
		position: fixed;
		margin: 0;
		padding: 0;
		width: min(46rem, calc(100vw - 24px));
		max-width: none;
		max-height: calc(100dvh - 24px);
		border: 0;
		border-radius: 1rem;
		color: #173326;
		background: white;
		box-shadow: 0 1rem 3rem #0004;
	}
	.calendar::backdrop {
		background: #071c1433;
	}
	.calendar-inner {
		position: relative;
	}
	.calendar-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.3rem 1rem;
		background: #17563f;
		color: white;
	}
	.calendar-toolbar button,
	.month-navigation button {
		width: 44px;
		height: 44px;
		font-size: 1.7rem;
	}
	.month-navigation {
		position: absolute;
		top: 3.3rem;
		left: 0.5rem;
		right: 0.5rem;
		display: flex;
		justify-content: space-between;
		pointer-events: none;
	}
	.month-navigation button {
		pointer-events: auto;
	}
	.months {
		display: grid;
	}
	.months section {
		min-width: 0;
		padding: 0.5rem 0.75rem 1rem;
	}
	h3 {
		text-align: center;
		font-size: 1.1rem;
		margin: 0.6rem 2rem 1rem;
		text-transform: capitalize;
	}
	.days {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		text-align: center;
	}
	.weekday {
		font-size: 0.75rem;
		padding: 0.5rem 0;
		font-weight: 750;
	}
	.days button {
		min-height: 44px;
		border-radius: 0.5rem;
	}
	.days button:hover:not(:disabled) {
		box-shadow: inset 0 0 0 2px #17563f;
	}
	.days button.in-range {
		background: #e6f0e4;
		border-radius: 0;
	}
	.days button[aria-pressed='true'] {
		background: #17563f;
		color: white;
	}
	.days button[aria-current='date'] {
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	.second-month {
		display: none;
	}
	@media (min-width: 42rem) {
		.months {
			grid-template-columns: 1fr 1fr;
		}
		.second-month {
			display: block;
			border-left: 1px solid #d9e1db;
		}
	}
	@media (min-width: 68rem) {
		form {
			grid-template-columns: minmax(0, 1.6fr) 1fr 1fr auto;
			align-items: center;
			border-radius: 999px;
			padding: 0.75rem 1rem;
		}
		.accommodation {
			grid-column: auto;
			border-bottom: 0;
			border-right: 1px solid #d9e1db;
			padding: 0.25rem 1rem;
		}
		.search {
			grid-column: auto;
		}
	}
</style>
