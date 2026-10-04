#!/usr/bin/env node
/**
 * mobile-qa.mjs, the phone pass harness.
 *
 * WHAT IT DOES: opens every page in a real headless Chrome at the eight viewports from the
 * phone lesson, using DEVICE EMULATION (not a resized window, which has a ~500px floor and
 * fakes a "clipped" screenshot), saves a full-page screenshot of each page at each viewport
 * into qa/<YYYY-MM-DD>/, and prints four numbers per page: horizontal overflow, console
 * errors, smallest tap target, smallest rendered body font size.
 *
 * HOW TO RUN:
 *   node scripts/mobile-qa.mjs --dir dist
 *   node scripts/mobile-qa.mjs --url https://preview.example.com --url https://preview.example.com/about
 *   node scripts/mobile-qa.mjs --urls qa/urls.txt --wait "main" --out qa
 * Given a folder it starts a tiny static server on 127.0.0.1 and finds every .html inside.
 *
 * WHAT IT NEEDS: Node 18 or newer, `npm i -D puppeteer-core`, and a Chrome or Edge already
 * installed. It looks at the CHROME_PATH environment variable first, then the usual install
 * paths on Windows, macOS and Linux. If it finds nothing it stops and tells you to set
 * CHROME_PATH.
 *
 * WHAT IT PRINTS: one block per page and viewport, then a FAILURES list grouped by page,
 * then a summary line and the screenshot folder.
 *
 * EXIT CODES: 0 every page passed. 1 at least one page failed a gate (overflow not 0, any
 * console error, a tap target under 44px, body text under 16px, or a page that would not
 * load). 2 the run could not start (no Chrome, no pages, bad flag).
 */

import puppeteer from 'puppeteer-core';
import { createServer } from 'node:http';
import { readdir, mkdir, stat, readFile, writeFile } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import path from 'node:path';

/* ------------------------------------------------------------------ *
 * Thresholds. The phone lesson sets these; change them here, not      *
 * inline, so the numbers stay in one place.                           *
 * ------------------------------------------------------------------ */
const MAX_OVERFLOW_PX = 0;   // document.scrollWidth minus window.innerWidth
const MIN_TAP_PX = 44;       // smallest side of a tappable box
const MIN_FONT_PX = 16;      // smallest rendered size of a block of body text
const BODY_TEXT_MIN_CHARS = 8; // text shorter than this counts as a label, not body text
const NAV_TIMEOUT_MS = 30000;  // a ceiling on waiting, never a substitute for waiting on the DOM

/* The eight viewports from the lesson. The first four are emulated phones and a tablet
 * (touch, mobile user agent, real device pixel ratio). The last four are widths only. */
const UA_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const UA_ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const UA_IPAD = 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const UA_DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const VIEWPORTS = [
  // deviceScaleFactor 2 on the phones keeps the screenshots readable without making
  // 3x files nobody opens. The CSS width is what the layout reacts to.
  { label: '390x844', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA_IOS, note: 'current large phone' },
  { label: '375x667', width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA_IOS, note: 'short phone, catches the most' },
  { label: '360x640', width: 360, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA_ANDROID, note: 'small Android' },
  { label: '820x1180', width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA_IPAD, note: 'tablet portrait' },
  { label: '1024w', width: 1024, height: 768, deviceScaleFactor: 1, isMobile: false, hasTouch: false, userAgent: UA_DESKTOP, note: 'small laptop' },
  { label: '1440w', width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false, userAgent: UA_DESKTOP, note: 'laptop' },
  { label: '1600w', width: 1600, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false, userAgent: UA_DESKTOP, note: 'large monitor' },
  { label: '1885w', width: 1885, height: 1000, deviceScaleFactor: 1, isMobile: false, hasTouch: false, userAgent: UA_DESKTOP, note: 'wide monitor' },
];

/* ------------------------------------------------------------------ *
 * Flags, parsed by hand.                                              *
 * ------------------------------------------------------------------ */
