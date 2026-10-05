#!/usr/bin/env node
/**
 * kairo-build.mjs  -  the Kairo-specific build around the kit transform.
 *
 * WHY IT EXISTS  The Claude Design export is the "runtime variant": each .dc.html page is an
 *   almost empty shell that support.js fills in the browser (React from unpkg). Crawlers and
 *   people with JavaScript blocked would see nothing. This script renders every page ONCE in
 *   headless Chrome, saves the finished HTML, and drops the runtime. The three motion moments
 *   come back through wiring/site.js, which only animates what is already on the page.
 *
 * STEPS, IN ORDER (every one re-runs from scratch on a fresh export)
 *   1. Stage site/ into .build/raw/ and swap the map's placeholder metros for the verified
 *      US Census top-50 list in data/census/top50-metros.json. site/ itself is never edited.
 *   2. Serve .build/raw/ locally and render each *.dc.html with prefers-reduced-motion on, so
 *      every element is captured in its finished state (all dots lit, all steps shown).
 *   3. Write static pages to .build/static/: the rendered body, the export's stylesheets, the
 *      hover/active rules the runtime generated, favicons, JSON-LD, and wiring/site.js.
 *      Page fixes that are wiring, not design, happen here:
 *        - the logo points at a 2x WebP instead of the 271 KB PNG
 *        - How it works: step headings h3 -> h2 (no skipped heading level, same look)
 *        - Home: the founder photo frame is left out until wiring/founder.webp exists, so the
 *          live site never shows the [CONFIRM] placeholder
 *        - Book: the GHL calendar embed goes into #booking-widget
 *   4. Build Privacy and Terms from legal/*.body.html, and Referrals from
 *      pages/referrals.body.html, inside the same header and footer. Every footer gets a
 *      Referrals link. The referral form posts to functions/api/referral.js.
 *   5. Run scripts/export-transform.mjs with --src .build/static (head, robots, sitemap,
 *      _headers, keep-list copy), then extend _headers and replace the 404 page.
 *   6. Run scripts/cache-stamp.mjs.
 *
 * HOW TO RUN   node scripts/kairo-build.mjs        (or: npm run build)
 * NEEDS        Node 18+, puppeteer-core, Google Chrome, internet (the render loads React from
 *              unpkg and the fonts from Google, the same as the design preview did).
 * EXIT CODES   0 built. 1 anything failed; dist/ must not be deployed.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const RAW = path.join(ROOT, '.build', 'raw');
const STATIC = path.join(ROOT, '.build', 'static');
const DIST = path.join(ROOT, 'dist');
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'site-meta.json'), 'utf8'));
const ORIGIN = meta.site.url.replace(/\/+$/, '');

const die = (m) => { console.error('\nERROR  ' + m + '\n'); process.exit(1); };
const log = (m) => console.log(m);

// The calendar embed exactly as the old contact page shipped it (GHL booking widget).
const BOOKING_EMBED =
  '<iframe src="https://api.leadconnectorhq.com/widget/booking/cPecftm7zMOwaY1YJ7Pg" style="width:100%; height:680px; border:none; overflow:hidden; border-radius:var(--radius);" scrolling="no" id="cPecftm7zMOwaY1YJ7Pg_booking" title="Book a 30-minute growth audit"></iframe>\n' +
  '<script src="https://link.msgsndr.com/js/form_embed.js" type="text/javascript"></script>';

const FAVICONS = [
  '<link rel="icon" href="/favicon.ico" sizes="any">',
  '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">',
  '<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">',
  '<link rel="manifest" href="/site.webmanifest">'
].join('\n');

// The referral page is built here, not in Claude Design, so its look is written from the tokens.
const REFERRAL_CSS = `.ref section{padding:0 var(--gutter)}
.ref h2{font-size:var(--fs-h2);line-height:var(--lh-h2);margin-bottom:var(--s-5)}
.ref h3{font-family:var(--f-body);font-size:var(--fs-body);font-weight:600;line-height:var(--lh-body)}
.ref p,.ref li{max-width:var(--measure)}
.ref .num{font-variant-numeric:tabular-nums}
.ref strong{color:var(--accent);font-weight:600}
.ref-hero{padding:var(--s-6) 0 0 !important}
.ref-panel{position:relative;overflow:hidden;isolation:isolate;width:var(--panel-w);background:var(--surface);padding:var(--pad-panel-y) var(--pad-panel-x) var(--pad-panel-y) var(--gutter);display:flex;flex-direction:column;gap:var(--s-4)}
.ref-panel svg{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;stroke:var(--hairline)}
.ref-panel h1{font-size:var(--fs-h1);line-height:var(--lh-h1);max-width:18ch}
.ref-eyebrow{color:var(--accent);font-weight:500;letter-spacing:var(--track-label);text-transform:uppercase}
.ref-lead{font-size:var(--fs-lead);line-height:var(--lh-lead)}
.ref-cta{display:inline-flex;align-items:center;min-height:52px;padding:0 var(--s-5);background:var(--accent);color:var(--on-accent);font-weight:600;text-decoration:none;border-radius:var(--r-control);transition:transform var(--t-feedback) var(--ease)}
.ref-cta:active{transform:scale(.98)}
.ref-steps{margin-top:var(--gap-short)}
.ref-steps ol{list-style:none;padding:0;margin:0;display:grid;gap:var(--s-5);grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))}
.ref-steps li{display:flex;gap:var(--s-4);padding-top:var(--s-4);border-top:1px solid var(--hairline)}
.ref-steps li>.num{color:var(--accent);font-weight:600}
.ref-steps li p{color:var(--muted)}
.ref-example{margin-top:var(--s-6);padding:var(--s-4) var(--s-5);border-left:3px solid var(--accent);background:var(--surface)}
.ref-rules{margin-top:var(--gap-short)}
.ref-rules ul{padding-left:1.2em;margin:0}
.ref-rules li{color:var(--muted)}
.ref-rules li+li{margin-top:var(--s-3)}
.ref-form-wrap{margin:var(--gap-short) 0 var(--gap-section);max-width:44rem}
#referral-form{display:flex;flex-direction:column;gap:var(--s-6)}
#referral-form fieldset{border:0;padding:0;margin:0;display:flex;flex-direction:column;gap:var(--s-4)}
#referral-form legend{font-family:var(--f-display);font-size:var(--fs-h3);line-height:var(--lh-h3);margin-bottom:var(--s-4);padding:0}
#referral-form label{display:flex;flex-direction:column;gap:var(--s-2);font-weight:500}
#referral-form .opt{color:var(--muted);font-weight:400}
#referral-form input,#referral-form select,#referral-form textarea{font:inherit;font-size:max(16px,var(--fs-body));font-weight:400;color:var(--ink);background:var(--surface);border:1px solid var(--hairline);border-radius:var(--r-control);min-height:48px;padding:var(--s-3) var(--s-4);width:100%}
#referral-form textarea{resize:vertical}
#referral-form input::placeholder{color:var(--muted);opacity:.7}
#referral-form :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
#referral-form [aria-invalid="true"]{border-color:var(--accent);box-shadow:inset 3px 0 0 var(--accent)}
#referral-form button{align-self:flex-start;min-height:52px;padding:0 var(--s-6);font:inherit;font-weight:600;background:var(--accent);color:var(--on-accent);border:0;border-radius:var(--r-control);cursor:pointer;transition:transform var(--t-feedback) var(--ease)}
#referral-form button:active{transform:scale(.98)}
#referral-form button[disabled]{opacity:.6;cursor:progress}
.ref-hp{display:none}
.ref-status{min-height:1.6em;color:var(--accent);font-weight:500}
.ref-alt{margin-top:var(--s-5);color:var(--muted)}
.ref-alt a{display:inline-flex;align-items:center;min-height:44px}
@media (max-width:767px){#referral-form button{align-self:stretch}}`;

// ---------------------------------------------------------------- 1. stage

function stage() {
  if (!fs.existsSync(path.join(SITE, 'index.dc.html'))) die('site/index.dc.html is missing. Unzip the export into site/.');
  fs.rmSync(path.join(ROOT, '.build'), { recursive: true, force: true });
  fs.cpSync(SITE, RAW, { recursive: true });

  const census = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'census', 'top50-metros.json'), 'utf8'));
  if (census.metros.length !== 50) die('data/census/top50-metros.json must hold exactly 50 metros.');
  const list = JSON.stringify(census.metros.map((m) => [m.label, m.lat, m.lon]));
  const mdPath = path.join(RAW, 'market-data.js');
  const md = fs.readFileSync(mdPath, 'utf8');
  const swapped = md.replace(/METROS:\s*\[[\s\S]*?\]\],/, 'METROS: ' + list + ',');
  if (swapped === md) die('Could not find METROS in market-data.js. Did the export change its shape?');
  fs.writeFileSync(mdPath, swapped);
  log(`staged site/ -> .build/raw/, map metros from ${census.source.split(',')[0]} (${census.retrieved})`);
}

// ---------------------------------------------------------------- 2. render

function serve(dir) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
  const server = createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
    const file = path.resolve(dir, rel);
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r({ server, origin: 'http://127.0.0.1:' + server.address().port })));
}

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function render(pages) {
  const { server, origin } = await serve(RAW);
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  const out = {};
  try {
    for (const file of pages) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e.message)));
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await page.setViewport({ width: 1440, height: 9000 });
      await page.goto(origin + '/' + file, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForFunction(() => document.querySelector('#dc-root h1'), { timeout: 30000 });
      const hasMap = (await page.content()).includes('market-map');
      if (hasMap) await page.waitForFunction(() => document.querySelectorAll('#market-map button').length === 50, { timeout: 30000 });
      await new Promise((r) => setTimeout(r, 2200)); // the map selects its first metro after 1700 ms
      const got = await page.evaluate(() => {
        const host = document.querySelector('#dc-root > .sc-host') || document.querySelector('#dc-root');
        host.querySelectorAll('[data-dc-tpl]').forEach((el) => el.removeAttribute('data-dc-tpl'));
        const css = [];
        for (const sh of document.styleSheets) {
          const o = sh.ownerNode;
          if (!o || o.tagName !== 'STYLE') continue;
          try { for (const r of sh.cssRules) if (/^\.scp/.test(r.cssText)) css.push(r.cssText); } catch (e) { /* cross-origin */ }
        }
        return { body: host.innerHTML, css: css.join('\n'), title: document.title };
      });
      if (errors.length) die(`${file} threw while rendering: ${errors[0]}`);
      if (got.body.length < 2000) die(`${file} rendered only ${got.body.length} characters. The runtime did not fill the page.`);
      out[file] = got;
      log(`rendered ${file.padEnd(22)} ${String(got.body.length).padStart(6)} chars, ${got.css.split('\n').filter(Boolean).length} hover/active rules`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  return out;
}

