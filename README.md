# Skorovas Camping

Infrastructure for the new `skorovascamping.no` website. The application is built with SvelteKit and deployed to Cloudflare Workers.

The site contains a beta-ready content foundation in Norwegian, English and German. Production is indexable, while beta and local builds remain non-indexable. Imported content stays marked for review until it has been fact-checked.

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

Google Analytics is loaded through Google Tag Manager only on production and only after the public configuration is complete. Add these non-secret values under **Settings > Environments > beta / production > Environment variables** (see the full configuration table below):

- `PUBLIC_GTM_CONTAINER_ID`
- `PUBLIC_SITE_OPERATOR_NAME`
- `PUBLIC_SITE_OPERATOR_ORG_NUMBER`
- `PUBLIC_SITE_OPERATOR_ADDRESS`
- `PUBLIC_PRIVACY_CONTACT_PHONE`

See `.env.example` for local configuration. Missing operator values render as `XXXXX`; incomplete configuration prevents GTM from loading. Beta still renders the cookie-consent interface for review but never loads GTM.

## Content and translations

Landing pages live in `src/content/pages` and news articles in `src/content/news`. Content metadata is validated during the build: MDsveX pages use frontmatter, while native Svelte pages export `metadata` from a `<script module>` block. The new picture pages use native Svelte to avoid MDsveX 0.12.8's generated legacy module syntax. Core content uses a shared page ID in `nb`, `en` and `de`; routes and language links are defined centrally in `src/lib/i18n.ts`.

Use `status: review` for drafts, imports and facts that may have changed. Review content appears on beta without a public review badge, remains `noindex`, is excluded from the sitemap and blocks production builds. Language alternatives can be previewed on beta; production only exposes published translations. The verification checklist is in `docs/content-review.md`.

The picture gallery uses localized routes: `/bilder`, `/en/pictures` and `/de/bilder`. Routing and translations are managed centrally in `src/lib/i18n.ts`; this project does not use Paraglide. The photo catalogue in `src/lib/photos.ts` provides translated captions and page selections. Photos in `src/lib/assets/content` use the existing responsive image pipeline. Original September uploads are preserved locally in the ignored `.local/image-originals` directory and are not deployed.

## Booking

Booking buttons link to Skorovas Camping on Campio in the visitor's language. The URL is centralized in `src/lib/booking.ts`; this integration needs no API credentials. The link loads no Campio scripts or cookies on this website. Booking clicks emit `begin_booking` through the existing production analytics configuration.

The default contact address is `booking@skorovascamping.no`; `PUBLIC_BOOKING_EMAIL` can override it. Leave `PUBLIC_BOOKING_PHONE` empty until an actual phone number has been confirmed. No default phone number is provided. Prices remain `XXX` until approved.

## Contact form

All deployed configuration is maintained in GitHub. No Worker variables or secrets need to be entered manually in Cloudflare. The reusable deployment job selects the GitHub environment `beta` or `production`, builds with its public variables, and deploys with its server secrets. Validation and deployment are defined directly in `.github/workflows/_deploy-worker.yml`, with no separate deployment scripts. The workflow uses the installed Wrangler's supported `deploy --secrets-file` option to upload code and secrets together. Temporary files are private and removed after the command; secret values are never placed in command arguments or printed by the workflow.

Put shared values under **Settings > Secrets and variables > Actions**. Use **Settings > Environments > beta / production** only for values that differ, such as the production GTM ID or separate Turnstile widgets. Environment values override repository defaults.

| GitHub type | Name                              | Value / requirement                                                                                               |
| ----------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Variable    | `PUBLIC_BOOKING_EMAIL`            | Single email address for booking, privacy, and contact sender/recipient; defaults to `booking@skorovascamping.no` |
| Variable    | `PUBLIC_BOOKING_PHONE`            | Optional; leave unset until a real number is confirmed                                                            |
| Variable    | `PUBLIC_SITE_OPERATOR_NAME`       | Legal business name                                                                                               |
| Variable    | `PUBLIC_SITE_OPERATOR_ORG_NUMBER` | Organisation number                                                                                               |
| Variable    | `PUBLIC_SITE_OPERATOR_ADDRESS`    | Business address                                                                                                  |
| Variable    | `PUBLIC_PRIVACY_CONTACT_PHONE`    | Optional; confirmed number only                                                                                   |
| Variable    | `PUBLIC_GTM_CONTAINER_ID`         | Optional; production GTM container ID. Leave unset for beta                                                       |
| Variable    | `PUBLIC_TURNSTILE_SITE_KEY`       | Required to enable the contact form                                                                               |
| Secret      | `TURNSTILE_SECRET_KEY`            | Secret matching that Turnstile site key                                                                           |

The shared repository secrets `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` remain under **Settings > Secrets and variables > Actions**. `PUBLIC_DEPLOY_TARGET` is automatic; do not configure it yourself. A local `.env` is not uploaded. Run a new deployment after changing GitHub values.

The contact form is optional. Configure `PUBLIC_BOOKING_EMAIL` as a normal repository variable, never as a secret. This is the only email variable: it is used for all public contact links and as both sender and recipient for the contact form. The visitor's email is used only as Reply-To. It is compiled into the site and server at build time; no separate runtime email secrets are needed.

Leave both `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` unset to use the email link alone. Supplying only one stops the workflow with the missing name. Removing both and redeploying disables the form, removes its email binding and overwrites the server Turnstile secret with an empty value. The booking email alone never enables the form.

One-time service setup is still required: create a Turnstile widget allowing the relevant beta/production hostnames, and [onboard the sender domain to Cloudflare Email Service](https://developers.cloudflare.com/email-service/get-started/send-emails/). These are service activation steps, not duplicate environment-variable configuration. The deployment step creates the `CONTACT_EMAIL` binding automatically when the contact values are complete, restricted to `PUBLIC_BOOKING_EMAIL` as both recipient and sender. Rate limiting remains declared in `wrangler.jsonc`.

The direct `npm run deploy` recovery commands do not synchronize GitHub secrets or generate this binding. Use GitHub Actions for normal deployments and configuration changes.

The `www.skorovascamping.no` custom domain is attached to the production Worker and permanently redirects to the apex hostname while preserving the path and query string.

## Rollback

Cloudflare retains Worker versions. If a production deployment fails after merge, open the Worker in Cloudflare, select **Deployments**, and roll back to the last verified version. Follow up with a Git revert so `main` again represents production.