function parseArgs(argv) {
  const opts = { dir: null, urls: [], urlFile: null, out: 'qa', wait: 'body', port: 0, chrome: null, help: false, only: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) fatal(`The flag ${a} needs a value after it.`, 2);
      return v;
    };
    if (a === '--dir') opts.dir = next();
    else if (a === '--url') opts.urls.push(next());
    else if (a === '--urls') opts.urlFile = next();
    else if (a === '--out') opts.out = next();
    else if (a === '--wait') opts.wait = next();
    else if (a === '--port') opts.port = Number(next());
    else if (a === '--chrome') opts.chrome = next();
    else if (a === '--only') opts.only = next();
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (!a.startsWith('-') && !opts.dir && opts.urls.length === 0) {
      // a bare argument: a folder if it exists on disk, otherwise a URL
      if (existsSync(a)) opts.dir = a; else opts.urls.push(a);
    } else fatal(`I do not know the flag ${a}. Run with --help to see the list.`, 2);
  }
  return opts;
}

function usage() {
  console.log(`
mobile-qa.mjs, the phone pass harness

  node scripts/mobile-qa.mjs --dir dist
  node scripts/mobile-qa.mjs --url https://preview.example.com [--url ...]
  node scripts/mobile-qa.mjs --urls urls.txt

  --dir <folder>    a built site folder. It gets served on 127.0.0.1 and every .html inside is shot.
  --url <address>   one page. Repeat the flag for more pages.
  --urls <file>     a text file with one address per line. Lines starting with # are ignored.
  --out <folder>    where the dated screenshot folder goes. Default: qa
  --wait <selector> the element that must exist before a page counts as loaded. Default: body
  --port <number>   port for the built-in server. Default: any free port.
  --chrome <path>   path to Chrome. Overrides the CHROME_PATH environment variable.
  --only <label>    run one viewport only, for example --only 375x667
  -h, --help        this text

Gates: horizontal overflow ${MAX_OVERFLOW_PX}px, zero console errors, tap targets ${MIN_TAP_PX}px or larger,
body text ${MIN_FONT_PX}px or larger. Any failure exits 1.
`);
}

function fatal(message, code = 2) {
  console.error(`\nmobile-qa stopped: ${message}\n`);
  process.exit(code);
}

/* ------------------------------------------------------------------ *
 * Finding Chrome.                                                     *
 * ------------------------------------------------------------------ */
function findChrome(override) {
  /* An explicit path is an instruction, not a suggestion: if you named a browser and it is
   * not there, say so instead of quietly using a different one. */
  const explicit = override || process.env.CHROME_PATH;
  if (explicit) {
    if (existsSync(explicit)) return explicit;
    const from = override ? '--chrome' : 'the CHROME_PATH environment variable';
    fatal(`There is no browser at ${explicit}, which is what ${from} points at. Fix the path or remove it and let me look in the usual places.`, 2);
  }
  const candidates = [];
  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (process.platform === 'win32') {
    const roots = [process.env['PROGRAMFILES'], process.env['PROGRAMFILES(X86)'], process.env['LOCALAPPDATA']].filter(Boolean);
    for (const root of roots) {
      candidates.push(path.join(root, 'Google/Chrome/Application/chrome.exe'));
      candidates.push(path.join(root, 'Google/Chrome Beta/Application/chrome.exe'));
      candidates.push(path.join(root, 'Microsoft/Edge/Application/msedge.exe'));
    }
  } else if (process.platform === 'darwin') {
    candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
    candidates.push('/Applications/Chromium.app/Contents/MacOS/Chromium');
    candidates.push('/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
    if (home) candidates.push(path.join(home, 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'));
  } else {
    candidates.push('/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
      '/usr/bin/chromium-browser', '/snap/bin/chromium', '/usr/bin/microsoft-edge');
  }
  for (const c of candidates) {
    if (c && existsSync(c)) return c;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * The tiny static server, used when you point at a folder.            *
 * ------------------------------------------------------------------ */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf',
};

async function serveFolder(root, port) {
  const abs = path.resolve(root);
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
      let file = path.resolve(abs, rel);
      // refuse anything that climbs out of the folder
      if (file !== abs && !file.startsWith(abs + path.sep)) {
        res.writeHead(403).end('Outside the served folder');
        return;
      }
      const candidates = [];
      if (rel === '' || rel.endsWith('/')) candidates.push(path.join(file, 'index.html'));
      else candidates.push(file, file + '.html', path.join(file, 'index.html'));
      for (const c of candidates) {
        if (existsSync(c) && (await stat(c)).isFile()) {
          res.writeHead(200, { 'content-type': MIME[path.extname(c).toLowerCase()] || 'application/octet-stream' });
          createReadStream(c).pipe(res);
          return;
        }
      }
      const notFound = path.join(abs, '404.html');
      if (existsSync(notFound)) {
        res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
        createReadStream(notFound).pipe(res);
        return;
      }
      res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
    } catch (err) {
      res.writeHead(500, { 'content-type': 'text/plain' }).end('Server error: ' + err.message);
    }
  });
  await new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port || 0, '127.0.0.1', resolve);
  });
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

