# CLAUDE.md, site project rules

You are working inside a website repository created from the site kit. The person you are working with may have never built a website. Explain what you are doing in one plain line before you do it, and never assume they know a term. These rules stand for every session in this repository.

**If the person says anything like "I'm ready to build a website", "let's start", or "where were we": open `START.md`, follow its instructions for Claude, read `site-log.md` to find the current step, and take it from there, one question at a time.**

## What this repository is

- `site/` holds the design exported from Claude Design. It is input, never something to edit by hand.
- `scripts/export-transform.mjs` turns `site/` into `dist/`. Every change made after export lives in that script (or in another script under `scripts/`) so it survives the next export.
- `dist/` is what the host serves. It is generated and committed.
- `prompts/`, `checklists/`, `templates/`, `design/` are the steps' handouts. Open the one the person names; fill brackets with them, never with a guess.
- `site-log.md` gets one line per change: date, what shipped, the deployment hash.

## Rules that do not bend

1. **Never hand-edit files under `site/` or `dist/`.** Change the source (Claude Design, the copy doc, or a script), then re-run the transform.
2. **Copy is law.** Text comes from the copy doc. Do not tighten, embellish, add claims, or fill a bracket like `[CONFIRM]` with a plausible value. Brackets render on the site until the owner answers them.
3. **No look is yours to choose.** Colours, type and layout come from `design/dna-form.md` and the owner's tokens. The blocklist in `design/blocklist-card.md` is a fence, not a menu.
4. **No secrets in the repository.** Tokens and keys go in the host's environment variables (production AND preview; names are case-sensitive; they bind on the next deploy). If Git tries to track a `.env` or a key, stop and fix `.gitignore` first. Never print a secret into the chat.
5. **Preview until approved.** Ship with the noindex header and a robots file that disallows everything until the owner approves the copy. Remove the gate only through `checklists/launch-gate.md`.
6. **Every deploy gets the probe.** After deploying, request the live page with a throwaway query parameter until the new content appears, then request the real URL, then confirm with the cache disabled. Verify on the per-deployment URL first; the alias lags.
7. **Change the version in the same commit as the asset.** Scripts and styles carry a content hash; a changed image gets a new filename.
8. **Forms must send.** A form is not done until one real test submission has landed in the CRM, notified the owner, reached the thank-you page and been deleted. Tag test contacts with an obvious name.
9. **Never test by clicking the owner's ads.** Use a browser that has never clicked one.
10. **Pull before you touch.** Another machine or person may have pushed. Branch for every change; production moves only after the owner's go; never `git reset --hard` on main.
11. **Phone first.** Before any page is called done, run `scripts/mobile-qa.mjs` and read the screenshots. Zero horizontal overflow, 44px tap targets, 16px body text, no hover-only behaviour.
12. **Log it.** One line in `site-log.md` the moment something ships, fails, or changes direction.

## How to work with the person

- Ask before you assume. Short numbered questions, all at once, then wait.
- Lead with the answer. Say what you did in one line and what they should look at.
- When something breaks, read the files and the deploy log before theorising, then propose the smallest reversible fix on a branch.
- If a request would break one of the rules above, say which rule and offer the nearest thing you can do.

## This site, specifically (Kairo on zscaledit.site)

- Owner and builder are the same person: Izaiah. He approves his own copy.
- LIVE since 2026-10-04. Cloudflare Pages project `zscaledit-website`, **direct upload only** (Git Provider: No). Pushing to GitHub does NOT deploy.
- Build: `npm run build` (scripts/kairo-build.mjs: prerender site/ -> .build/static -> export-transform -> dist/ -> cache-stamp). Deploy from the repo root so `functions/` (the www -> apex 301) ships too: `npx wrangler pages deploy dist --project-name=zscaledit-website --branch=<branch>`; `--branch=main` is production.
- The export is the .dc.html runtime shape. Never ship support.js: content must stay prerendered in the HTML. Motion lives in `wiring/site.js`.
- Map dots come from `data/census/top50-metros.json`, never the export's placeholders. No dot is ever marked taken.
- Founder photo: drop it at `wiring/founder.webp` and teach kairo-build.mjs to render it; until then the frame is omitted (never ship the [CONFIRM] caption).
- `_headers`: Cloudflare keeps ONE block per identical path. Add site-wide headers inside the existing `/*` block, never a second `/*`.
- Private, noindexed, kept via keep-list: `/watch` (60s social intro) and `/message` (7 min booked-lead video). Both post to a GHL webhook from `assets/js/vsl.js`.
