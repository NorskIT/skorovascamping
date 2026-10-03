import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Public Vite configuration in .env is not a Worker runtime binding.
const result = spawnSync(
	process.execPath,
	[
		fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url)),
		'types',
		...process.argv.slice(2)
	],
	{
		stdio: 'inherit',
		env: { ...process.env, CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false' }
	}
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
