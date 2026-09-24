import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		url: 'http://localhost:4173',
		env: {
			PUBLIC_DEPLOY_TARGET: 'beta',
			PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
			TURNSTILE_SECRET: '',
			PUBLIC_SITE_OPERATOR_NAME: 'Skorovas samvirkelag SA',
			PUBLIC_SITE_OPERATOR_ORG_NUMBER: '947 534 777',
			PUBLIC_SITE_OPERATOR_ADDRESS: 'Kleiva 2, 7893 Skorovas'
		}
	},
	use: { baseURL: 'http://localhost:4173' },
	testMatch: '**/*.e2e.{ts,js}'
});
