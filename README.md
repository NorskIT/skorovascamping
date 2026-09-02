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

`npm run preview` serves the production build through the Cloudflare Workers runtime. `npm run deploy` performs a direct production deployment for recovery or initial setup; normal deployments should come from Git.

## Delivery workflow

1. Create a feature branch and open a pull request against `main`.
2. GitHub Actions runs the `quality` status check.
3. Cloudflare Workers Builds creates an isolated `*.workers.dev` preview for the branch.
4. Review the preview and merge only when all checks are green.
5. A merge to `main` deploys that commit automatically to production.

Configure a GitHub branch rule for `main` with:

- pull requests required;
- the `quality` status check required;
- the Cloudflare Workers Builds check required after its first run;
- force pushes and branch deletion disabled;
- zero required approving reviews, so a sole developer can merge after checks pass.

## Cloudflare setup

Create or sign in to the Cloudflare account that will own the website, then import the public GitHub repository `NorskIT/skorovascamping` under **Workers & Pages**.

Use these build settings:

| Setting                   | Value                          |
| ------------------------- | ------------------------------ |
| Worker name               | `skorovasscamping`             |
| Production branch         | `main`                         |
| Build command             | `npm run build`                |
| Production deploy command | `npx wrangler deploy`          |
| Preview deploy command    | `npx wrangler versions upload` |
| Build variable            | `NODE_VERSION=24.18.0`         |

The committed `wrangler.jsonc` enables Workers preview URLs. Cloudflare creates and manages the deployment token for its native Git integration; do not add Cloudflare credentials to the repository.

## Domain cutover

The `.no` domain must be bought from a Norid registrar before production can use it. Recheck availability immediately before purchase.

1. Register `skorovasscamping.no` and enable automatic renewal.
2. Add the domain as a zone on the website's Cloudflare account.
3. Replace the registrar's nameservers with the two nameservers assigned by Cloudflare.
4. Add `skorovasscamping.no` as the Worker's custom production domain.
5. Add `www.skorovasscamping.no` in Cloudflare DNS and create a permanent redirect to `https://skorovasscamping.no` while preserving path and query string.
6. Verify HTTPS, the redirect, DNSSEC and the production commit before announcing the site.

The existing `.com` website remains untouched during this setup.

## Rollback

Cloudflare retains Worker versions. If a production deployment fails after merge, open the Worker in Cloudflare, select **Deployments**, and roll back to the last verified version. Follow up with a Git revert so `main` again represents production.
