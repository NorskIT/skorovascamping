interface TurnstileOptions {
	sitekey: string;
	action: string;
	theme: 'light';
	language: string;
	callback: (token: string) => void;
	'expired-callback': () => void;
	'error-callback': () => void;
}
export interface Turnstile {
	render(container: HTMLElement, options: TurnstileOptions): string | undefined;
	reset(widgetId: string): void;
	remove(widgetId: string): void;
}
declare global {
	interface Window {
		turnstile?: Turnstile;
		skorovasTurnstileReady?: () => void;
	}
}
let loading: Promise<Turnstile> | undefined;
export function loadTurnstile(): Promise<Turnstile> {
	if (window.turnstile) return Promise.resolve(window.turnstile);
	if (loading) return loading;
	loading = new Promise<Turnstile>((resolve, reject) => {
		const script = document.createElement('script');
		const fail = () => {
			clearTimeout(timeout);
			script.remove();
			delete window.skorovasTurnstileReady;
			reject(new Error('Turnstile unavailable'));
		};
		const timeout = window.setTimeout(fail, 15_000);
		window.skorovasTurnstileReady = () => {
			clearTimeout(timeout);
			delete window.skorovasTurnstileReady;
			if (window.turnstile) resolve(window.turnstile);
			else fail();
		};
		script.src =
			'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=skorovasTurnstileReady';
		script.async = true;
		script.onerror = fail;
		document.head.appendChild(script);
	}).catch((error) => {
		loading = undefined;
		throw error;
	});
	return loading;
}
