// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface ImportMetaEnv {
		readonly PUBLIC_DEPLOY_TARGET?: string;
		readonly PUBLIC_GTM_CONTAINER_ID?: string;
		readonly PUBLIC_SITE_OPERATOR_NAME?: string;
		readonly PUBLIC_SITE_OPERATOR_ORG_NUMBER?: string;
		readonly PUBLIC_SITE_OPERATOR_ADDRESS?: string;
		readonly PUBLIC_PRIVACY_CONTACT_EMAIL?: string;
		readonly PUBLIC_PRIVACY_CONTACT_PHONE?: string;
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}

	interface Window {
		dataLayer: unknown[];
		gtag: (...args: unknown[]) => void;
	}

	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
