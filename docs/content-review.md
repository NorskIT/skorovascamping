# Content review before production

The first content migration is intentionally visible on beta with `status: review`. A production build fails while any routed landing page or article still has that status.

## Facts to verify

- Camping: four powered pitches by Flerbrukshuset, six unpowered pitches at Lille Skorovatn and whether tents are still accepted there.
- Prices: NOK 300 for a motorhome/caravan and NOK 100 for a tent, including the stated facilities.
- Facilities: current access to water and toilets, unavailable shower, recycling containers and the free disposal point roughly one kilometre west.
- Booking: phone number `48 12 91 15`, booking email and whether enquiries at the shop remain an option.
- Shop and café: staffed hours, CoopKey round-the-clock access, self-service Gruvekafeen and Vipps payment.
- Skjenkestova: opening pattern and description of its offering.
- Local history: mine operating dates 1946–1984, peak population around 650 and chapel details.
- Activities: dates, number of checkpoints and rules for Trim og Trivsel; dates and programme for Skorovasmarsjen.
- Other accommodation and named local organisations on the Skorovas page.

After approval, change the relevant documents in `src/content/pages` or `src/content/news` from `status: review` to `status: published`. Update `updatedAt` at the same time. Publishing automatically enables indexing, reciprocal language alternatives and sitemap inclusion.

## Migration record

Editorial text and the nine original images were migrated from the public pages of `skorovascamping.com` on 5 September 2026. Webnode navigation, cookie boilerplate and other platform text were excluded. The source image `skorovas-shop.jpeg` contains a Johnny Hammer copyright credit in its original metadata; retain that attribution when image credits are presented publicly.

The Google activity calendar belongs to `skorovas.liv@gmail.com`. It remains embedded rather than imported because the public feed contains historical and unrelated entries. The iframe is blocked until the visitor accepts external media.
