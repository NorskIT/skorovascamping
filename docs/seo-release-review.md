# Review before publishing skorovascamping.no

Beta is for the camping owners to review. Its pages must remain `noindex`; the production build must continue to fail while any content document has `status: review`. Do not change statuses simply to make a deployment pass.

## Owner review on beta

Review each core page in Norwegian, English and German using the language links on the page: home, camping, experiences, Skorovas, practical information and pictures. Review both Norwegian news articles separately. Check the meaning of every translation, image/caption, link, event date and place name.

- Confirm the exact legal operator name, organisation number, postal address, privacy contact and whether a public phone number should be shown. Supply the three `PUBLIC_SITE_OPERATOR_*` GitHub variables before production is built.
- Confirm camping pitch counts, electricity, water, toilet, shower, disposal and nearby services. Check seasonal access and opening hours with the responsible operators.
- Approve actual prices and what each price includes, or approve accurate wording without a price. No public page may show `XXX` or `XXXXX` after publication.
- Check that each “Book a pitch” link opens the correct Skorovas Camping profile on Campio in that language. Verify the booking email and contact flow.
- Check article publication/update dates against the events. Update `updatedAt` only when the article or page materially changes.
- Record the reviewer and approval date for each page/language. Change its status to `published` only after approval; core pages must be approved in all three languages together. News may be approved in selected languages.

## Technical release gate

On beta, verify direct loads of `/`, `/camping`, `/en/camping`, `/de/camping`, `/bilder`, `/en/pictures`, `/de/bilder`, the contact page and a news article. All have readable server HTML, one H1, the expected title, description, language, canonical and reciprocal `hreflang`. Beta must have `noindex`; its sitemap contains no production URLs. Unknown routes return 404.

After editorial approval, run format, lint, type check, unit tests, end-to-end tests and a production build. The build must reject remaining review content, missing operator details and invalid metadata. Production deployment is a separate step after the owners have approved beta.

After production deployment, verify HTTP and `www` redirect to the corresponding HTTPS URL, all published routes return 200 without `noindex`, `robots.txt` allows crawling and names the working sitemap, and every sitemap URL resolves to its own canonical. Confirm production with URL Inspection and submit the sitemap in Google Search Console and Bing Webmaster Tools for `.no`. Keep a record of the first indexing and search-performance reports. Check actual bot access in Cloudflare and real-user Core Web Vitals as data becomes available.

## Ongoing content rule

Any new public route or renamed page updates the central route and SEO registries, tests, sitemap membership and language links in the same change. Publish only verified facts and genuine translations. Link new content from a relevant existing page. Review time-sensitive facilities, prices and event information monthly or when the operator reports a change. Do not update `lastmod` for a routine deploy.
