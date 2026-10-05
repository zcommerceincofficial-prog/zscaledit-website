# Site log: Kairo (zscaledit.site)

ONE JOB (draft, awaiting owner confirm): An auto aftermarket shop owner (wraps, PPF, tint,
auto glass, detailing) who wants more booked jobs from ads lands here and books a free audit call.

START LINE (derived from the 2026-10-04 session, not typed by the owner):
- Site for: my own business (Izaiah is owner and builder; he approves his own copy)
- Claude Code: installed
- Domain: zscaledit.site, has an old site on it (takeover rules: DNS audit + legacy URL map before launch)
- Brand: Kairo, served on zscaledit.site for now (owner's call 2026-10-04; domain/brand mismatch accepted, move later)
- Host: Cloudflare Pages, project zscaledit-website, direct upload only (Git Provider: No)
- Computer: Mac
- I use Claude in: VS Code
- Leads land in: GoHighLevel (inbound webhook already wired on the video pages)
- Paid ads: [CONFIRM]
- Real photos: [CONFIRM]
- Niche: auto aftermarket shops (wrap, PPF, tint, auto glass, detailing). Owner's call 2026-10-04.
- Design: full kit process (rolled DNA + Claude Design session). Owner's call 2026-10-04.
- Private video pages kept, noindexed: /watch (60s social intro) and /message (7 min booked-lead video, currently the homepage)

## Log

2026-10-04  Audit of live zscaledit.site before rebuild. Findings: homepage is the private 7-min
            video page with meta noindex (deliberate since 2026-08-22, commit 8ae2b01); every
            unknown path returns the homepage with 200 instead of a 404; www.zscaledit.site returns
            Cloudflare 525 (SSL handshake failure, www not attached to the Pages project);
            robots.txt and sitemap.xml point at www.kairo.agency (a domain not owned); sitemap lists
            only privacy/terms; no JSON-LD; Clarity is the only tracker; security headers good.
            Mail on the domain is Namecheap email forwarding (MX eforward1-5, SPF present, no DMARC).
2026-10-04  Project set up at ~/Desktop/Kairo Website, branch rebuild-2026-10 (main untouched).
            Kit core written: CLAUDE.md, scripts/ (export-transform, head, keep-list, cache-stamp,
            machine-layer-check, mobile-qa, optimize-images), design/ (blocklist-card, pools).
2026-10-04  Step 1a machine check: git 2.50.1, node 24.14.0, Chrome present, Pillow 11.3.0,
            wrangler logged in via npx. Pass.
2026-10-04  Claims on the pre-August site that need proof before reuse: "10-12x average ROAS"
            (the 4 results screenshots average about 6.2x), "$500 free ad spend", "live in 7 days",
            "one client per market", 9 active client cities.
2026-10-04  Step 1b: one job confirmed by owner ("Yes, that's it").
2026-10-04  Step 1c: copy interview run. Feel: in between / "Understood" / pro install bay at night /
            alive and moving. Proof: no numbers, no testimonials, no client names (owner). Map: open
            markets, a few marked taken (owner asked for invented client dots in every major city;
            declined as a false claim, owner chose the open-markets version). $500 offer live.
            Exclusivity one shop per service per market. Never say: lead-gen, cheap/budget.
            templates/copy-doc.md v1 written: 4 pages + legal, 248/137/65/14 visible words, 0 em
            dashes, 8 open markers. Awaiting owner approval.
2026-10-04  Production deploy e2b30093 (commit 4925c49, branch fix-2026-10-04-www-redirect, pushed to
            GitHub main): added functions/_middleware.js, one 301 from www.zscaledit.site to the
            apex with path and query kept. Site content byte-identical to the previous deploy
            (probe: index sha 7f69430eb5 before and after). Owner's go: "push it live".
            www custom domain was "deactivated"; re-validation started, Cloudflare reports
            "CNAME record not set". Waiting on owner to point the www DNS record at
            zscaledit-website.pages.dev (wrangler OAuth has no DNS scope). www returns 522 until then.
2026-10-04  www.zscaledit.site fixed. Root cause: the www Pages custom domain was stuck "deactivated"
            even though the DNS CNAME (www -> zscaledit-website.pages.dev, proxied) was already
            correct. Owner clicked Check DNS records (www started working 11:40); I also removed and
            re-added the domain via the Pages API (active 11:42). Verified: https://www -> one 301 ->
            https://zscaledit.site/ 200; path and query (gclid, utm) kept. http://www takes two hops
            (http->https at the edge, then www->apex); fine for typed traffic, ads should use https.
2026-10-04  Copy doc APPROVED by owner ("Approved"). Markers closed: no phone, ads live by day 8,
            Monday report, clients keep ad accounts, audit on Zoom or phone, no "taken" map dots,
            after-booking line rewritten to make no claim. 1 open: founder photo. STEP 1 DONE.
2026-10-04  Step 2 prep: DNA rolled with Python secrets (archetype 24 terminal, layout 2 asymmetric,
            type display serif + humanist sans after a contrast reroll, motion 2 kinetic, signature
            derived = open markets map, icons Iconoir, texture duotone + grain, imagery desaturated
            editorial). Colour exempt: owned palette (logo #122D20 + approved Aug tokens), contrast
            all pass. design/dna-form.md, design/ledger.md row 1, and the assembled prompt
            prompts/claude-design-prompt-kairo.md (3,922 words, 0 em dashes) written. Logo files for
            upload in design/upload/. Waiting on owner's Claude Design session.
2026-10-04  Claude Design export received (design/exports/2026-10-04-kairo-export.zip): 4 .dc.html runtime
            pages, DM Serif Display + Fira Sans. Export is the runtime shape (content painted by JS), so
            scripts/kairo-build.mjs prerenders each page in headless Chrome to static HTML, drops the
            React/Babel runtime, rebuilds the 3 motion moments in wiring/site.js, swaps the map to the
            Census Vintage 2024 top-50 metros (data/census/top50-metros.json), wires the GHL calendar,
            omits the founder photo frame until wiring/founder.webp exists, h3->h2 on the steps, adds
            JSON-LD (ProfessionalService+Organization, WebSite, WebPage, BreadcrumbList), rebuilds
            Privacy/Terms in the new shell (domain, email, real tool list). VSL moved to /message,
            /watch kept; both noindexed via _headers. Owner's go: "generate this site push it live".
2026-10-04  QA: machine-layer-check live PASS 6/6 pages; mobile-qa at 375x667 6/6 pass after fixing
            the footer "Book" tap target (37px -> 44px). Build is idempotent (two runs, no diff).
            Legacy /watch and /message unchanged from before (11px eyebrow, heavy canvas bg).
2026-10-04  Headers bug found and fixed: a second "/*" block in _headers replaced the first on
            Cloudflare, dropping X-Frame-Options and Permissions-Policy. HSTS now merged into one block.
2026-10-04  LIVE. Production deployment 73ae3122 (commit 9ac3e1e), merged to GitHub main (13bac1a).
            Probe: new title on zscaledit.site, all 6 pages 200, unknown paths 404, www 301 with query kept.
            Open: test booking (owner), GHL redirect to /book?booked=1, Search Console + Bing sitemap,
            founder photo, owner to send booked leads /message instead of the homepage.
2026-10-05  Referral page on branch referral-page, PREVIEW only (deploy 6fb82495,
            referral-page.zscaledit-website.pages.dev). /referrals: 20% of the monthly fee for the
            first 3 paid months, fine print, form -> functions/api/referral.js -> GHL inbound webhook
            from env var REFERRAL_WEBHOOK_URL (NOT SET YET, form returns an error until it is).
            Footer link on every page, in sitemap. Built in a local clone: the 1TB HD copy is ExFAT
            (mode-only diffs + ._ files that would upload with dist/). Local test with a mock webhook:
            valid/missing/honeypot/no-JS all correct. mobile-qa /referrals 8/8 pass. Copy drafted by
            Claude, awaiting owner approval; production waits on his go + one real test lead in GHL.