async function findHtml(root, base = root, found = []) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) await findHtml(full, base, found);
    else if (entry.name.toLowerCase().endsWith('.html')) found.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return found;
}

/* Turn dist/about.html into /about, dist/index.html into /, dist/a/index.html into /a */
function toRoute(rel) {
  let r = rel.replace(/\.html$/i, '');
  if (r === 'index') return '/';
  if (r.endsWith('/index')) r = r.slice(0, -'/index'.length);
  return '/' + r;
}

function safeName(route) {
  const s = route.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9._-]+/gi, '-');
  return s === '' ? 'home' : s;
}

/* ------------------------------------------------------------------ *
 * The overflow hunter. This function is shipped into the page and run *
 * there. It returns the top ten elements sticking out past the right  *
 * edge, widest overhang first. It is the snippet from the lesson with *
 * the numbers attached, so you know how far out each one is.          *
 * You can paste the same idea straight into a browser console.        *
 * ------------------------------------------------------------------ */
export function overflowHunter() {
  // Same width rule as the measurement below: the LAYOUT viewport, because a phone
  // browser widens the visual viewport to fit overflow and innerWidth then lies.
  const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
  const limit = viewportWidth + 1;
  return [...document.querySelectorAll('*')]
    .map((el) => ({ el, rect: el.getBoundingClientRect() }))
    .filter(({ rect }) => rect.right > limit && rect.width > 0 && rect.height > 0)
    .sort((a, b) => b.rect.right - a.rect.right)
    .slice(0, 10)
    .map(({ el, rect }) => {
      const cls = typeof el.className === 'string' && el.className.trim()
        ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
        : '';
      const id = el.id ? '#' + el.id : '';
      return {
        selector: el.tagName.toLowerCase() + id + cls,
        overhangPx: Math.round(rect.right - viewportWidth),
        widthPx: Math.round(rect.width),
      };
    });
}

/* ------------------------------------------------------------------ *
 * The four numbers, measured inside the page.                         *
 * ------------------------------------------------------------------ */
