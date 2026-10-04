# Design DNA: Kairo (zscaledit.site)

Date rolled: 2026-10-04
Filled by: Claude Code with the owner (Izaiah Jackson). Indexes from Python `secrets`, not chosen.

## Register
Register: BRAND
Why: the site sells the operator himself; the design has to read as "this guy understands my shop".

## Mined world (ten physical facts about this business)
1. Kairo's clients work in install bays: concrete floor, roll-up door, overhead work lights.
2. Vinyl and PPF come off big rolls and get laid with a squeegee and a heat gun.
3. Tint film is cut on a plotter or by hand on the glass.
4. Detail shops light cars under hexagon LED ceiling grids to see swirl marks.
5. The owner reads leads on his phone between installs, often with gloves on.
6. Quotes and the week's jobs live on a whiteboard or a booking calendar.
7. A job is a car in a bay for one to five days; an empty bay is lost money.
8. Kairo's own work happens in ad dashboards, a CRM pipeline and text-message follow-up.
9. The Kairo logo is a single deep forest green mark on near-white.
10. The owner's chosen feel reference: a pro install bay at night, one work light, focus.

## Anchor objects (three, real things, never adjectives)
1. A hexagon LED detailing light grid over a dark bay (the spatial idea: a lit pattern over darkness).
2. A job board with bays in rows and a status per bay (the spatial idea: a grid you can read at a glance).
3. A plotter cutting a line across a wide roll (the spatial idea: one precise moving line across a wide field).
Borrowed: the spatial idea only. Never their colours, fonts, brand or copy.

## The eight axes

1. ARCHETYPE / MOOD
   Pool number rolled: 24
   Name: terminal or command line
   In one sentence: a night-shift control readout: dark field, precise monospaced-feeling labels as
   accents, status lines, and copy that reads like a calm operator talking, not like code.
   Broken off default: yes

2. COLOUR SYSTEM (owned palette, exempt from the roll and the distance gate, not from contrast)
   Commitment level: committed (the dark forest field owns the page)
   Canvas: hex #0A0F0C (owned, approved in the 2026-08-13 rebrand)
   Surface: hex #122D20, oklch(0.271 0.041 161), the logo's own green
   Ink: hex #F2F5F0. Muted text: hex #A3B0A8. Hairline: hex #26332B
   Accent: hex #34C77B (owned, 2026-08-13 rebrand). Text on accent: #0A0F0C
   Accent share of visual weight: about 8 percent (buttons, map dots, one status line per screen)
   Neutral ramp: 5 steps, hue held at 161, from #0A0F0C to #F2F5F0
   Pure black or white anywhere: no
   Contrast measured 2026-10-04: ink on canvas 17.57, ink on surface 13.43, muted on canvas 8.59,
   muted on surface 6.56, accent on canvas 8.84, accent on surface 6.75, text on accent 8.84. All pass.
   Broken off default: exempt (owned)

3. TYPE SYSTEM
   Display category: display serif, upright only, never italic (rolled 9-pool reroll, roles swapped
   from body to display because a display serif cannot carry body text)
   Body category: humanist sans (rolled 4, moved from display to body in the same swap)
   Families: chosen in the Claude Design session from these categories, none from the saturated list
   Contrasting axes: serif against sans, heavy display against open humanist body
   Scale ratio: at least 1.25. Heading clamp max over min: under 2.5x, clamped by min(vw, vh)
   Tabular figures on: step numbers, the "day 8" line, the $500 line
   Rejected on autopilot: Inter, Bricolage Grotesque, Public Sans, IBM Plex Mono (the current site's set)
   Broken off default: yes

4. LAYOUT SKELETON
   Pool number rolled: 2
   Silhouette: asymmetric
   In one spatial sentence: headlines sit off a left grid line at roughly 70/30, with the map and the
   photo bleeding off the right edge; nothing is centered in a column.
   Proportion committed to: 70/30
   Broken off default: yes

5. MOTION PERSONALITY
   Personality: kinetic and snappy (rolled 2; matches owner's "alive and moving")
   Easing token used everywhere: ease-out expo cubic-bezier(0.16,1,0.3,1)
   Durations: feedback 120ms, state 220ms, layout 360ms, entrance 600ms, exit 450ms
   Signature moments budgeted: 3. Where: the map dots lighting up in a sweep like a plotter pass;
   the five steps ticking on as status lines; the button press
   Reduced-motion no-op: yes
   Broken off default: yes

6. THE ONE SIGNATURE ELEMENT
   Signature: the open markets map (pool 6 entry 8, derived; the rolled entry 3 grain field moves to
   the texture layer)
   Derived from what the customer physically does before buying: he checks whether his city is open
   Not the lead form or booking flow: confirmed (the map shows markets; booking is a separate page)
   Lead-capture mechanism (infrastructure): GHL booking calendar on /book

7. ICON AND TEXTURE LANGUAGE
   Icon family: Iconoir (rolled 1). One weight: 1.5px stroke. Licence: MIT
   Texture: duotone on imagery (rolled 6) plus a faint grain field on the canvas (from the signature
   roll), strength 3 percent
   Broken off default: yes

8. IMAGERY DIRECTION AND TREATMENT
   Direction: real photos only (owner and real work he has rights to); no stock, nothing generated as proof
   Treatment: desaturated editorial (rolled 6) in a forest-green duotone
   Role ratios: cards 4:5, full-bleed 16:9, strip frames 3:2
   Frame language: square corners, 1px hairline frame
   Differs from the last two ledger rows: yes (first row in this ledger)
   Broken off default: yes

Axes broken off default: 7 (colour exempt as owned)
Of those, from {colour model, layout silhouette, display type}: 2 (layout, display type)

## Distance gate
Exempt: the brand owns its palette (logo green plus the approved 2026-08-13 tokens). Contrast still
measured above, all pass. Off the banned purple and indigo hexes: yes (the August rebrand removed them).
Category-reflex hue for a marketing agency: blue or purple. Avoided: yes.

## Ledger check
Last two rows read: ledger was empty before this row.
Flavour collision: no. Clone-gate hits on first build: [counted after the Claude Design session]

## The three governing tests (checked again on the exported pages)
- [ ] Slop test
- [ ] Category test, two depths
- [ ] Competitor test
