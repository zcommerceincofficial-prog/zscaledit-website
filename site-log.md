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
