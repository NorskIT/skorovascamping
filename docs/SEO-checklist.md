Her er en **praktisk SEO-sjekkliste**, basert på Googles SEO Starter Guide og den utdypende dokumentasjonen i Google Search Central. Jeg har supplert med Bing Webmaster, web.dev og IndexNow.

Prioriteringen er min praktiske vurdering:

- **P0:** Grunnleggende feil som kan hindre synlighet. Gjør først.
- **P1:** Viktige forbedringer for innhold, forståelse og brukeropplevelse.
- **P2:** Videre optimalisering og løpende arbeid.
- **Ved behov:** Gjelder bestemte typer nettsteder.

Dette er en generell liste; ingen sjekkliste garanterer rangering eller indeksering. Google understreker selv dette. ([developers.google.com][1])

**1. Måling og oversikt — P0**

- [ ] Registrer og verifiser nettstedet i **Google Search Console**.
- [ ] Registrer nettstedet i **Bing Webmaster Tools**.
- [ ] Send inn sitemap til begge.
- [ ] Kontroller eventuelle manuelle tiltak og sikkerhetsproblemer i Search Console.
- [ ] Undersøk indekseringsstatus for de viktigste sidene med URL-inspeksjon.
- [ ] Registrer utgangspunktet: organiske klikk, visninger, CTR og hvilke landingssider som får trafikk.
- [ ] Sett opp måling av relevante resultater, som kjøp, henvendelser eller abonnementer. Dette er for å evaluere tiltakene.

Search Console og Bing Webmaster Tools gir innsikt i både synlighet og tekniske problemer. ([developers.google.com][2])

**2. Tilgjengelighet og indeksering — P0**

- [ ] Viktige offentlige sider kan åpnes uten innlogging.
- [ ] Sidene som skal indekseres, returnerer normalt **HTTP `200`**.
- [ ] Viktige sider har ikke utilsiktet `noindex`, verken i HTML eller `X-Robots-Tag`.
- [ ] `robots.txt` blokkerer ikke sider eller ressurser søkemotorene trenger.
- [ ] CDN, brannmur og botbeskyttelse slipper gjennom legitime søkemotorroboter.
- [ ] CSS, JavaScript og nødvendige API-kall fungerer når søkemotoren gjengir siden.
- [ ] Slettede eller ikke-eksisterende sider returnerer `404` eller `410`, ikke en feilmelding med `200`.
- [ ] Midlertidige serverfeil blir ikke vist som vanlige, indekserbare sider.
- [ ] Testmiljøer og private områder er beskyttet med tilgangskontroll.

**Viktig:** `robots.txt` styrer crawling, ikke sikker fjerning fra søkeresultater. Skal en offentlig side fjernes med `noindex`, må roboten få hente siden og lese direktivet. ([developers.google.com][3])

**3. URL-er, duplikater og canonical — P0/P1**

- [ ] Velg en konsekvent hovedversjon av domenet: HTTPS og enten med eller uten `www`.
- [ ] Omdiriger alternative domeneversjoner til hovedversjonen.
- [ ] Bruk stabile og forståelige URL-er.
- [ ] Håndter forskjeller i store/små bokstaver og avsluttende `/` konsekvent.
- [ ] Angi riktig `rel="canonical"` der flere URL-er viser samme eller svært likt innhold.
- [ ] Kontroller at canonical peker til en relevant, tilgjengelig URL som kan indekseres.
- [ ] La interne lenker, sitemap og canonical peke til samme foretrukne URL.
- [ ] Håndter sporingsparametere, utskriftsversjoner og andre duplikatvarianter.
- [ ] Bruk permanente `301`/`308`-omdirigeringer når en side faktisk flyttes permanent.
- [ ] Unngå omdirigeringssløyfer og unødvendige kjeder.

Canonical er et signal om foretrukket URL; Google kan velge en annen hvis signalene spriker. ([developers.google.com][4])

**4. Sitemap og oppdagelse — P1**

- [ ] Generer XML-sitemap automatisk.
- [ ] Ta med de canonical-URL-ene du ønsker indeksert.
- [ ] Fjern døde URL-er, omdirigeringer og sider med `noindex` fra sitemap.
- [ ] Oppgi sitemap i `robots.txt`.
- [ ] Bruk korrekt `lastmod` når innholdet faktisk er vesentlig oppdatert.
- [ ] Ikke sett ny `lastmod` på alle sider ved hver deploy.
- [ ] Del store sitemaps med sitemap-indeks: maksimalt **50 000 URL-er eller 50 MB ukomprimert per sitemap**.
- [ ] Kontroller at generering og innlesing fungerer etter større endringer.

