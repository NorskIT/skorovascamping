<script lang="ts">
	import { trackLead } from '$lib/analytics/tracking';
	import { getMessages, type Locale } from '$lib/i18n';
	import { siteConfig } from '$lib/site';

	let { locale }: { locale: Locale } = $props();
	const text = $derived(getMessages(locale));
	let state = $state<'idle' | 'sending' | 'success' | 'error'>('idle');

	const feedback = {
		nb: {
			success: 'Takk! Forespørselen er sendt.',
			error: 'Kunne ikke sende nå. Prøv igjen eller ring oss.'
		},
		en: {
			success: 'Thank you! Your enquiry has been sent.',
			error: 'Unable to send. Please try again or call us.'
		},
		de: {
			success: 'Vielen Dank! Ihre Anfrage wurde gesendet.',
			error: 'Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.'
		}
	} as const;

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		state = 'sending';
		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					name: data.get('name'),
					email: data.get('email'),
					phone: data.get('phone'),
					message: data.get('message'),
					company: data.get('company'),
					locale,
					turnstileToken: data.get('cf-turnstile-response')
				})
			});
			state = response.ok ? 'success' : 'error';
			if (response.ok) {
				form.reset();
				trackLead();
			}
		} catch {
			state = 'error';
		}
	}
</script>

<svelte:head>
	{#if siteConfig.contactFormEnabled}
		<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
	{/if}
</svelte:head>

{#if siteConfig.contactFormEnabled}
	<form onsubmit={submit}>
		<div class="field">
			<label for="contact-name">{text.name}</label>
			<input
				id="contact-name"
				name="name"
				autocomplete="name"
				required
				minlength="2"
				maxlength="100"
			/>
		</div>
		<div class="columns">
			<div class="field">
				<label for="contact-email">{text.email}</label>
				<input
					id="contact-email"
					name="email"
					type="email"
					autocomplete="email"
					maxlength="254"
				/>
			</div>
			<div class="field">
				<label for="contact-phone">{text.phone}</label>
				<input
					id="contact-phone"
					name="phone"
					type="tel"
					autocomplete="tel"
					maxlength="40"
				/>
			</div>
		</div>
		<div class="field">
			<label for="contact-message">{text.message}</label>
			<textarea id="contact-message" name="message" required minlength="10" maxlength="2000"
			></textarea>
		</div>
		<div class="trap" aria-hidden="true">
			<label for="contact-company">Company</label>
			<input id="contact-company" name="company" tabindex="-1" autocomplete="off" />
		</div>
		<div
			class="cf-turnstile"
			data-sitekey={siteConfig.turnstileSiteKey}
			data-theme="light"
		></div>
		<p class="privacy">{text.privacyNotice}</p>
		<button type="submit" disabled={state === 'sending'}>{text.send}</button>
		<p class="feedback" aria-live="polite">
			{state === 'success'
				? feedback[locale].success
				: state === 'error'
					? feedback[locale].error
					: ''}
		</p>
	</form>
{:else}
	<p class="notice">{text.contactUnavailable}</p>
{/if}

<style>
	form {
		display: grid;
		gap: 1.25rem;
		max-width: 42rem;
		padding: clamp(1.25rem, 4vw, 2rem);
		border-radius: 1rem;
		background: white;
		box-shadow: 0 1rem 3rem rgb(19 50 34 / 8%);
	}
	.columns {
		display: grid;
		gap: 1rem;
	}
	.field {
		display: grid;
		gap: 0.4rem;
	}
	label {
		font-weight: 700;
	}
	input,
	textarea {
		width: 100%;
		padding: 0.8rem;
		border: 1px solid #89998e;
		border-radius: 0.4rem;
		font: inherit;
	}
	textarea {
		min-height: 9rem;
		resize: vertical;
	}
	input:focus,
	textarea:focus {
		outline: 3px solid #d9a441;
		outline-offset: 2px;
	}
	button {
		justify-self: start;
		padding: 0.85rem 1.25rem;
		border: 0;
		border-radius: 999px;
		background: #214b34;
		color: white;
		font: inherit;
		font-weight: 750;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.6;
	}
	.trap {
		position: absolute;
		left: -10000px;
	}
	.privacy,
	.feedback {
		margin: 0;
		font-size: 0.9rem;
		color: #506157;
	}
	.notice {
		padding: 1rem;
		border-left: 4px solid #d9a441;
		background: #fff8e7;
	}
	@media (min-width: 42rem) {
		.columns {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
