You are a senior front-end engineer with a print-design background. Build a
4-page marketing site for Kairo, a one-person agency that runs Google and Facebook
ads, landing pages and automatic lead follow-up for auto aftermarket shops (vehicle
wraps, paint protection film, window tint, auto glass, detailing) across the United
States. The only job of this site is to get the visitor to book a free 30-minute
market audit call. The visitor is the owner of one of those shops, 30 to 55, who
already boosts posts or runs his own Google campaign, paid for clicks last month,
watched the leads go cold, and can't tell which ad paid for a job. He is usually on
his phone between installs, sometimes in a dark shop, sometimes outdoors.

Default to the most opinionated, most asymmetric, most editorial choice that
still ships and obeys the blocks below. If the output could appear on any other
company's site, throw it out.

=== DESIGN DNA (this is the owner's direction, not yours to improve) ===
- Archetype: terminal or command line, read as a night-shift control readout. Dark
  field, precise small labels used as accents, status lines. The copy itself stays
  plain human language, never code.
- Feel reference from the owner: a pro install bay at night. One work light, focus.
- Colour (owned brand, do not change): canvas #0A0F0C. Surface #122D20, the logo's
  own forest green. Ink #F2F5F0. Muted text #A3B0A8. Hairline #26332B.
  Accent #34C77B, text on accent #0A0F0C. Never pure black, never pure white.
- Neutral ramp: five steps from #0A0F0C to #F2F5F0, hue held at forest green (161).
- Accent share of visual weight: about 8 percent. Buttons, map dots, one status line
  per screen. Everything else quiet.
- Type: exactly two families. Display: a display SERIF, upright only, never italic,
  heavy enough to hold a headline on a phone. Body: a HUMANIST SANS. Neither may be
  on the DO-NOT type list, and do not use Bricolage Grotesque, Public Sans or IBM
  Plex Mono (the old site's set). Before building, show me three candidate pairs
  that fit those two categories and let me pick. Scale ratio at least 1.25.
  Tabular figures on step numbers, "day 8" and "$500".
- Layout skeleton: asymmetric. Headlines sit off a left grid line at about 70/30.
  The map and the photo bleed off the right edge. Nothing centered in a column.
  Tight inside a group, generous between sections, one full-bleed section, one short one.
- Motion: kinetic and snappy. One easing everywhere: cubic-bezier(0.16,1,0.3,1).
  Feedback 120ms, state 220ms, layout 360ms, entrance 600ms. Budget of three moments
  for the whole site: (1) the map dots light up in one sweep, left to right, like a
  plotter pass; (2) the five steps on How it works tick on as status lines;
  (3) the primary button press. Transform and opacity only.
- The one signature element: the OPEN MARKETS MAP. A US map with a dot on each of
  the 50 largest metro areas, accent green. Tapping or focusing a dot shows the metro
  name and "Ask me if your service is open there." No dot is ever marked taken. Draw
  the dots from a data list inside a container with id="market-map" (one element per
  dot, each with data-metro="City, ST"), because a later script replaces the list
  with a verified Census list. Use your best approximation of the 50 largest metros
  as placeholders. The map appears on Home (compact) and on Open markets (full).
- Icons: Iconoir only, one weight (1.5px stroke). No emoji.
- Texture: faint grain over the canvas at about 3 percent. Photos get a desaturated
  editorial treatment in a forest-green duotone.
- Imagery: real photos only, square corners, 1px hairline frame. Ratios: cards 4:5,
  full-bleed 16:9, strips 3:2. The founder photo is not supplied yet: leave a framed,
  clearly labelled placeholder that reads "[CONFIRM: photo of Izaiah, where and when
  it was taken]". Never fill it with a generated or stock person.
- Logo: use the uploaded Kairo logo files exactly as given. Never redraw it.
Every colour on the site comes from this block and every font is one of the two
picked families. If you need a value that is not here, stop and ask.

=== COPY (verbatim, this is law) ===
# Copy doc: Kairo

Version 1 | Written 2026-10-04 | Interviewed: owner (Izaiah Jackson), 2026-10-04
Approved: 2026-10-04 (owner, in chat: "Approved")

## Interview record (feel answers verbatim)

1. Vibe: "In between" (professional with grit)
2. One word: "Understood"
3. Same universe: "A pro install bay at night"
4. Brand colours: owned (the Kairo logo, forest green mark on cream)
5. Motion: "Alive and moving"

Business answers: one job confirmed as written below. Avatar: owner already running his own ads.
Proof: no results numbers, no testimonials, no live accounts named. $500 offer live. Exclusivity is
one shop per service per market. Map shows open markets, a few marked taken. Never say: lead-gen or
lead seller, cheap or budget. Email: izaiah@torqcrm.com. Service area: United States only.

## Audience, two lines

1. Who arrives: an owner of a wrap, PPF, tint, auto glass or detail shop, usually 30 to 55, on his
   phone between installs, who already boosts posts or runs his own Google campaign.
2. What just happened to him: he paid for clicks last month, got a handful of leads that went cold,
   and can't tell which ad (if any) paid for a job.

## Positioning, one line

Kairo helps auto aftermarket shop owners turn the ads they already run into booked jobs, without
guessing where the money went.

Entity sentence (used verbatim in meta, schema and llms.txt): Kairo runs Google and Facebook ads,
landing pages and automatic lead follow-up for auto aftermarket shops across the United States.

## Page map

Six pages maximum. No pricing page.

| # | Address | Page | Ceiling |
|---|---------|------|---------|
| 1 | `/` | Home | 250 visible words |
| 2 | `/how-it-works` | Main service: the five-step system | 200 |
| 3 | `/open-markets` | Second page: the open markets map | 150 |
| 4 | `/book` | Book the audit | 60 |
| 5 | `/privacy`, `/terms` | Legal (existing text, domain and email updated) | no ceiling |

Not in the page map, never in the sitemap, noindexed, carried by the keep-list:
`/watch` (60 second social intro video) and `/message` (7 minute video for booked leads).

Later, through `prompts/add-a-page.md`, not in this build: one page per shop type (wraps, PPF, tint,
auto glass, detailing), each with genuinely different copy. That is where most of the search
traffic will come from.

## Shared elements, written once and counted once

**Phone line.** None. The sticky bar carries the booking button only.

**Nav.** How it works / Open markets / Book your free audit (button)

**Proof strip.** First $500 in ad spend on me / One shop per service in each market / Every account
run by the founder.
Backed by: owner's confirmation 2026-10-04 (offer, exclusivity); Kairo is a one-person operation.

**Sticky bar (phones).** Book your free audit

**Footer.** Kairo. Ads and follow-up for auto aftermarket shops. United States only.
izaiah@torqcrm.com / How it works / Open markets / Book / Privacy / Terms / (c) 2026 Kairo

## Page 1: Home (ceiling 250)

- Hero headline: More booked jobs for auto aftermarket shops.
- Hero sub-headline: You already run ads. I build the system behind them, so more clicks turn into paid jobs.
- Primary button: Book your free audit
- Secondary link: See if your market is open

- Section heading: Built for five kinds of shops
- List: Vehicle wraps / Paint protection film / Window tint / Auto glass / Detailing and ceramic coating

- Section heading: You get clicks. The bays still have gaps.
- Body: Boosted posts and a Google campaign you built yourself bring some leads. Most go cold because nobody texts back fast, and you can't see which ad paid for which job.

- Section heading: What I build for your shop
- Item: Google and Facebook ads aimed at people shopping for your service.
- Item: A landing page for your offer, built for phones.
- Item: Text and email follow-up that fires the moment a lead comes in.
- Item: Tracking from the first click to the paid invoice.

- Section heading: Your first $500 in ad spend is on me.
- Body: If we're a fit and you sign on, I put the first $500 into your campaigns.

- Section heading: One shop per service in each market.
- Body: If I work with a tint shop in your city, I don't take on another tint shop there.
- Link: Check your market

- Section heading: I'm Izaiah. I run every account myself.
- Body: I've spent years running paid ads for local service shops. You talk to me, not an account manager.
- Photo caption: [CONFIRM: photo of Izaiah, where and when it was taken]

- Closing heading: Book your free market audit
- Closing body: 30 minutes on your market, your ads and your follow-up. You keep the plan, hire me or not.
- Button: Book your free audit

Visible word counts (2026-10-04): Home 248 of 250, How it works 137 of 200, Open markets 65 of 150, Book 14 of 60. Chrome counted once, not per page.

## Page 2: How it works (ceiling 200)

- Headline (H1): How I turn your ad clicks into booked jobs
- Sub-headline: Five steps. Nothing gets spent until the system can catch the leads.

- Step 1, Free market audit: 30 minutes on who's advertising near you and what your ads and follow-up are doing now.
- Step 2, Build: Landing page, tracking and automatic follow-up go in before a dollar of ad spend.
- Step 3, Launch: Google and Facebook ads go live by day 8, with the first $500 on me.
- Step 4, Optimize: I check the numbers every day and cut ads that don't earn their keep.
- Step 5, Scale: Budget goes up in small steps, only while your cost per job holds steady.

- Section heading: What you get along the way
- Item: A report every Monday showing what ran, what worked and what's next.
- Item: A strategy call every two weeks.
- Item: Your own ad accounts. You keep them if we ever part ways.

- Closing heading: Start with the audit
- Button: Book your free audit

## Page 3: Open markets (ceiling 150)

- Headline (H1): Check if your market is still open
- Body: I work with one shop per service in each market. A wrap shop and a tint shop can share a city. Two wrap shops can't.
- Map caption: Dots mark the 50 largest US metro areas. I confirm your market on the call.
- Body: Don't see your city? Most smaller markets are open too. Ask me on the call.
- Button: Claim your market

Map data rule: the 50 metros come from the US Census Bureau metro population list, not picked by
hand. No dot is marked taken: the owner does not reveal live accounts (2026-10-04).

## Page 4: Book (ceiling 60)

- Headline (H1): Book your free market audit
- Sub-headline: 30 minutes, on Zoom or the phone.
- Calendar: existing GHL booking widget (cPecftm7zMOwaY1YJ7Pg)
- Line: Rather email? izaiah@torqcrm.com
- Line shown after booking: You're booked. See you on the call.

## Page 5: Privacy and Terms

Existing text from the live site, with the domain, the email and the list of tools updated to what
is actually installed (Microsoft Clarity, the GHL calendar and form, YouTube embeds on the video pages).

## Marker census

| # | Marker | Page | Section | Answer | Closed |
|---|--------|------|---------|--------|--------|
| 1 | Phone number to show, or none? | Shared | Phone line, sticky bar | None (default, owner may override) | 2026-10-04 |
| 2 | Photo of Izaiah: which one, where, when? | Home | Founder | | |
| 3 | Are ads still live by day 8? | How it works | Step 3 | Yes | 2026-10-04 |
| 4 | Which day does the weekly report go out? | How it works | What you get | Monday | 2026-10-04 |
| 5 | Clients keep their own ad accounts if they leave? | How it works | What you get | Yes | 2026-10-04 |
| 6 | Which metro and service pairs show as taken? | Open markets | Map | None shown (no live accounts revealed) | 2026-10-04 |
| 7 | Audit call by phone, Zoom, or either? | Book | Sub-headline | Either | 2026-10-04 |
| 8 | Does the calendar send a confirmation? | Book | After booking | Line rewritten to make no claim | 2026-10-04 |

## Copy rules lint (run 2026-10-04)

- Em dashes: 0. Banned AI words: 0. Rhetorical question headers: 0.
- No numbers except: $500 (owner-confirmed offer), 30 minutes (audit length, old site and calendar),
  five steps, 50 metros (Census list), two weeks (strategy call, current rate card).
- No results numbers, no testimonials, no client names or cities (owner's instruction).
- No "lead gen", "leads for sale", "cheap" or "budget" (owner's never-say list).
- One-person voice throughout ("I", "me"), because every account is run by the founder.

## Approval

Owner name: Izaiah Jackson
Approved on: 2026-10-04
Approved by: owner in the Claude Code session, 2026-10-04
Open markers at approval: 1 (photo of Izaiah; design uses a labelled placeholder until it arrives)

This copy is final. Do not tighten, embellish, add, reorder, or write new
headings, captions, button labels or microcopy. Do not add a claim, a number, a
statistic, a review count or a testimonial. Brackets like [X], [CONFIRM:
question] and [VERIFY: claim] render literally, exactly as written. Never replace
one with a plausible value. Review quotes appear only where the copy doc gives
them, word for word, with no face attached. Build only Pages 1 to 4. Privacy and
Terms are handled outside this tool: just link them in the footer as /privacy and
/terms. Ignore the interview record, marker census and lint sections: they are
notes for me, not page copy.
No em dashes anywhere, including alt text and meta descriptions.

=== SHARED ELEMENTS (every page) ===
- A sticky bar on phones, pinned to the bottom, in the thumb zone, carrying one
  button: "Book your free audit". There is no phone number on this site.
- The proof strip, using only what the copy doc contains.
- A footer with the business name Kairo, "United States only", the email
  izaiah@torqcrm.com as a mailto: link, and the links from the copy doc.
- Exactly one primary action per page: book the free audit (/book).
- Every image has real alt text drawn from the copy doc.

=== DO-NOT ===
DO NOT (every line is a refusal; rewrite the element, do not soften it)

ABSOLUTE BANS
- No coloured stripe down one side of a card, callout or alert: no left or right border over 1px.
- No thick accent border on a rounded element, top, bottom or side; the border fights the corners.
- No card inside a card. A card is (shadow OR border) AND (radius OR background).
- No gradient text, on headings or numbers or anywhere else.
- No purple and indigo AI family: #7c3aed #8b5cf6 #a855f7 #9333ea #7e22ce #6d28d9 #6366f1 #764ba2 #667eea.
- No purple-to-blue, cyan-to-purple or pink-to-orange gradient.
- No glass blur as a default treatment.
- No hero metric block: big number, small label, supporting stats, gradient accent.
- No identical card grid: the same icon, heading and text card repeated across a row.
- No modal or popup as the first idea for showing something.
- No pure #000 and no pure #fff on any surface, any text.

TYPE
- No Inter, Roboto, Open Sans, Lato, Montserrat, Arial, Helvetica, Geist, Geist Mono, Mona Sans,
  Plus Jakarta Sans, Space Grotesk, Instrument Sans, Recoleta, Satoshi, Manrope, Fraunces,
  Playfair, Cormorant. Exception: the brand already owns one of them.
- No single family carrying the whole page (a detector fires past 20 elements on one family).
- No flat hierarchy: three or more sizes with under 2.0 between the largest and smallest, and no 14/15/16/18 pile.
- No oversized italic serif display hero.
- No proportional figures where numbers stack: phone numbers, prices and stats need tabular ones.
- No line longer than 85 characters, no leading under 1.3, no justified text without hyphenation.
- No text under 12px, no all-caps run over 30 characters, no wide tracking on body text.

COLOUR
- No timid palette: a purple gradient on light grey, or near-black plus one neon.
- No mesh gradients and no floating blobs as background decoration.
- No shadow at exactly 0.1 opacity.
- No dark surface carrying a glowing coloured shadow over 4px blur.
- No grey text on a coloured background.
- No stacked rgba or hsla alpha standing in for a real palette.
- No text or UI pair under WCAG AA: 4.5:1 body and placeholder, 3:1 large text, controls and focus rings.
- No canvas within 0.06 lightness AND 10 degrees hue of oklch(0.95 0.012 85), oklch(0.18 0.01 250)
  or oklch(0.97 0 0).
- No category-reflex hue for this trade.

LAYOUT
- No centered hero: vague headline, subhead, two buttons, a mockup.
- No three feature cards in a row, and no six-card variant of it.
- No mirrored text-left image-right split.
- No page over 70 percent centered text across five or more elements.
- No identical vertical rhythm everywhere: same padding, same max width, same card heights,
  no full-bleed, no short section.
- No monotonous spacing: ten or more values with one over 60 percent of uses, or three or fewer unique values.
- No body text touching the viewport edge, no cramped padding.
- No skipped heading levels.

COMPONENTS
- No global uniform radius with identical padding on everything.
- No bento grid by reflex.
- No pill buttons, gradient buttons or shimmer decoration.
- No icon-tile-above-a-heading feature card: a 32 to 128px squarish tile holding an icon above a heading.
- No emoji used as an icon.
- No mixing icon families, and no sparkle or shimmer icons.
- No interactive element missing any of the eight states: default, hover, focus-visible, active,
  disabled, loading, error, success.
- No tap target under 44px, no body text under 16px on a phone.

MOTION
- No fade-up-on-scroll as the only motion, and no page that ends up with no motion by accident.
- No hover state that does nothing.
- No button that snaps instead of easing.
- No bounce, elastic, wobble, jiggle or overshooting spring; no cubic-bezier with y under -0.1 or over 1.1.
- No plain `ease`.
- No animating layout properties: transform and opacity only.
- No decorative animation that teaches nothing; over-animation itself reads as AI-made.
- No animation without a reduced-motion no-op.

IMAGERY
- No stock team around a laptop in a perfect office.
- No abstract 3D blobs in space, no plastic over-smooth illustration.
- No flat-vector cartoon people.
- No invented testimonial face, name or company.
- No placeholder "trusted by" logo bar shipped from a template.
- No solid colour block where a photo belongs.
- No generated image standing in as proof that work was done.

COPY
- No em dashes anywhere. No curly quotes. No emoji standing in for a bullet or a header.
- No rhetorical question as a header or a transition.
- No "it's not X, it's Y" and no "not because X, but because Y".
- No tricolon ("fast, reliable and scalable") and no clipped fragment triplet.
- No stacked identical sentence openings.
- No opener of "Imagine", "Most people", "Here's the thing", "In today's", "When it comes to".
- No AI verb set: leverage, harness, unlock, unleash, elevate, empower, seamless, robust, crafted,
  foster, showcase, resonate, captivate, revolutionize, unveil, delve.
- No vague benefit noun: "drive results", "deliver value".
- No hedging: "might consider", "could potentially", "may help to".
- No claim, number, client or review that is not in the copy doc.
- No filled brackets: [CONFIRM] and every other bracket render literally.
Plus, specific to this business:
- No results numbers, revenue figures, ROAS stats, charts or ad-dashboard screenshots.
- No testimonials, client names, client logos or client cities anywhere.
- No dot or label on the map that says "taken", "claimed" or "client here".
- No photos of cars or shops presented as Kairo's or a client's work.
- Never the words lead gen, leads for sale, cheap or budget.
- No italic serif anywhere.

=== TECHNICAL REQUIREMENTS (every site, non-negotiable) ===
- Multi-page architecture: a separate HTML file per page (index.html,
  how-it-works.html, open-markets.html, book.html), real URLs, no hash routing
- Content visible in the HTML before JavaScript runs, not a bare mount node
- Mobile-first: 44px touch targets, 16px minimum body text, 45 to 75 character
  line lengths
- Each page has its own title, meta description, canonical URL and OpenGraph tags
- Compile JSX to JavaScript at build time; no in-browser Babel
- All animation is a no-op under prefers-reduced-motion
- Leave a clean, labelled container wherever a form or booking widget will be
  wired later: on book.html an empty <div id="booking-widget"></div> where the
  GoHighLevel calendar embed goes
Do not argue with this block. If a requirement conflicts with the design, change
the design.

=== QA GATES YOU RUN ON YOURSELF BEFORE SHOWING ME ANYTHING ===
Report each as pass or fail with its number. Fix every fail before showing me
the pages.
1. Copy diff: every visible string matches the copy doc. List any that does not.
2. Word ceilings: home under 250, how-it-works 200, open-markets 150, book 60.
   Print the visible count per page.
3. Marker census: every bracket present, rendered literally, none filled. Print
   the list.
4. Em dashes: zero in rendered copy. Print the count.
5. Palette census: every hex and OKLCH value used, checked against the DESIGN
   DNA block. Print anything outside it.
6. Type census: every font family used, checked against the two picked. Print
   anything else.
7. Phone read: one idea per screen at 375x667. Name any section that breaks it.
8. One primary action per page, and every link goes somewhere real.

=== HOW WE WORK THIS SESSION ===
1. Before any page exists, give me three radically different directions in text
   or rough wireframe, all obeying the blocks above. Do not build yet.
2. After I pick one, show me the three type pairings, then the typography scale.
3. Then build all 4 pages.
4. Then answer: pretend you are a senior designer at Apple reviewing this. What
   would you reject? Fix your own list.
5. Then answer: what is the single weirdest thing on this page? If nothing, redo
   the page.
6. Then cut 30 percent of the content, then 30 percent more. Cutting never means
   cutting copy from the doc; it means removing sections, ornament and
   repetition you added.
7. Colour, type and spacing live in a tokens file. Change them there so the whole
   site moves at once, then touch one section at a time. If a change keeps
   reverting, the value is hard-coded: pull it from the token, then change the
   token.
8. Show me every page on desktop and phone after every round, not just the last.