Sitemap hjelper søkemotorene med å oppdage URL-er, men garanterer ikke indeksering. Både Google og Bing fremhever korrekte oppdateringsdatoer. ([developers.google.com][5])

**5. Struktur og interne lenker — P1**

- [ ] Organiser sidene i logiske temaer og kategorier.
- [ ] Sørg for at alle viktige sider har interne lenker til seg.
- [ ] Gjør sentrale produkter, tjenester og kategorier lett tilgjengelige fra navigasjonen.
- [ ] Bruk vanlige `<a href="…">`-lenker for navigasjon.
- [ ] Bruk beskrivende lenketekst som forklarer målsiden.
- [ ] Knytt relevante artikler, kategorier og tjenester sammen med kontekstuelle lenker.
- [ ] Rett ødelagte interne lenker.
- [ ] Bruk brødsmuler der det hjelper brukeren å forstå strukturen.

Google bruker lenkene mellom sidene til å forstå nettstedets struktur og hvilke sider som er viktige. ([developers.google.com][6])

**6. Søkeintensjon og innhold — P1**

- [ ] Kartlegg hvilke spørsmål og behov målgruppen faktisk har.
- [ ] Gi hver viktig side et tydelig formål: informere, sammenligne, finne eller kjøpe.
- [ ] Bruk ord og uttrykk målgruppen kjenner, naturlig i teksten.
- [ ] Besvar hovedspørsmålet tydelig og tidlig.
- [ ] Tilfør egen verdi gjennom data, erfaringer, eksempler, forklaringer eller verktøy.
- [ ] Sørg for at siden leverer det tittelen lover.
- [ ] Unngå mange nesten identiske sider som bare bytter søkeord eller stedsnavn.
- [ ] Oppdater feil, utdaterte priser og opplysninger som ikke lenger stemmer.
- [ ] Vurder å slå sammen sider som dekker samme behov uten tydelig forskjell.
- [ ] Kvalitetssikre AI-generert innhold før publisering.

Google legger stor vekt på nyttig, originalt og pålitelig innhold. Masseproduksjon uten merverdi kan rammes av spamreglene, uavhengig av hvordan teksten er produsert. ([developers.google.com][7])

**7. Titler, beskrivelser og overskrifter — P1**

- [ ] Gi hver viktig side en unik og beskrivende `<title>`.
- [ ] La tittelen uttrykke sidens viktigste tema eller tilbud.
- [ ] Unngå titler fulle av gjentatte søkeord og standardtekst.
- [ ] Skriv en relevant `meta description` for viktige landingssider.
- [ ] La beskrivelsen gi en korrekt grunn til å besøke siden.
- [ ] Bruk en tydelig hovedoverskrift og logiske underoverskrifter.
- [ ] Kontroller at tittel, overskrift og faktisk innhold samsvarer.
- [ ] Kontroller metadata på dynamiske sider, slik at de ikke alle arver samme tittel.

Det finnes ingen absolutt Google-grense på «60 tegn i title» eller «160 tegn i description». Visningen kan avkortes, og Google kan velge andre titler og utdrag. ([developers.google.com][8])

**8. Troverdighet og dokumentasjon — P1**

- [ ] Gjør det tydelig hvem som står bak nettstedet.
- [ ] Ha tilgjengelig kontaktinformasjon og relevant informasjon om virksomheten.
- [ ] Oppgi forfatter eller faglig ansvarlig når leseren forventer det.
- [ ] Dokumenter viktige påstander med pålitelige kilder.
- [ ] Forklar metode, datagrunnlag og begrensninger ved beregninger og estimater.
- [ ] Vis publiserings- og oppdateringsdato når dette er nyttig.
- [ ] Endre dato bare når innholdet faktisk er oppdatert.
- [ ] Beskriv priser og hva brukeren får, slik at tilbudet er forståelig.

Dette er særlig relevant når innholdet påvirker økonomiske eller andre viktige beslutninger. **E-E-A-T er et kvalitetsrammeverk, ikke én enkelt rangeringsfaktor eller en poengsum.** ([developers.google.com][7])

**9. Mobil, ytelse og brukeropplevelse — P1**

- [ ] Test viktige sidetyper på mobil.
- [ ] Sørg for at viktig innhold, navigasjon og funksjoner fungerer på små skjermer.
- [ ] Bruk HTTPS gjennom hele nettstedet.
- [ ] Unngå påtrengende mellomskjermer og annonser som hindrer tilgang til innholdet.
- [ ] Mål Core Web Vitals med faktiske brukerdata der disse finnes.
- [ ] Sikt mot **LCP ≤ 2,5 sekunder**, **INP ≤ 200 ms** og **CLS ≤ 0,1**.
- [ ] Vurder målene ved **75-persentilen**, separat for mobil og desktop.
- [ ] Bruk laboratorietester til feilsøking, og kontroller virkningen i brukerdata.

