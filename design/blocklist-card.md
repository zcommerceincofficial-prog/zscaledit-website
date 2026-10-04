---
id: design-blocklist-card
title: Design Blocklist Card
type: design
summary: The full DO-NOT list, in one block you paste into every design prompt, plus the do-instead line for each ban.
related: [the-anti-slop-rulebook, prompting-claude-design]
tags: [design, blocklist, anti-slop, prompt]
source: own
anon: clean
reviewed: 2026-08-30
---

This is a fence, not a menu. It says what to refuse, never what to want. The direction comes from your rolled DNA (`design/dna-form.md`), which is the owner's, not yours.

Paste the block below into the DO-NOT section of your design prompt, unedited, then add anything specific to this business under it ("no before-and-after sliders; this company has no befores"). Run it against every page again before you export. Every line names something checkable, so "it passes" comes with evidence.

## The block

```text
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
- No "it's not X, it's Y" and no "not because X, but because Y". <!-- vocab-ok -->
- No tricolon ("fast, reliable and scalable") and no clipped fragment triplet.
- No stacked identical sentence openings.
- No opener of "Imagine", "Most people", "Here's the thing", "In today's", "When it comes to". <!-- vocab-ok -->
- No AI verb set: leverage, harness, unlock, unleash, elevate, empower, seamless, robust, crafted, <!-- vocab-ok -->
  foster, showcase, resonate, captivate, revolutionize, unveil, delve. <!-- vocab-ok -->
- No vague benefit noun: "drive results", "deliver value".
- No hedging: "might consider", "could potentially", "may help to".
- No claim, number, client or review that is not in the copy doc.
- No filled brackets: [CONFIRM] and every other bracket render literally.
```

## Do instead

One line per ban, so a refusal never leaves a hole in the page.

- **Side-stripe card:** a full border, a background tint, a leading number, a divider, or nothing.
- **Accent border on a rounded element:** no border; carry the emphasis in weight or surface lightness.
- **Nested card:** spacing, type hierarchy and hairline dividers inside one surface.
- **Gradient text:** one solid colour, emphasis from weight (900 against 200) or size (3 to 5x).
- **Purple and indigo:** one brand hue in OKLCH plus a tinted non-grey neutral, named after a real colour.
- **Glass blur:** large soft shadows, grain, noise, halftone, duotone, thick borders, a custom frame.
- **Hero metric block:** the most characteristic real thing in the business's world, or one oversized word.
- **Identical card grid:** an asymmetric two-plus-one, mixed card and non-card content, varied spans.
- **Modal:** inline content, progressive disclosure, a real page, or a popover.
- **Pure black or white:** tinted neutrals; a dark surface at 12 to 18 percent lightness, depth from surface lightness.
- **Saturated font name:** a display face picked by category from the subject's world plus a neutral body.
- **Flat hierarchy:** a ratio of at least 1.25 between steps, fewer sizes with bigger jumps.
- **Italic serif hero:** any non-reflex display face grounded in the subject.
- **Timid palette:** commit one colour to a real share of the page, everything else quiet.
- **Mesh gradient or blob:** grain or noise at 2 to 8 percent over a flat brand surface.
- **Grey on colour:** move lightness until the pair clears 4.5:1, never hue.
- **Centered hero, everything centered:** a skeleton from `design/pools.md` at 70/30, 80/20 or a visible grid.
- **Same rhythm everywhere:** tight inside a group, generous between sections, one full-bleed, one short section.
- **Uniform radius and padding:** vary by role; hierarchy from several dimensions at once.
- **Pill or gradient button:** a solid high-contrast fill with one micro-interaction on custom easing.
- **Icon tile above a heading:** the heading alone, a real photo, or a number.
- **Emoji or default-trio icons:** one non-default family, one weight, uniform site-wide.
- **Fade-up-only:** one signature moment with a reduced-motion no-op, stillness everywhere else.
- **Bounce or elastic:** ease-out quart `cubic-bezier(0.25,1,0.5,1)`, quint `(0.22,1,0.36,1)`, expo `(0.16,1,0.3,1)`.
- **Stock photo, 3D blob, cartoon people:** real photos of the real business, or a labelled photo-less treatment.
- **Invented proof:** a real review quoted as given, with no face you do not have.
- **Generic loading or empty copy:** one line about what this business actually does.
- **Any banned copy structure:** the positive first, one plain declarative, in the owner's words from the copy doc.

> [!rule] Three or more clone-gate hits on a page means go back and reroll, not adjust. Adjusting a clone produces a slightly different clone.
