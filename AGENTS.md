# Project instructions

## SEO and public routes

- Every public route that is added, removed, or renamed must update the central SEO route registry in the same change.
- Every indexable page must have a unique title, description, and canonical URL.
- Dynamic public routes must enumerate their published entries for the sitemap. Never include beta, admin, draft, private, or internal URLs.
- Production pages are indexable unless the route is explicitly marked otherwise. Beta and local builds must always remain `noindex`.
- Keep `robots.txt`, `sitemap.xml`, canonical URLs, and the route registry consistent. Tests that enforce this invariant must not be bypassed.

## Analytics and privacy

- Beta and local builds must never load the production Google Tag Manager container or send analytics data.
- Add an explicit analytics event when introducing a meaningful phone, email, contact, or booking CTA.
- Never send names, phone numbers, email addresses, free text, booking references, or other personal data in analytics events.
- Adding or changing a third-party service requires updating the cookie inventory and privacy notice in the same change.
- Google Ads is not enabled. Adding it requires a separate consent category, a consent revision, updated privacy text, and explicit approval.