God ytelse er en del av brukeropplevelsen; en perfekt testscore er ingen garanti for høy rangering. ([web.dev][9])

**10. JavaScript og webapplikasjoner — P0/P1 ved behov**

- [ ] Vurder SSR eller prerendering for sider som skal få organisk trafikk.
- [ ] Kontroller det gjengitte innholdet i Search Console.
- [ ] Sørg for at hovedinnholdet ikke krever klikk, scrolling eller innlogging for å bli lastet.
- [ ] Gi hver indekserbar visning en egen, fungerende URL.
- [ ] Unngå hash-ruting som `/#/produkt/123` for sider som skal indekseres separat.
- [ ] Kontroller at direkte åpning av en underside fungerer.
- [ ] Sørg for korrekte titler, canonical og robots-direktiver på hver rute.
- [ ] Ikke send `noindex` i første HTML-respons med planen om å fjerne det med JavaScript.
- [ ] Kontroller at API- eller JavaScript-feil ikke etterlater tomt hovedinnhold.

Google kan gjengi JavaScript, men servergjengivelse og prerendering gjør innholdet tilgjengelig for flere roboter og reduserer avhengigheten av klientkjøring. ([developers.google.com][3])

**11. Bilder og video — P1/P2**

- [ ] Bruk relevante bilder med god nok kvalitet.
- [ ] Gi informative bilder beskrivende `alt`-tekst.
- [ ] Bruk `alt=""` på rent dekorative bilder.
- [ ] Plasser bilder nær teksten de illustrerer.
- [ ] Bruk passende bildestørrelser og effektiv komprimering.
- [ ] Sørg for at viktige bilder kan oppdages via HTML, og ikke bare CSS-bakgrunner.
- [ ] Kontroller at lazy loading ikke hindrer søkemotoren i å finne bildene.
- [ ] Hvis videosøk er viktig: lag en side der videoen er hovedinnholdet.
- [ ] Sørg for tilgjengelig miniatyrbilde, relevant videotittel og beskrivelse.

Google har egne krav og anbefalinger for bilde- og videosøk. ([developers.google.com][10])

**12. Strukturerte data — P1/P2 ved behov**

- [ ] Velg strukturerte data som faktisk passer innholdet.
- [ ] Bruk gjerne JSON-LD, som Google anbefaler.
- [ ] Vurder relevante typer som `Organization`, `BreadcrumbList`, `Product`, `Article` eller `LocalBusiness`.
- [ ] Kontroller Googles dokumentasjon for den konkrete resultattypen.
- [ ] La opplysningene samsvare med synlig innhold.
- [ ] Hold priser, tilgjengelighet og andre dynamiske felt oppdatert.
- [ ] Test med **Rich Results Test**.
- [ ] Følg opp feil i Search Console.
- [ ] Ikke legg inn oppdiktede anmeldelser eller misvisende vurderinger.

Gyldig markup kan gjøre siden kvalifisert for utvidede søkeresultater, men gir ingen garanti for slik visning. ([developers.google.com][11])

**13. Flerspråklige og internasjonale sider — P1 ved behov**

- [ ] Gi hver språkversjon en egen URL.
- [ ] Oversett hovedinnhold, titler og beskrivelser.
- [ ] Koble tilsvarende sider sammen med korrekt `hreflang`.
- [ ] La hver språkvariant referere både til seg selv og de andre variantene.
- [ ] Bruk riktige språkkoder: svensk er **`sv`**, eventuelt `sv-SE`.
- [ ] Bruk `x-default` der en standardside eller språkvelger er relevant.
- [ ] La reelle oversettelser normalt ha canonical til egen språkversjon.
- [ ] Unngå automatisk språk-/IP-omdirigering som hindrer tilgang til andre versjoner.
- [ ] La språkvelgeren lenke til tilsvarende underside når den finnes.
- [ ] Tilpass innhold, valuta og begreper til markedet.

Oversatte URL-stier er helt greit. Det avgjørende er at sidene er tilgjengelige og koblet riktig sammen. ([developers.google.com][12])

**14. Store databaser, filtre og paginering — P1 ved behov**

