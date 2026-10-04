---
id: design-pools
title: The Design Pools
type: design
summary: The numbered menus you roll each of the eight axes against, with the distance rules and the procedures that keep a roll from drifting back to a reflex.
related: [the-anti-slop-rulebook]
tags: [design, pools, divergence, oklch, menus]
source: own
anon: clean
reviewed: 2026-08-30
---

**These are menus, not recommendations.** Nothing on this page is suggested, preferred or better. The point is range. Order carries no meaning: entry 1 is not the safe one and entry 30 is not the wild one.

Roll mechanically. For each pool, get a number from outside your own head (dice, a random number site, or ask Claude for a random index per pool), take that entry, sanity-check it against the brief, and reroll only when it genuinely cannot serve the business. "I would not have picked that" is not a reason to reroll; it is the mechanism working. Write every result into `design/dna-form.md`, then check it against `design/ledger.md` before you lock anything.

Break at least three of the eight axes off default, two of them from colour model, layout silhouette and display type. Breaking only the cheap axes (icons, texture, easing) leaves the three that drive sameness on default.

## 1. Archetype

1 Swiss minimal, 2 neumorphism, 3 glassmorphism, 4 brutalism, 5 neubrutalism, 6 3D or hyperrealism, 7 vibrant block, 8 OLED dark, 9 claymorphism, 10 aurora or mesh, 11 retro-futurism, 12 flat, 13 skeuomorphism, 14 liquid glass, 15 motion-driven, 16 micro-interaction-led, 17 organic or biophilic, 18 memphis, 19 vaporwave, 20 dimensional layering, 21 exaggerated minimalism, 22 bauhaus structural, 23 modern dark cinema, 24 terminal or command line, 25 kinetic brutalism, 26 material-you (product register), 27 academia, 28 sketch or hand-drawn, 29 pixel, 30 cinematic pacing.

> [!warn] The editorial-typographic look (italic serif display, small mono labels, ruled separators) is saturated. Do not land on it just because you are leaving the software look; that is the second-order category reflex, not an escape from it.

## 2. Colour

Build in OKLCH. Equal steps in the numbers look equal to the eye, and it stays predictable after transforms. Convert both ways at `oklch.com`.

**Commitment level, pick one first:** 1 restrained (tinted neutrals plus one accent under 10 percent), 2 committed (one colour owning 30 to 60 percent), 3 full palette (three or four named roles), 4 drenched (the surface is the colour).

Anchor the hues to the mined world, then run the distance rules. These are gates, not preferences.

- Never pure `#000` and never pure `#fff`. Tint every neutral toward this brand's hue at chroma 0.005 to 0.015.
- The canvas must sit at least 0.06 in lightness **or** at least 10 degrees in hue from each of the three default cluster centroids: cream `oklch(0.95 0.012 85)`, near-black `oklch(0.18 0.01 250)`, paper `oklch(0.97 0 0)`.
- Banned outright: `#7c3aed` `#8b5cf6` `#a855f7` `#9333ea` `#7e22ce` `#6d28d9` `#6366f1` `#764ba2` `#667eea`, plus the purple-to-blue, cyan-to-purple and pink-to-orange gradients.
- Stay off the category-reflex hue for the trade. Write down the hue you avoided.
- Every text and UI pair clears WCAG AA: 4.5:1 body and placeholder, 3:1 large text, controls and focus rings.

Measure the distance in a tool. Two colours that feel far apart are routinely 0.02 apart.

## 3. Type

Do not roll a font name off a list. Last year's distinctive pick is this year's tell, so run the procedure and roll the **category**.

1. Name three concrete physical-object words for this brand's voice.
2. List the faces you would reach for on autopilot, and reject them.
3. Browse a live catalogue for the brand-as-object.
4. Cross-check. If the final pick equals your first reflex, restart.

**Categories (roll one for display, one for body, and the display category must differ from the last two ledger rows):** 1 condensed grotesque, 2 slab, 3 geometric sans, 4 humanist sans, 5 transitional serif, 6 display serif, 7 rounded, 8 mono, 9 hand.