function measureSource() {
  return function measure(opts) {
    const { minTap, minFont, bodyMinChars } = opts;

    const visible = (el, rect) => {
      if (rect.width <= 0 || rect.height <= 0) return false;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return false;
      return true;
    };

    /* Horizontal overflow. The lesson writes this as scrollWidth minus innerWidth, which
     * is what you type in a desktop console. Under phone emulation there is a catch: when
     * content sticks out, the browser widens the VISUAL viewport to fit it, so innerWidth
     * grows to match scrollWidth and the number comes back 0 on a page that scrolls
     * sideways on a real phone. document.documentElement.clientWidth is the LAYOUT
     * viewport and stays at 375 or 390, so take whichever is smaller. */
    const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
    const overflow = document.documentElement.scrollWidth - viewportWidth;

    /* Smallest tap target. The tappable BOX, padding included. A bare text link
     * inside a sentence is not a tap target, so inline links inside running text
     * are skipped, the way the lesson describes. */
    const tapSelector = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [onclick], label[for]';
    let smallestTap = null;
    for (const el of document.querySelectorAll(tapSelector)) {
      const rect = el.getBoundingClientRect();
      if (!visible(el, rect)) continue;
      const cs = getComputedStyle(el);
      const isInlineTextLink = el.tagName === 'A' && cs.display === 'inline' && el.closest('p, li, figcaption, blockquote, td');
      if (isInlineTextLink) continue;
      const side = Math.min(rect.width, rect.height);
      if (smallestTap === null || side < smallestTap.px) {
        const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '';
        smallestTap = {
          px: Math.round(side * 10) / 10,
          selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + cls,
          text: (el.textContent || el.value || '').trim().slice(0, 30),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      }
    }

    /* Smallest rendered font size on a run of body text. Elements whose own text is
     * shorter than bodyMinChars count as labels or icons, not body copy, so they are
     * left out; the number would otherwise always be a copyright glyph. */
    let smallestFont = null;
    for (const el of document.querySelectorAll('body *')) {
      let own = '';
      for (const node of el.childNodes) if (node.nodeType === 3) own += node.nodeValue;
      own = own.replace(/\s+/g, ' ').trim();
      if (own.length < bodyMinChars) continue;
      const rect = el.getBoundingClientRect();
      if (!visible(el, rect)) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (!Number.isFinite(size)) continue;
      if (smallestFont === null || size < smallestFont.px) {
        const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '';
        smallestFont = {
          px: Math.round(size * 10) / 10,
          selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + cls,
          text: own.slice(0, 40),
        };
      }
    }

    return { overflow, smallestTap, smallestFont, title: document.title || '', minTap, minFont };
  };
}

/* Scroll the whole page once so lazy images and on-scroll sections mount, waiting on
 * animation frames rather than on a clock. */
function settleSource() {
  return async function settle() {
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) { /* older browser */ } }
    const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
    const step = Math.max(200, Math.floor(window.innerHeight * 0.9));
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await frame(); await frame();
    }
    window.scrollTo(0, 0);
    await frame(); await frame();
    const imgs = [...document.images].filter((i) => !i.complete);
    await Promise.all(imgs.map((i) => new Promise((r) => {
      i.addEventListener('load', r, { once: true });
      i.addEventListener('error', r, { once: true });
    })));
  };
}

/* ------------------------------------------------------------------ *
 * Main.                                                               *
 * ------------------------------------------------------------------ */
const opts = parseArgs(process.argv.slice(2));
if (opts.help) { usage(); process.exit(0); }

if (opts.urlFile) {
  if (!existsSync(opts.urlFile)) fatal(`I cannot find the URL list at ${opts.urlFile}.`, 2);
  const lines = (await readFile(opts.urlFile, 'utf8')).split(/\r?\n/)
    .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  opts.urls.push(...lines);
}

if (!opts.dir && opts.urls.length === 0) {
  if (existsSync('dist')) opts.dir = 'dist';
  else fatal('Tell me what to test. Use --dir dist for a built folder, or --url https://... for a live page. Run with --help for the full list.', 2);
}

const viewports = opts.only ? VIEWPORTS.filter((v) => v.label === opts.only) : VIEWPORTS;
if (viewports.length === 0) {
  fatal(`--only ${opts.only} matches no viewport. The labels are: ${VIEWPORTS.map((v) => v.label).join(', ')}.`, 2);
}

const chromePath = findChrome(opts.chrome);
if (!chromePath) {
  fatal([
    'I could not find Chrome on this machine.',
    'This script drives a real Chrome you already have installed; it does not download one.',
    'Install Google Chrome, or set the CHROME_PATH environment variable to the browser you want used, for example:',
    '  Windows:  set CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"',
    '  macOS:    export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"',
    '  Linux:    export CHROME_PATH=/usr/bin/google-chrome',
    'You can also pass it directly with --chrome <path>.',
  ].join('\n  '), 2);
}