- [ ] Bestem hvilke sidetyper og filterkombinasjoner som har verdi i søkeresultatene.
- [ ] Unngå at filtre og sortering genererer tilnærmet uendelig mange crawlbare URL-er.
- [ ] Lag en bevisst strategi for crawling og indeksering av interne søkeresultater.
- [ ] Ikke bruk canonical som universalløsning for sider med forskjellig innhold.
- [ ] Sørg for at innhold bak «last flere» også kan finnes via crawlbare lenker.
- [ ] Gi paginerte sider egne URL-er.
- [ ] Ikke canonicaliser alle listesider til side 1 hvis de viser forskjellige elementer.
- [ ] Unngå indekserbare tomsider og ugyldige filterkombinasjoner.
- [ ] Følg med på serverbelastning og unødvendig crawling.

Dette er spesielt relevant for oppslagstjenester, kataloger og nettbutikker. ([developers.google.com][13])

**15. Eksterne lenker og omtale — P2**

- [ ] Publiser innhold, data eller verktøy som andre har en reell grunn til å lenke til.
- [ ] Gjør relevant innhold kjent gjennom fagmiljøer, samarbeid og presse.
- [ ] Rett viktige eksterne lenker som peker til gamle eller ødelagte URL-er når mulig.
- [ ] Unngå kjøpte lenker og lenkenettverk som skal manipulere rangering.
- [ ] Merk betalte lenker med `rel="sponsored"` eller passende `nofollow`.
- [ ] Håndter lenker i brukerinnhold med `ugc`/`nofollow` etter behov.

Bing fremhever også relevante kvalitetslenker fremfor manipulerende lenkebygging. ([Bing Webmaster Tools][14])

**16. Bing og IndexNow — P1/P2**

- [ ] Kontroller viktige URL-er i Bing Webmaster Tools, i tillegg til Google.
- [ ] Bruk Bings rapporter til å finne indekserings- og SEO-problemer.
- [ ] Vurder **IndexNow** hvis innholdet oppdateres ofte.
- [ ] Send melding ved publisering, reelle oppdateringer og sletting.
- [ ] Kontroller at eierskapsnøkkelen og innsendingen fungerer.
- [ ] Behold sitemap som en del av oppsettet.

IndexNow varsler Bing og andre deltakende søkemotorer om endringer. Et vellykket API-svar betyr at varselet er mottatt, ikke at URL-en er indeksert. ([Bing Webmaster Tools][15])

**17. Nettbutikk og lokal virksomhet — ved behov**

- [ ] **Nettbutikk:** La produkter kunne finnes gjennom kategori- og produktlenker.
- [ ] **Nettbutikk:** Bruk relevant produktmarkup og korrekte pris-/lageropplysninger.
- [ ] **Nettbutikk:** Vurder Merchant Center og produktfeed der tilbudet er kvalifisert.
- [ ] **Lokal virksomhet:** Opprett og verifiser Google Business Profile dersom virksomheten er kvalifisert.
- [ ] **Lokal virksomhet:** Hold kategori, adresse, telefon og åpningstider oppdatert.
- [ ] **Lokal virksomhet:** Legg inn relevante bilder og følg opp ekte anmeldelser.
- [ ] **Lokal virksomhet:** Lag nyttige lokasjonssider der dere faktisk har lokal tilstedeværelse eller et relevant tilbud.

For lokale resultater vurderer Google blant annet relevans, avstand og hvor kjent virksomheten er. ([developers.google.com][16])

**18. Synlighet i AI-søk — P2**

- [ ] Gjør sentrale opplysninger tydelige i tekst.
- [ ] Presenter fakta, metode og kilder slik at informasjonen er lett å forstå og etterprøve.
- [ ] Tilfør egen informasjon fremfor generiske omskrivninger.
- [ ] Kontroller at sidene kan indekseres og brukes i relevante søkeresultatfunksjoner.
- [ ] Vurder innstillingene for utdrag og innholdsbruk bevisst.

Googles veiledning sier at vanlig SEO fortsatt er grunnlaget for AI Overviews og AI Mode. ([developers.google.com][17])

**19. Ved redesign, flytting og deploy — P0**

- [ ] Kartlegg gamle URL-er og deres nye mål før en flytting.
- [ ] Omdiriger hver gammel side til nærmeste relevante erstatning.
- [ ] Ikke send alle slettede sider til forsiden.
- [ ] Oppdater interne lenker, canonical, hreflang og sitemap.
- [ ] Fjern utviklingsmiljøets `noindex` eller blokkeringer før lansering.
- [ ] Test de viktigste sidetypene etter deploy.
- [ ] Overvåk feil, indeksering og trafikk etter lanseringen.
- [ ] Behold permanente omdirigeringer i minst ett år ved nettstedsflytting, gjerne lenger.