Names already saturated, avoid unless the brand owns one: Inter, Roboto, Open Sans, Lato, Montserrat, Arial, Helvetica, Geist, Satoshi, Space Grotesk, Manrope, Plus Jakarta Sans, Instrument Sans, Recoleta, Fraunces, Playfair, Cormorant.

Two families is the cap, paired on contrasting axes, never similar-but-not-identical. Scale ratio at least 1.25. Tabular figures wherever digits stack; the flatness tell is no tabular numerals and no real display-to-body contrast.

## 4. Layout skeleton

1 split screen, 2 asymmetric (headline off a grid line, visual bleeding off an edge), 3 sidebar or fixed rail, 4 editorial columns with pull quotes, 5 horizontal scroll, 6 oversized type as the hero with no image, 7 strict visible grid, 8 full-bleed photo-led.

Commit to 70/30 or 80/20, or to a visible grid. The failure is splitting the difference into a centered stack.

## 5. Motion personality

1 calm and slow, 2 kinetic and snappy, 3 physical and springy (settles without overshoot).

Pick one and let it drive every transition on the site. Easing palette: ease-out quart `cubic-bezier(0.25,1,0.5,1)`, quint `(0.22,1,0.36,1)`, expo `(0.16,1,0.3,1)`. Never bounce, elastic or a spring that overshoots the rest position, and never plain `ease`. Budget two or three signature moments per page. Transform and opacity only. Every animation gets a reduced-motion no-op.

## 6. Signature element

1 custom cursor, 2 scroll-driven hero animation, 3 texture or grain field, 4 before-and-after slider, 5 filterable gallery, 6 configurator, 7 unusual type treatment (one enormous word as the hero), 8 an interactive map or tool specific to the trade.

> [!rule] The lead-capture mechanism is infrastructure, not the signature. A quote tool, a booking flow or a contact form does not count, no matter how good it is. Every "we want more leads" brief pulls toward a quote calculator, and if that is the memorable thing, every site rhymes. The tool can still exist; pair it with a non-conversion signature from this list.

Derive rather than pick, when you can: what does the customer physically do before buying, what single anxiety can the page resolve interactively, what physical artifact could become something they can move. Reject it if it is decoration.

## 7. Icon families, off the default trio

Lucide, Heroicons and Phosphor are the monoculture. Alternatives to roll from: 1 Iconoir, 2 Tabler, 3 Hugeicons, 4 Untitled UI, 5 Streamline, 6 Phosphor at one deliberate weight (duotone reads least default). <!-- vocab-ok -->

One family, one weight, uniform across the site. Mixing families is its own tell. Never emoji as icons. When a needed icon is missing, take the closest match inside your chosen set first, and keep stroke, fill and radius consistent when you cannot.

## 8. Texture and background

1 grain or noise at 2 to 8 percent over a flat brand surface, 2 CSS `feTurbulence` generated in the browser, 3 an SVG generator suite output at a randomised seed in brand colours, 4 peaks, steps or low-poly SVG fields, 5 halftone, 6 duotone, 7 no texture at all as a deliberate choice.

Sources and licences are in `design/asset-sources.md`. Not glass blur by reflex.

## 9. Imagery treatment

For a trade or local business, real photos of the real business are the direction. That locks the direction axis, so this axis diverges through **treatment**, and the treatment must differ from the last two ledger rows.

1 high-contrast black-and-white documentary, 2 warm golden-hour, 3 cool overcast, 4 macro material close-up, 5 aerial, 6 desaturated editorial.

Never flat-vector illustration for a trades business; it reads as software instantly. Generated imagery is ambient only, never proof, and it goes through the detail gate in `checklists/image-qa.md` before it ships.

> [!warn] Because the mined world is the same for everyone in a category, two builds in the same trade will still rhyme in tone even with different archetypes. The distance rules in pool 2 and the treatment sub-roll here are what push that residual flavour apart. Do not skip them because the labels already look different.