let served = null;
let pages = [];
if (opts.dir) {
  if (!existsSync(opts.dir)) fatal(`I cannot find the folder ${opts.dir}. Build the site first, or pass --url instead.`, 2);
  const files = await findHtml(path.resolve(opts.dir));
  if (files.length === 0) fatal(`There are no .html files inside ${opts.dir}, so there is nothing to test.`, 2);
  served = await serveFolder(opts.dir, opts.port);
  pages = files.sort().map((rel) => ({ route: toRoute(rel), url: served.origin + toRoute(rel) }));
  console.log(`Serving ${path.resolve(opts.dir)} at ${served.origin}`);
} else {
  pages = opts.urls.map((u) => {
    let route = u;
    try { route = new URL(u).pathname; } catch { fatal(`${u} is not a web address. It needs to start with http:// or https://.`, 2); }
    return { route, url: u };
  });
}

const date = new Date().toISOString().slice(0, 10);
const shotDir = path.resolve(opts.out, date);
await mkdir(shotDir, { recursive: true });

console.log(`Chrome:      ${chromePath}`);
console.log(`Pages:       ${pages.length}`);
console.log(`Viewports:   ${viewports.map((v) => v.label).join(', ')}`);
console.log(`Screenshots: ${shotDir}`);
console.log(`Gates:       overflow ${MAX_OVERFLOW_PX}px, 0 console errors, tap >= ${MIN_TAP_PX}px, body text >= ${MIN_FONT_PX}px`);
console.log('');

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars'],
});

const measure = measureSource();
const settle = settleSource();
const failures = [];
const rows = [];
let shots = 0;

