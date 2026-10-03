<script lang="ts">
	import { trackLead, trackContact, ContactMethod } from '$lib/analytics/tracking';
	import { getMessages, type Locale } from '$lib/i18n';
	import { siteConfig } from '$lib/site';
	import { loadTurnstile, type Turnstile } from '$lib/turnstile';

	let { locale }: { locale: Locale } = $props();
	const text = $derived(getMessages(locale));
	let submissionState = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
	let errorCode = $state('unavailable');
	let requestId = $state('');
	const errors = {
		nb: {
			validation: 'Fyll inn navn, melding og en gyldig e-postadresse eller et telefonnummer.',
			verification: 'Sikkerhetskontrollen må fornyes. Fullfør den og prøv igjen.',
			rate_limited: 'For mange forsøk. Vent ett minutt før du prøver igjen.'
		},
		en: {
			validation: 'Enter your name, message and a valid email address or phone number.',
			verification: 'Please complete the security check again before retrying.',
			rate_limited: 'Too many attempts. Please wait one minute before trying again.'
		},
		de: {
			validation:
				'Geben Sie Ihren Namen, eine Nachricht und eine gültige E-Mail-Adresse oder Telefonnummer ein.',
			verification: 'Bitte führen Sie die Sicherheitsprüfung erneut durch.',
			rate_limited:
				'Zu viele Versuche. Bitte warten Sie eine Minute und versuchen Sie es erneut.'
		}
	};

	let container = $state<HTMLDivElement>();
	let token = $state('');
	let widget: string | undefined;
	let turnstile: Turnstile | undefined;
	$effect(() => {
		const element = container;
		const language = locale;
		errorCode = 'unavailable';
		requestId = '';
		if (!element) return;
		let disposed = false;
		token = '';
		loadTurnstile()
			.then((api) => {
				if (disposed) return;
				turnstile = api;
				widget = api.render(element, {
					sitekey: siteConfig.turnstileSiteKey,
					action: 'contact',
					theme: 'light',
					language,
					callback: (value) => {
						if (!disposed) token = value;
					},
					'expired-callback': () => {
						if (!disposed) token = '';
					},
					'error-callback': () => {
						if (!disposed) {
							token = '';
							errorCode = 'verification';
							submissionState = 'error';
						}
					}
				});
			})
			.catch(() => {
				if (!disposed) submissionState = 'error';
			});
		return () => {
			disposed = true;
			if (widget !== undefined) turnstile?.remove(widget);
			widget = undefined;
		};
	});

	const feedback = {
		nb: {
			success: 'Takk! Forespørselen er sendt.',
			error: 'Kunne ikke sende nå. Prøv igjen eller send oss en e-post.'
		},
		en: {
			success: 'Thank you! Your enquiry has been sent.',
			error: 'Unable to send. Please try again or email us.'
		},
		de: {
			success: 'Vielen Dank! Ihre Anfrage wurde gesendet.',
			error: 'Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns eine E-Mail.'
		}
	} as const;

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!token || submissionState === 'sending') return;
		submissionState = 'sending';
		errorCode = 'unavailable';
		requestId = '';
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
					turnstileToken: token
				})
			});
			const result = (await response.json().catch(() => null)) as {
				ok?: unknown;
				error?: unknown;
				requestId?: unknown;
			} | null;
			const success = response.ok && result?.ok === true;
			submissionState = success ? 'success' : 'error';
			if (!success) {
				errorCode =
					typeof result?.error === 'string'
						? result.error
						: response.status === 429
							? 'rate_limited'
							: 'unavailable';
				if (
					typeof result?.requestId === 'string' &&
					/^[a-f0-9-]{36}$/.test(result.requestId)
				)
					requestId = result.requestId;
			}
			if (success) {
				form.reset();
				trackLead();
			}
		} catch {
			submissionState = 'error';
		} finally {
			token = '';
			if (widget !== undefined) turnstile?.reset(widget);
		}
	}
</script>

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
		<div bind:this={container}></div>
		<p class="privacy">{text.privacyNotice}</p>
		<button type="submit" disabled={submissionState === 'sending' || !token}>{text.send}</button
		>
		<p class="feedback" aria-live="polite">
			{submissionState === 'success'
				? feedback[locale].success
				: submissionState === 'error'
					? (errors[locale][errorCode as keyof typeof errors.nb] ??
						feedback[locale].error)
					: ''}
		</p>
		{#if submissionState === 'error'}
			<p class="feedback">
				<a
					href={`mailto:${siteConfig.bookingEmail}`}
					onclick={() => trackContact(ContactMethod.Email)}>{siteConfig.bookingEmail}</a
				>
			</p>
			{#if requestId}<p class="feedback">
					{locale === 'nb' ? 'Referanse' : locale === 'de' ? 'Referenz' : 'Reference'}: {requestId}
				</p>{/if}
		{/if}
	</form>
{:else}
	<p class="notice">
		{text.contactUnavailable}
		<a
			href={`mailto:${siteConfig.bookingEmail}`}
			onclick={() => trackContact(ContactMethod.Email)}>{siteConfig.bookingEmail}</a
		>
	</p>
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
