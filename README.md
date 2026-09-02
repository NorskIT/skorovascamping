# Skorovas Camping

Infrastructure for the new `skorovasscamping.no` website. The application is built with SvelteKit and deployed to Cloudflare Workers.

The current page is deliberately a minimal, non-indexable placeholder. Content, translated routes, SEO metadata, contact forms and booking integrations belong to later phases.

## Requirements

- Node.js 24.18.0 (see `.nvmrc` and `.node-version`)
- npm 11

Install dependencies and start local development:

```sh
npm ci
npm run dev
```

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
3. Every push to a non-`main` branch is tested and deploys to the shared `skorovasscamping-beta` Worker. The latest successful branch deployment wins.
4. Review the shared beta site and merge only when all checks are green.
5. A merge to `main` is tested again and deploys that commit to the `skorovasscamping` production Worker.

Configure a GitHub branch rule for `main` with:

- pull requests required;
- the `quality` status check required;
- force pushes and branch deletion disabled;
- zero required approving reviews, so a sole developer can merge after checks pass.

## Cloudflare setup

The deployment workflow needs these GitHub repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID;
- `CLOUDFLARE_API_TOKEN`: a scoped token with permission to edit Workers Scripts on that account.

The committed `wrangler.jsonc` defines separate production and beta Workers. Both have temporary `workers.dev` addresses until the custom domains can be attached.

## Domain cutover

The `.no` domain must be bought from a Norid registrar before production can use it. Recheck availability immediately before purchase.

1. Wait until `skorovasscamping.no` is active in Cloudflare after the nameserver change.
2. Add `skorovasscamping.no` as the production Worker's custom domain.
3. Add `beta.skorovasscamping.no` as the beta Worker's custom domain.
4. Add `www.skorovasscamping.no` and create a permanent redirect to `https://skorovasscamping.no` while preserving path and query string.
5. Verify HTTPS, the redirect, DNSSEC and the deployed production commit before announcing the site.

While nameservers are propagating, use the two `workers.dev` addresses. The placeholder deliberately blocks indexing on both environments; beta must remain non-indexable when production content is opened for indexing.

The existing `.com` website remains untouched during this setup.

## Rollback

Cloudflare retains Worker versions. If a production deployment fails after merge, open the Worker in Cloudflare, select **Deployments**, and roll back to the last verified version. Follow up with a Git revert so `main` again represents production.