try {
  for (const pageDef of pages) {
    console.log(`PAGE ${pageDef.route}`);
    for (const vp of viewports) {
      const page = await browser.newPage();
      const consoleErrors = [];
      /* Chrome asks for /favicon.ico by itself on the first page of a session. A 404 on it
       * is a browser habit, not a page bug, and it would fail exactly one viewport at
       * random, so it is left out. Everything else counts. */
      const isFavicon = (u) => typeof u === 'string' && /\/favicon\.ico(\?|$)/i.test(u);
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        const loc = msg.location && msg.location();
        if (loc && isFavicon(loc.url)) return;
        consoleErrors.push(msg.text().slice(0, 200));
      });
      page.on('pageerror', (err) => consoleErrors.push('uncaught: ' + String(err.message).slice(0, 200)));
      page.on('requestfailed', (req) => {
        const reason = req.failure() && req.failure().errorText;
        if (isFavicon(req.url())) return;
        if (reason && reason !== 'net::ERR_ABORTED') consoleErrors.push(`request failed (${reason}): ${req.url().slice(0, 120)}`);
      });

      // DEVICE emulation: viewport, pixel ratio, touch and user agent together.
      await page.emulate({
        viewport: {
          width: vp.width, height: vp.height,
          deviceScaleFactor: vp.deviceScaleFactor,
          isMobile: vp.isMobile, hasTouch: vp.hasTouch, isLandscape: false,
        },
        userAgent: vp.userAgent,
      });
      page.setDefaultTimeout(NAV_TIMEOUT_MS);

      const label = `${safeName(pageDef.route)}-${vp.label}`;
      const record = { route: pageDef.route, viewport: vp.label, problems: [] };

      try {
        // Wait on the DOM and on a selector, never on a fixed timer.
        const res = await page.goto(pageDef.url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
        if (res && res.status() >= 400) record.problems.push(`HTTP ${res.status()}`);
        await page.waitForSelector(opts.wait, { timeout: NAV_TIMEOUT_MS });
        await page.evaluate(settle);

        const m = await page.evaluate(measure, {
          minTap: MIN_TAP_PX, minFont: MIN_FONT_PX, bodyMinChars: BODY_TEXT_MIN_CHARS,
        });
        // Only hunt when there is something to hunt: the top ten widest offenders.
        const offenders = m.overflow > MAX_OVERFLOW_PX ? await page.evaluate(overflowHunter) : [];

        /* Shoot the full height at the LAYOUT viewport width. A plain full-page shot widens
         * itself to include anything sticking out sideways, which makes an overflowing page
         * look fine in the picture. The overflow number and the offender list above already
         * report that; the screenshot should show what the visitor sees. */
        const box = await page.evaluate(() => ({
          width: Math.min(window.innerWidth, document.documentElement.clientWidth),
          height: Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0),
        }));
        await page.screenshot({
          path: path.join(shotDir, `${label}.png`),
          captureBeyondViewport: true,
          clip: { x: 0, y: 0, width: box.width, height: Math.min(box.height, 16000), scale: 1 },
        });
        shots++;

        const tapPx = m.smallestTap ? m.smallestTap.px : null;
        const fontPx = m.smallestFont ? m.smallestFont.px : null;
        console.log(`  ${vp.label.padEnd(9)} overflow ${String(m.overflow).padStart(4)}px | console errors ${String(consoleErrors.length).padStart(2)} | smallest tap ${tapPx === null ? '  n/a' : String(tapPx).padStart(5)}px | smallest text ${fontPx === null ? ' n/a' : String(fontPx).padStart(4)}px`);

        if (m.overflow > MAX_OVERFLOW_PX) {
          record.problems.push(`horizontal overflow ${m.overflow}px, widest offenders: ` +
            offenders.map((o) => `${o.selector} (+${o.overhangPx}px, ${o.widthPx}px wide)`).join('; '));
        }
        if (consoleErrors.length) record.problems.push(`${consoleErrors.length} console error(s): ` + consoleErrors.slice(0, 3).join(' | '));
        if (vp.hasTouch && tapPx !== null && tapPx < MIN_TAP_PX) {
          record.problems.push(`tap target ${tapPx}px (${m.smallestTap.width}x${m.smallestTap.height}) on ${m.smallestTap.selector} "${m.smallestTap.text}", minimum ${MIN_TAP_PX}px`);
        }
        if (fontPx !== null && fontPx < MIN_FONT_PX) {
          record.problems.push(`body text ${fontPx}px on ${m.smallestFont.selector} "${m.smallestFont.text}", minimum ${MIN_FONT_PX}px`);
        }
        rows.push({ ...record, overflow: m.overflow, errors: consoleErrors.length, tap: tapPx, font: fontPx });
      } catch (err) {
        console.log(`  ${vp.label.padEnd(9)} DID NOT LOAD: ${err.message.split('\n')[0]}`);
        record.problems.push('page did not load: ' + err.message.split('\n')[0]);
        rows.push({ ...record, overflow: null, errors: consoleErrors.length, tap: null, font: null });
      } finally {
        await page.close();
      }

      if (record.problems.length) failures.push(record);
    }
    console.log('');
  }
} finally {
  await browser.close();
  if (served) served.server.close();
}

/* A machine-readable copy beside the screenshots, so the next round is a diff. */
await writeFile(path.join(shotDir, 'results.json'), JSON.stringify({ date, pages: pages.map((p) => p.route), rows }, null, 2));

if (failures.length) {
  console.log('FAILURES, grouped by page');
  const byPage = new Map();
  for (const f of failures) {
    if (!byPage.has(f.route)) byPage.set(f.route, []);
    byPage.get(f.route).push(f);
  }
  for (const [route, list] of byPage) {
    console.log(`\n  ${route}`);
    for (const f of list) for (const p of f.problems) console.log(`    ${f.viewport}: ${p}`);
  }
  console.log(`\n${failures.length} of ${rows.length} page-viewport runs failed. ${shots} screenshots in ${shotDir}`);
  console.log('Open the folder and look at every shot. The numbers cannot see a headline sitting behind a logo.');
  process.exit(1);
}

console.log(`All ${rows.length} page-viewport runs passed. ${shots} screenshots in ${shotDir}`);
console.log('Green is not proof. Open the folder and look, starting with 375x667 and 360x640.');
process.exit(0);