// ---------------------------------------------------------------- 3. compose

function jsonLd(id) {
  const pm = meta.pages[id] || {};
  const url = ORIGIN + (id === 'index' ? '/' : '/' + id);
  const org = ORIGIN + '/#org';
  const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN + '/' }];
  if (id !== 'index') crumbs.push({ '@type': 'ListItem', position: 2, name: pm.crumb || id, item: url });
  const graph = [
    {
      '@type': ['ProfessionalService', 'Organization'],
      '@id': org,
      name: meta.site.name,
      url: ORIGIN + '/',
      description: meta.site.entity,
      email: meta.site.email,
      logo: ORIGIN + '/assets/kairo-logo-full.png',
      image: ORIGIN + meta.site.defaultOgImage,
      areaServed: { '@type': 'Country', name: 'United States' },
      founder: { '@type': 'Person', name: meta.site.founder }
    },
    { '@type': 'WebSite', '@id': ORIGIN + '/#website', url: ORIGIN + '/', name: meta.site.name, inLanguage: meta.site.language, publisher: { '@id': org } },
    {
      '@type': 'WebPage',
      '@id': url + '#webpage',
      url,
      name: pm.title,
      description: pm.description,
      inLanguage: meta.site.language,
      isPartOf: { '@id': ORIGIN + '/#website' },
      about: { '@id': org },
      author: { '@type': 'Person', name: meta.site.founder },
      publisher: { '@id': org },
      datePublished: '2026-10-04',
      dateModified: new Date().toISOString().slice(0, 10),
      breadcrumb: { '@id': url + '#breadcrumb' }
    },
    { '@type': 'BreadcrumbList', '@id': url + '#breadcrumb', itemListElement: crumbs }
  ];
  return '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) + '</script>';
}

