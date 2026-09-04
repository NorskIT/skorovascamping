# Skorovas Camping

Infrastructure for the new `skorovascamping.no` website. The application is built with SvelteKit and deployed to Cloudflare Workers.

The current page is deliberately minimal. Production is indexable, while beta and local builds remain non-indexable. Content, translated routes, contact forms and booking integrations belong to later phases.

## Requirements

- Node.js 24.18.0 (see `.nvmrc` and `.node-version`)
- npm 11

Install dependencies and start local development:

```sh
npm ci
npm run dev
```

In Cursor or VS Code, open **Run and Debug**, select **SvelteKit: localhost**, and press `F5`. The committed debug profile starts the development server and opens `http://127.0.0.1:5173` with browser debugging enabled.

## Quality checks

Run the same checks used by GitHub Actions:

```sh
npm run lint
npm run check
npm run test:unit -- --run
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run preview` serves the production build through the Cloudflare Workers runtime. `npm run deploy:beta` and `npm run deploy` perform direct beta and production deployments for recovery or initial setup; normal deployments come from GitHub Actions.

## Delivery workflow

1. Create a feature branch and open a pull request against `main`.
2. GitHub Actions runs the required `quality` status check on the pull request.
3. Every push to a non-`main` branch is tested and deploys to the shared `skorovascamping-beta` Worker. The latest successful branch deployment wins.
4. Review the shared beta site and merge only when all checks are green.
5. A merge or push to `main` runs the quality checks but does not deploy.
6. Deploy production manually from **Actions > Deploy Production > Run workflow**. Select `main` or another branch before starting the workflow.

Beta can also be deployed manually from **Actions > Deploy Beta > Run workflow**, using the same branch selector. The manual workflow buttons are available after the workflow files have been merged into the default branch.

The deployment workflow sets `PUBLIC_DEPLOY_TARGET` at build time. Production emits indexable metadata and crawler instructions; beta emits `noindex` metadata and an `X-Robots-Tag` header. Do not set this variable manually in GitHub.

Configure a GitHub branch rule for `main` with:

- pull requests required;
- the `quality` status check required;
- force pushes and branch deletion disabled;
- zero required approving reviews, so a sole developer can merge after checks pass.

## Cloudflare setup

1. In Cloudflare, create an account API token from the **Edit Cloudflare Workers** template. Limit its account resources to the account that owns the site and its zone resources to `skorovascamping.no`.
2. Copy the account ID from **Workers & Pages > Account Details**, or search for **Copy account ID** in the Cloudflare dashboard.
3. Add these GitHub repository secrets under **Settings > Secrets and variables > Actions**:

- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID;
- `CLOUDFLARE_API_TOKEN`: the scoped token created above.

Do not commit either value. The committed `wrangler.jsonc` defines separate production and beta Workers and manages both custom domains. Cloudflare creates the required DNS records and TLS certificates during the first deployment, so do not create A or CNAME records for these hostnames manually.

## First deployment

The Cloudflare zone must be active before the first deployment. Its assigned nameservers are already authoritative for `skorovascamping.no`.

1. Add the two GitHub secrets described above.
2. Push a non-`main` branch to deploy `https://beta.skorovascamping.no` automatically.
3. Verify HTTPS, the placeholder content, `noindex` metadata and `robots.txt` on beta.
4. Merge the infrastructure pull request after beta is verified.
5. Open **Actions > Deploy Production**, select the intended branch and run the workflow to deploy `https://skorovascamping.no`.

Production is indexable. Beta must remain non-indexable.

The existing `.com` website remains untouched during this setup.

## SEO and analytics

All public pages are registered in `src/lib/seo.ts`. Adding, removing or renaming a page must update that registry in the same change; it is the source for canonical URLs and `sitemap.xml`. A unit test fails if a static page is missing from the registry. Additional rules are documented in `AGENTS.md`.

Google Analytics is loaded through Google Tag Manager only on production and only after the public configuration is complete. Add these non-secret values as GitHub repository or environment variables:

- `PUBLIC_GTM_CONTAINER_ID`
- `PUBLIC_SITE_OPERATOR_NAME`
- `PUBLIC_SITE_OPERATOR_ORG_NUMBER`
- `PUBLIC_SITE_OPERATOR_ADDRESS`
- `PUBLIC_PRIVACY_CONTACT_EMAIL`
- `PUBLIC_PRIVACY_CONTACT_PHONE`

See `.env.example` for local configuration. Missing operator values render as `XXXXX`; incomplete configuration prevents GTM from loading. Beta still renders the cookie-consent interface for review but never loads GTM.

## Rollback

Cloudflare retains Worker versions. If a production deployment fails after merge, open the Worker in Cloudflare, select **Deployments**, and roll back to the last verified version. Follow up with a Git revert so `main` again represents production.