Google anbefaler nøye URL-kartlegging og oppfølging ved flytting. ([developers.google.com][18])

**20. Løpende oppfølging — P2**

- [ ] Følg med på tap av indekserte, viktige sider.
- [ ] Undersøk sider med mange visninger og lav CTR.
- [ ] Se etter søk der eksisterende innhold ikke dekker behovet godt nok.
- [ ] Sammenlign utvikling per side, land og enhet.
- [ ] Vurder organisk trafikk sammen med faktiske konverteringer.
- [ ] Før en enkel endringslogg, slik at resultater kan ses i sammenheng med tiltak.
- [ ] Gi endringer tid før du konkluderer.

En månedlig gjennomgang er et praktisk utgangspunkt; hyppigere etter større lanseringer. Google påpeker at virkningen av endringer kan ta fra timer til måneder. ([developers.google.com][2])

**Ting du kan nedprioritere**

- `meta keywords`: Google bruker ikke dette.
- En bestemt søkeordtetthet eller et bestemt antall ord.
- Forestillingen om at et søkeord i domenet automatisk gir god rangering.
- Et «perfekt» antall overskrifter.
- Å behandle vanlig duplisert innhold som en automatisk straff.
- Å endre publiseringsdato uten å forbedre innholdet.

Google omtaler disse som misforståelser eller lite nyttige fokusområder. ([developers.google.com][1])

[1]: https://developers.google.com/search/docs/fundamentals/seo-starter-guide?utm_source=chatgpt.com 'SEO Starter Guide: The Basics | Google Search Central  |  Documentation  |  Google for Developers'
[2]: https://developers.google.com/search/docs/monitor-debug/search-console-start?utm_source=chatgpt.com 'How To Use Search Console | Google Search Central  |  Documentation  |  Google for Developers'
[3]: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?utm_source=chatgpt.com 'Understand JavaScript SEO Basics | Google Search Central  |  Documentation  |  Google for Developers'
[4]: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls?utm_source=chatgpt.com 'How to Specify a Canonical with rel="canonical" and Other Methods | Google Search Central  |  Documentation  |  Google for Developers'
[5]: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?utm_source=chatgpt.com 'Build and Submit a Sitemap | Google Search Central  |  Documentation  |  Google for Developers'
[6]: https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure?utm_source=chatgpt.com 'Help Google understand your ecommerce website structure'
[7]: https://developers.google.com/search/docs/fundamentals/creating-helpful-content?utm_source=chatgpt.com 'Creating Helpful, Reliable, People-First Content | Google Search Central  |  Documentation  |  Google for Developers'
[8]: https://developers.google.com/search/docs/appearance/title-link?utm_source=chatgpt.com 'Influencing Title Links in Google Search | Google Search Central  |  Documentation  |  Google for Developers'
[9]: https://web.dev/articles/vitals?utm_source=chatgpt.com 'Web Vitals  |  Articles  |  web.dev'
[10]: https://developers.google.com/search/docs/appearance/google-images?utm_source=chatgpt.com 'Image SEO Best Practices | Google Search Central  |  Documentation  |  Google for Developers'
[11]: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data?utm_source=chatgpt.com 'Intro to How Structured Data Markup Works | Google Search Central  |  Documentation  |  Google for Developers'
[12]: https://developers.google.com/search/docs/specialty/international/localized-versions?utm_source=chatgpt.com 'Localized Versions of your Pages | Google Search Central  |  Documentation  |  Google for Developers'
[13]: https://developers.google.com/search/docs/crawling-indexing/crawling-managing-faceted-navigation?utm_source=chatgpt.com 'Managing crawling of faceted navigation URLs | Google Crawling Infrastructure  |  Crawling infrastructure  |  Google for Developers'
[14]: https://www.bing.com/webmasters/help/link-building-7a3f99b7?utm_source=chatgpt.com 'Link Building'
[15]: https://www.bing.com/webmasters/help/refreshed-webmaster-tools-7c7d2533?utm_source=chatgpt.com 'Refreshed Webmaster Tools'
[16]: https://developers.google.com/search/docs/specialty/ecommerce/include-structured-data-relevant-to-ecommerce?utm_source=chatgpt.com 'Include structured data relevant to ecommerce'
[17]: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide?utm_source=chatgpt.com "Google's Guide to Optimizing for Generative AI Features on Google Search | Google Search Central  |  Documentation  |  Google for Developers"
[18]: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes?utm_source=chatgpt.com 'Site Moves and Migrations | Google Search Central  |  Documentation  |  Google for Developers'