function pageShell(id, title, css, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&amp;family=Fira+Sans:wght@400;500;600&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/tokens.css">
<style>
${css}
/* kairo-build: footer links meet the 44px tap target on narrow text like "Book" (mobile-qa 2026-10-04) */
footer nav a{min-width:44px;justify-content:center}
</style>
${FAVICONS}
${jsonLd(id)}
</head>
<body>
${body}
<script src="/wiring/site.js" defer></script>
</body>
</html>
`;
}

// The referral page is not in the export, so its footer link is wired in here, before Privacy.
function addReferralLink(b) {
  const out = b.replace(/(\n\s*)(<a href="\/privacy")/, '$1<a href="/referrals" style="display: flex; align-items: center; min-height: 44px; color: var(--muted);">Referrals</a>$1$2');
  if (out === b) die('Could not find the Privacy link in the footer to put Referrals before it.');
  return out;
}

function fixBody(file, body) {
  let b = addReferralLink(body);
  b = b.replace(/src="kairo-logo-full-transparent\.png"/g, 'src="/kairo-logo-nav.webp"');
  if (file === 'how-it-works.dc.html') b = b.replace(/<h3\b/g, '<h2').replace(/<\/h3>/g, '</h2>');
  if (file === 'index.dc.html' && !fs.existsSync(path.join(ROOT, 'wiring', 'founder.webp'))) {
    // the photo column is the second child of the founder section: drop it whole
    const before = b;
    b = b.replace(/(<section[^>]*data-screen-label="07 Founder"[\s\S]*?)<div[^>]*>\s*<figure[\s\S]*?<\/figure>\s*<\/div>/, '$1');
    if (b === before) die('Could not find the founder photo frame on the home page.');
  }
  if (file === 'book.dc.html') {
    const raw = fs.readFileSync(path.join(SITE, 'book.dc.html'), 'utf8');
    const booked = (raw.match(/<sc-if value="\{\{ booked \}\}"[^>]*>([\s\S]*?)<\/sc-if>/) || [])[1];
    if (!booked) die('Could not find the booked line in book.dc.html.');
    const before = b;
    b = b.replace(/<p aria-live="polite"/, `<p aria-live="polite" data-booked-text="${booked.replace(/"/g, '&quot;')}"`);
    b = b.replace(/(<div id="booking-widget"[^>]*>)(<\/div>)/, `$1${BOOKING_EMBED}$2`);
    if (b === before || !b.includes('widget/booking/cPecftm7zMOwaY1YJ7Pg')) die('Could not wire the booking widget into #booking-widget.');
  }
  if (/\[CONFIRM|\[VERIFY|\{\{/.test(b)) die(`${file} still holds a marker or an unfilled {{ }} after rendering.`);
  return b;
}

function compose(rendered) {
  fs.mkdirSync(STATIC, { recursive: true });
  for (const [file, got] of Object.entries(rendered)) {
    const id = file.replace(/\.dc\.html$/, '');
    const out = path.join(STATIC, id + '.html');
    fs.writeFileSync(out, pageShell(id, got.title, got.css, fixBody(file, got.body)));
    const t = fs.statSync(path.join(SITE, file)).mtime; // sitemap lastmod = when the design last changed
    fs.utimesSync(out, t, t);
  }

  // 4. legal pages inside the home page's header and footer
  const home = rendered['index.dc.html'].body.replace(/src="kairo-logo-full-transparent\.png"/g, 'src="/kairo-logo-nav.webp"');
  const header = (home.match(/<header[\s\S]*?<\/header>/) || [])[0];
  const footer = addReferralLink((home.match(/<footer[\s\S]*?<\/footer>/) || [])[0] || '');
  const sticky = (home.match(/<div style="display: var\(--phone-flex\)[\s\S]*?<\/a><\/div>/) || [])[0];
  if (!header || !footer) die('Could not lift the header and footer off the home page for the legal pages.');
  const legalCss = `.legal{padding:var(--s-7) var(--gutter) var(--gap-section);max-width:46rem}
.legal h1{font-size:var(--fs-h1);line-height:var(--lh-h1);margin-bottom:var(--s-5)}
.legal h2{font-size:var(--fs-h3);line-height:var(--lh-h3);margin:var(--s-7) 0 var(--s-3)}
.legal p,.legal li{color:var(--muted);max-width:var(--measure)}
.legal p+p{margin-top:var(--s-3)}
.legal ul{margin:var(--s-3) 0;padding-left:1.2em}
.legal li+li{margin-top:var(--s-2)}
.legal strong{color:var(--ink);font-weight:500}
.legal a{display:inline-flex;align-items:center;min-height:44px}`;
  for (const id of ['privacy', 'terms']) {
    const src = path.join(ROOT, 'legal', id + '.body.html');
    const body = `${header.replace(/ aria-current="page"/, '')}\n<main class="legal">\n${fs.readFileSync(src, 'utf8')}</main>\n${footer}\n${sticky || ''}`;
    const css = rendered['index.dc.html'].css + '\n' + legalCss;
    const out = path.join(STATIC, id + '.html');
    fs.writeFileSync(out, pageShell(id, (meta.pages[id] || {}).title || id, css, body));
    const t = fs.statSync(src).mtime;
    fs.utimesSync(out, t, t);
  }

  // the referral page: its own body, the shared shell, a phone sticky that jumps to the form
  {
    const src = path.join(ROOT, 'pages', 'referrals.body.html');
    const refSticky = `<div style="display: var(--phone-flex); position: fixed; left: 0px; right: 0px; bottom: 0px; z-index: 50; padding: var(--s-3) var(--gutter) calc(var(--s-3) + env(safe-area-inset-bottom)); background: var(--canvas); border-top: 1px solid var(--hairline);">
  <a href="#referral-form" class="ref-cta" style="flex: 1 1 0%; justify-content: center; min-height: 52px;">Send a referral</a></div>`;
    const body = `${header.replace(/ aria-current="page"/, '')}\n<main class="ref">\n${fs.readFileSync(src, 'utf8')}</main>\n${footer}\n${refSticky}`;
    if (/\[CONFIRM|\[VERIFY|\{\{/.test(body)) die('pages/referrals.body.html still holds a marker.');
    const out = path.join(STATIC, 'referrals.html');
    fs.writeFileSync(out, pageShell('referrals', (meta.pages.referrals || {}).title || 'Referrals', rendered['index.dc.html'].css + '\n' + REFERRAL_CSS, body));
    const t = fs.statSync(src).mtime;
    fs.utimesSync(out, t, t);
  }

  fs.copyFileSync(path.join(SITE, 'tokens.css'), path.join(STATIC, 'tokens.css'));
  fs.copyFileSync(path.join(ROOT, 'wiring', 'kairo-logo-nav.webp'), path.join(STATIC, 'kairo-logo-nav.webp'));
  fs.mkdirSync(path.join(STATIC, 'wiring'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'wiring', 'site.js'), path.join(STATIC, 'wiring', 'site.js'));
  log('composed .build/static/: ' + fs.readdirSync(STATIC).join(', '));
}

// ---------------------------------------------------------------- 5. transform and after

function run(script, args = []) {
  execFileSync(process.execPath, [path.join(ROOT, 'scripts', script), ...args], { stdio: 'inherit', cwd: ROOT });
}

function afterTransform() {
  // Cloudflare keeps only ONE block per identical path: a second "/*" block silently
  // replaces the first. So HSTS goes INTO the transform's "/*" block, never a new one.
  const hp = path.join(DIST, '_headers');
  const h = fs.readFileSync(hp, 'utf8');
  const withHsts = h.replace(/(\n\/\*\n(?:  [^\n]+\n)+)/, '$1  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload\n');
  if (withHsts === h) die('Could not find the "/*" block in dist/_headers to add HSTS to.');
  fs.writeFileSync(hp, withHsts);
  fs.appendFileSync(hp, `
# Added by scripts/kairo-build.mjs
# private video pages: never in search
/watch
  X-Robots-Tag: noindex, nofollow
/watch/*
  X-Robots-Tag: noindex, nofollow
/message
  X-Robots-Tag: noindex, nofollow
/message/*
  X-Robots-Tag: noindex, nofollow

# stable filenames busted with ?v=<hash>
/tokens.css
  Cache-Control: public, max-age=0, must-revalidate
/wiring/*
  Cache-Control: public, max-age=0, must-revalidate
`);
  fs.writeFileSync(path.join(DIST, '404.html'), `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found | Kairo</title>
<meta name="robots" content="noindex">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&amp;family=Fira+Sans:wght@400;500;600&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/tokens.css">
<link rel="icon" href="/favicon.ico" sizes="any">
</head>
<body>
<main style="padding:var(--gap-section) var(--gutter);display:flex;flex-direction:column;gap:var(--s-5);max-width:40rem">
<h1 style="font-size:var(--fs-h1);line-height:var(--lh-h1)">That page is not here</h1>
<p style="color:var(--muted)">The address may have changed. Start from the home page.</p>
<p><a href="/" style="display:inline-flex;align-items:center;min-height:44px">Go to the home page</a></p>
</main>
</body>
</html>
`);
  log('extended dist/_headers (HSTS, noindex on /watch and /message, css/js revalidate) and wrote the 404 page');
}

// ---------------------------------------------------------------- go

stage();
const pages = fs.readdirSync(RAW).filter((f) => f.endsWith('.dc.html')).sort();
const rendered = await render(pages);
compose(rendered);
run('export-transform.mjs', ['--src', '.build/static']);
afterTransform();
run('cache-stamp.mjs');
log('\nBuild done. Next: node scripts/machine-layer-check.mjs dist  and  node scripts/mobile-qa.mjs --dir dist');
