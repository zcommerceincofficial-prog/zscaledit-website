#!/usr/bin/env node
/**
 * export-transform.mjs  -  turn a raw Claude Design export into a deployable site.
 *
 * WHAT IT DOES  Reads site/ (the untouched export) and writes dist/ (what the host
 *   serves). Renames .dc.html pages to .html, rewrites internal links to extensionless
 *   paths (/services), injects the shared head from scripts/head.html filled from
 *   site-meta.json, moves favicon and meta tags inside <head>, copies assets and every
 *   keep-list path, then writes robots.txt, _headers, 404.html and sitemap.xml.
 * HOW TO RUN   node scripts/export-transform.mjs
 *              node scripts/export-transform.mjs --root . --src site --dist dist
 *              node scripts/export-transform.mjs --help
 * WHAT IT NEEDS  Node 18 or newer. site-meta.json at the project root (copy
 *   site-meta.example.json and fill it in), scripts/head.html, scripts/keep-list.txt.
 *   No packages, nothing to install.
 * WHAT IT PRINTS  One line per page written, the noindex state, counts for assets and
 *   keep-list files, then every warning: pages with no entry in site-meta.json,
 *   placeholders it could not fill, junk found above the doctype.
 * IDEMPOTENT   dist/ is wiped and rebuilt each run, so two runs on the same input
 *   produce byte-identical output. Never edit anything inside dist/ by hand.
 * EXIT CODES   0 built clean. 1 something is missing or broken (a page named in
 *   site-meta.json, a keep-list path, site-meta.json itself, head.html). 2 built, but
 *   .jsx files need a compile step first, so the pages that use them will be blank.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KIT_ROOT = path.resolve(HERE, '..');

const USAGE = `
export-transform.mjs  -  build dist/ from a Claude Design export in site/

  node scripts/export-transform.mjs [options]

  --root <dir>   project root (holds site/, dist/, site-meta.json). Default: the
                 folder above this script.
  --src <dir>    the raw export. Default: <root>/site
  --dist <dir>   where the built site goes. Default: <root>/dist
  --meta <file>  the config. Default: <root>/site-meta.json
  --head <file>  the head block. Default: <root>/scripts/head.html, then this kit's copy
  --keep <file>  the keep-list. Default: <root>/scripts/keep-list.txt, then this kit's copy
  --help         this text
`;

// ---------------------------------------------------------------- small helpers

const warnings = [];
function warn(msg) { warnings.push(msg); }

function die(msg, code = 1) {
  console.error(`\nERROR  ${msg}\n`);
  process.exit(code);
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function walk(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      walk(full, base, out);
    } else if (entry.isFile()) {
      out.push(toPosix(path.relative(base, full)));
    }
  }
  return out;
}

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function copyDir(from, to) {
  let n = 0;
  for (const rel of walk(from)) {
    copyFile(path.join(from, rel), path.join(to, rel));
    n++;
  }
  return n;
}

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------- arguments

function parseArgs(argv) {
  const o = { root: null, src: null, dist: null, meta: null, head: null, keep: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const take = () => {
      const v = argv[++i];
      if (v === undefined) die(`${a} needs a value after it.`);
      return v;
    };
    if (a === '--help' || a === '-h') { console.log(USAGE); process.exit(0); }
    else if (a === '--root') o.root = take();
    else if (a === '--src') o.src = take();
    else if (a === '--dist' || a === '--out') o.dist = take();
    else if (a === '--meta') o.meta = take();
    else if (a === '--head') o.head = take();
    else if (a === '--keep') o.keep = take();
    else die(`I do not know the option "${a}". Run with --help to see the list.`);
  }
  return o;
}

const args = parseArgs(process.argv.slice(2));
const ROOT = path.resolve(args.root || KIT_ROOT);
const SRC = path.resolve(ROOT, args.src || 'site');
const DIST = path.resolve(ROOT, args.dist || 'dist');
const META_FILE = path.resolve(ROOT, args.meta || 'site-meta.json');
const HEAD_FILE = args.head
  ? path.resolve(ROOT, args.head)
  : (fs.existsSync(path.join(ROOT, 'scripts', 'head.html'))
    ? path.join(ROOT, 'scripts', 'head.html')
    : path.join(HERE, 'head.html'));
const KEEP_FILE = args.keep
  ? path.resolve(ROOT, args.keep)
  : (fs.existsSync(path.join(ROOT, 'scripts', 'keep-list.txt'))
    ? path.join(ROOT, 'scripts', 'keep-list.txt')
    : path.join(HERE, 'keep-list.txt'));

// ---------------------------------------------------------------- preflight

if (!fs.existsSync(SRC) || !fs.statSync(SRC).isDirectory()) {
  die(`No export found at ${SRC}\n       Unzip the Claude Design export into that folder, then run this again.`);
}
if (!fs.existsSync(META_FILE)) {
  die(`No config at ${META_FILE}\n       Copy site-meta.example.json to site-meta.json, fill in the site URL and one\n       entry per page, then run this again.`);
}
if (!fs.existsSync(HEAD_FILE)) {
  die(`No head block at ${HEAD_FILE}\n       Copy scripts/head.html from the site kit.`);
}
// Refuse to wipe anything that is not clearly a build folder.
if (DIST === ROOT || DIST === SRC || !DIST.startsWith(ROOT + path.sep)) {
  die(`The output folder ${DIST} is not inside the project root, or it IS the project\n       root or the export. I will not delete that. Pass --dist with a folder of its own.`);
}

let meta;
try {
  meta = JSON.parse(readText(META_FILE));
} catch (err) {
  die(`${META_FILE} is not valid JSON.\n       ${err.message}\n       A stray comma at the end of a list is the usual cause.`);
}

const site = meta.site || {};
const ORIGIN = String(site.url || '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(ORIGIN)) {
  die(`site.url in ${path.basename(META_FILE)} must be a full address starting with https://\n       Right now it is: ${JSON.stringify(site.url)}`);
}
const APPROVED = meta.approved === true;
const TRAILING_SLASH = site.trailingSlash === true;
const PAGE_META = meta.pages || {};

// ---------------------------------------------------------------- keep-list

function readKeepList(file) {
  if (!fs.existsSync(file)) return [];
  return readText(file)
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
}
const keepList = readKeepList(KEEP_FILE);

// ---------------------------------------------------------------- page ids

/** "contact.dc.html" -> "contact",  "blog/post.html" -> "blog/post" */
function pageIdFromFile(rel) {
  return rel.replace(/\.dc\.html$/i, '').replace(/\.html$/i, '');
}

/** "index" -> "/",  "contact" -> "/contact",  "blog/index" -> "/blog" */
function urlPathFromId(id) {
  let p = id === 'index' ? '/' : '/' + id.replace(/\/index$/i, '');
  if (p !== '/' && TRAILING_SLASH) p += '/';
  return p;
}

function canonicalFor(id) {
  return ORIGIN + urlPathFromId(id);
}

// ---------------------------------------------------------------- link rewriting

const SKIP_LINK = /^(https?:|\/\/|mailto:|tel:|sms:|javascript:|data:|#)/i;

/** contact.dc.html -> /contact ; ./index.html#top -> /#top ; keeps everything else */
function rewriteLinkValue(value, pageDir) {
  const raw = value.trim();
  if (!raw || SKIP_LINK.test(raw)) return value;

  const m = raw.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  if (!m) return value;
  let [, filePart, query = '', hash = ''] = m;
  if (!/\.(dc\.)?html$/i.test(filePart)) return value;

  // resolve against the page's own folder so subfolder pages link correctly
  const abs = filePart.startsWith('/')
    ? filePart
    : '/' + path.posix.normalize(path.posix.join(pageDir, filePart)).replace(/^\/+/, '');

  const id = pageIdFromFile(abs.replace(/^\//, ''));
  return urlPathFromId(id) + query + hash;
}

function rewriteInternalLinks(html, pageDir) {
  return html.replace(
    /\b(href|action)\s*=\s*("|')([^"']*)\2/gi,
    (whole, attr, q, val) => `${attr}=${q}${rewriteLinkValue(val, pageDir)}${q}`
  );
}

// ---------------------------------------------------------------- head surgery

// tags the injected block owns: strip the export's versions so nothing doubles up
const OWNED_TAGS = [
  /<title\b[^>]*>[\s\S]*?<\/title>\s*/gi,
  /<meta\b[^>]*\bcharset\b[^>]*>\s*/gi,
  /<meta\b[^>]*name\s*=\s*("|')(viewport|description|robots|theme-color)\1[^>]*>\s*/gi,
  /<meta\b[^>]*property\s*=\s*("|')og:[^"']*\1[^>]*>\s*/gi,
  /<meta\b[^>]*name\s*=\s*("|')twitter:[^"']*\1[^>]*>\s*/gi,
  /<link\b[^>]*rel\s*=\s*("|')canonical\1[^>]*>\s*/gi
];

const FAVICON_TAG = /<link\b[^>]*rel\s*=\s*("|')[^"']*(icon|manifest)[^"']*\1[^>]*>\s*/gi;

function buildHeadBlock(headTemplate, values) {
  // kit:notes blocks are instructions for whoever edits head.html. They never ship.
  const template = headTemplate.replace(/\r\n/g, '\n').replace(/<!--\s*kit:notes[\s\S]*?-->\n?/g, '');
  const lines = template.split('\n');
  const kept = [];
  for (const line of lines) {
    const holders = [...line.matchAll(/\{\{([a-z0-9_]+)\}\}/gi)].map(m => m[1]);
    if (holders.length === 0) { kept.push(line); continue; }
    const missing = holders.filter(h => values[h] === undefined || values[h] === null || values[h] === '');
    if (missing.length) {
      // an empty tracking slot on a preview build is the correct state, not a gap
      for (const h of missing) if (h !== 'tracking') values.__missing.add(h);
      continue; // drop the whole line rather than ship "{{og_image}}" to a customer
    }
    kept.push(line.replace(/\{\{([a-z0-9_]+)\}\}/gi, (_, h) => values[h]));
  }
  return kept.join('\n').replace(/\n{3,}/g, '\n\n');
}

function injectHead(html, headBlock, pageLabel) {
  let doc = html;

  // 1. anything above the doctype throws the browser into quirks mode. Rescue the
  //    tags that belong in the head, drop the rest, say so.
  const dtIndex = doc.search(/<!doctype\s+html/i);
  if (dtIndex > 0) {
    const preamble = doc.slice(0, dtIndex);
    doc = doc.slice(dtIndex);
    const rescued = preamble.match(/<(link|meta)\b[^>]*>/gi) || [];
    if (rescued.length) doc = doc.replace(/<head\b[^>]*>/i, m => m + '\n' + rescued.join('\n'));
    const leftover = preamble.replace(/<(link|meta)\b[^>]*>/gi, '').trim();
    if (leftover) warn(`${pageLabel}: dropped ${leftover.length} characters that sat above <!doctype html> (quirks mode).`);
  } else if (dtIndex === -1) {
    doc = '<!DOCTYPE html>\n' + doc;
    warn(`${pageLabel}: no <!doctype html>, added one.`);
  }

  // 2. make sure there is a head to inject into
  if (!/<head\b[^>]*>/i.test(doc)) {
    if (/<html\b[^>]*>/i.test(doc)) doc = doc.replace(/<html\b[^>]*>/i, m => m + '\n<head>\n</head>');
    else doc = doc.replace(/<!DOCTYPE html>/i, m => m + '\n<html lang="en">\n<head>\n</head>');
    warn(`${pageLabel}: no <head>, added one.`);
  }

  const headStart = doc.search(/<head\b[^>]*>/i);
  const headOpenEnd = headStart + doc.slice(headStart).match(/<head\b[^>]*>/i)[0].length;
  const headEnd = doc.search(/<\/head>/i);
  let headInner = doc.slice(headOpenEnd, headEnd);
  const body = doc.slice(headEnd);
  const top = doc.slice(0, headOpenEnd);

  // 3. pull favicons out of wherever they are, so they end up inside the head, once
  const favicons = [];
  const takeFavicons = (s) => s.replace(FAVICON_TAG, (m) => { favicons.push(m.trim()); return ''; });
  headInner = takeFavicons(headInner);
  let newBody = takeFavicons(body);

  // 4. drop the tags the injected block owns, plus any previous injected block
  headInner = headInner.replace(/<!--\s*kit:head:start[\s\S]*?kit:head:end\s*-->\s*/gi, '');
  for (const re of OWNED_TAGS) headInner = headInner.replace(re, '');

  const uniqueFavicons = [...new Set(favicons)];
  const injected = [headBlock, ...uniqueFavicons].join('\n');

  return `${top}\n${injected}\n${headInner.trim()}\n${newBody}`;
}

// ---------------------------------------------------------------- read the export

const allFiles = walk(SRC);
const pageFiles = allFiles.filter(f => /\.(dc\.)?html$/i.test(f));
const jsxFiles = allFiles.filter(f => /\.(jsx|tsx)$/i.test(f));
const otherFiles = allFiles.filter(f => !/\.(dc\.)?html$/i.test(f) && !/\.(jsx|tsx)$/i.test(f));

if (pageFiles.length === 0) {
  die(`No .html or .dc.html pages under ${SRC}\n       Unzip the export so the page files sit directly inside that folder.`);
}

// which export shape is this? printed so the reader can say it out loud
const shape = jsxFiles.length
  ? 'React project (src/*.jsx present, needs a compile step)'
  : (pageFiles.some(f => /\.dc\.html$/i.test(f))
    ? 'runtime variant (.dc.html pages)'
    : 'plain static HTML');

// every page named in site-meta.json must exist, or the build stops
const foundIds = new Set(pageFiles.map(pageIdFromFile));
const missingPages = Object.keys(PAGE_META).filter(id => !foundIds.has(id));
if (missingPages.length) {
  die(`site-meta.json names pages that are not in the export:\n       ${missingPages.join(', ')}\n       Either the page was renamed in Claude Design or the export is incomplete.`);
}

// ---------------------------------------------------------------- build

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const headTemplate = readText(HEAD_FILE);
const missingPlaceholders = new Set();
const written = [];

for (const rel of pageFiles) {
  const id = pageIdFromFile(rel);
  const outRel = id + '.html';
  const pageDir = path.posix.dirname('/' + rel) === '/' ? '/' : path.posix.dirname('/' + rel);
  const pm = PAGE_META[id] || {};
  if (!PAGE_META[id]) warn(`${rel}: no entry in site-meta.json, so it ships with a fallback title and no description.`);

  const source = readText(path.join(SRC, rel));
  const sourceTitle = (source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1];

  const ogImage = pm.ogImage || site.defaultOgImage || '';
  const values = {
    title: htmlEscape(pm.title || (sourceTitle && sourceTitle.trim()) || (id + (site.titleSuffix || ''))),
    description: pm.description ? htmlEscape(pm.description) : '',
    canonical: canonicalFor(id),
    og_image: ogImage ? (/^https?:\/\//.test(ogImage) ? ogImage : ORIGIN + (ogImage.startsWith('/') ? '' : '/') + ogImage) : '',
    og_image_alt: pm.ogImageAlt ? htmlEscape(pm.ogImageAlt) : '',
    site_name: site.name ? htmlEscape(site.name) : '',
    theme_color: site.themeColor || '',
    robots: APPROVED ? 'index, follow' : 'noindex, nofollow',
    tracking: APPROVED ? (pm.tracking || site.tracking || '') : '',
    __missing: missingPlaceholders
  };

  let html = rewriteInternalLinks(source, pageDir);
  html = injectHead(html, buildHeadBlock(headTemplate, values), rel);

  const outFile = path.join(DIST, outRel);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html, 'utf8');

  // the charset has to land in the first 1024 bytes or the browser guesses
  const charsetAt = Buffer.from(html, 'utf8').indexOf(Buffer.from('charset', 'utf8'));
  if (charsetAt < 0 || charsetAt > 1024) warn(`${outRel}: <meta charset> is not in the first 1024 bytes.`);

  written.push({ rel: outRel, id, url: urlPathFromId(id), mtime: fs.statSync(path.join(SRC, rel)).mtime });
}

// assets, styles, support scripts: everything that is not a page and not JSX
let assetCount = 0;
for (const rel of otherFiles) {
  copyFile(path.join(SRC, rel), path.join(DIST, rel));
  assetCount++;
}

// keep-list: hand-wired files that no export knows about
let keptCount = 0;
const keepMissing = [];
for (const entry of keepList) {
  const clean = entry.replace(/\/+$/, '');
  const fromRoot = path.resolve(ROOT, clean);
  const fromSrc = path.resolve(SRC, clean);
  let from = null, destRel = null;
  if (fs.existsSync(fromRoot)) { from = fromRoot; destRel = clean; }
  else if (fs.existsSync(fromSrc)) { from = fromSrc; destRel = clean; }
  if (!from) { keepMissing.push(entry); continue; }
  const to = path.join(DIST, destRel);
  if (fs.statSync(from).isDirectory()) keptCount += copyDir(from, to);
  else { copyFile(from, to); keptCount++; }
}

// ---------------------------------------------------------------- root files

// robots.txt: nothing is public until the owner has approved the copy
const robots = APPROVED
  ? `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`
  : `# Preview build. The owner has not approved this site yet.\n# site-meta.json says approved: false, so nothing here is offered to crawlers.\nUser-agent: *\nDisallow: /\n`;
fs.writeFileSync(path.join(DIST, 'robots.txt'), robots, 'utf8');

// _headers: Cloudflare Pages format. Vercel wants the same rules inside vercel.json.
const noindexHeader = APPROVED ? '' : '  X-Robots-Tag: noindex, nofollow\n';
const headers = `# Written by scripts/export-transform.mjs. Edit the script, not this file.
# Cloudflare Pages reads this file as-is. On Vercel, copy these rules into
# vercel.json under "headers".

/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
${noindexHeader}
# HTML: short cache, so a new content hash reaches everyone within minutes
/*.html
  Cache-Control: public, max-age=300

# stable filenames, cache-busted with ?v=<hash> by scripts/cache-stamp.mjs
/src/*
  Cache-Control: public, max-age=0, must-revalidate
/styles/*
  Cache-Control: public, max-age=0, must-revalidate

# immutable: a changed image gets a NEW FILENAME, never a re-upload
/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;
fs.writeFileSync(path.join(DIST, '_headers'), headers, 'utf8');

// 404.html, unless the export shipped one
if (!written.some(w => w.id === '404')) {
  const notFound = `<!DOCTYPE html>
<html lang="${site.language || 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found${site.titleSuffix || ''}</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="/styles/site.css">
</head>
<body>
<main style="max-width:40rem;margin:12vh auto;padding:0 1.5rem;font-family:system-ui,sans-serif">
<h1>That page is not here</h1>
<p>The address may have changed. Start from the home page.</p>
<p><a href="/">Go to the home page</a></p>
</main>
</body>
</html>
`;
  fs.writeFileSync(path.join(DIST, '404.html'), notFound, 'utf8');
}

// sitemap.xml: real dates read off the source files. Never invented, never backdated.
const sitemapPages = written.filter(w => w.id !== '404');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages.map(w => `  <url>
    <loc>${ORIGIN}${w.url}</loc>
    <lastmod>${new Date(w.mtime).toISOString()}</lastmod>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8');

// ---------------------------------------------------------------- report

const line = (s = '') => console.log(s);
line();
line(`Built ${path.relative(process.cwd(), DIST) || DIST} from ${path.relative(process.cwd(), SRC) || SRC}`);
line(`Export shape: ${shape}`);
line();
line('PAGES');
for (const w of written) line(`  ${w.rel.padEnd(28)} -> ${w.url}`);
line();
line(`Assets copied      ${assetCount}`);
line(`Keep-list files    ${keptCount}${keepList.length ? '' : '  (keep-list.txt has no active lines yet)'}`);
line(`Approved           ${APPROVED}`);
line(`Robots             ${APPROVED ? 'Allow: / plus a Sitemap line' : 'Disallow: / and X-Robots-Tag noindex on every response'}`);
line(`Sitemap            ${sitemapPages.length} URLs, dates read from file times`);

if (keepMissing.length) {
  console.error(`\nERROR  keep-list paths that do not exist:`);
  for (const k of keepMissing) console.error(`         ${k}`);
  console.error(`       Fix the path in scripts/keep-list.txt or put the file back. dist/ is\n       incomplete: do not deploy it.\n`);
  process.exit(1);
}

if (missingPlaceholders.size) {
  line();
  line('COULD NOT FILL (those lines were left off the page, not shipped empty):');
  for (const h of missingPlaceholders) line(`  {{${h}}}`);
}

if (warnings.length) {
  line();
  line('WARNINGS');
  for (const w of warnings) line(`  ${w}`);
}

if (jsxFiles.length) {
  line();
  line('JSX FOUND, A BUILD STEP IS NEEDED');
  line(`  ${jsxFiles.length} file(s) under src/ are JSX: JavaScript with HTML-looking tags in it.`);
  line('  No browser runs JSX. This script does not compile it, on purpose.');
  line('  The pages that mount those files will render empty until you add a build step.');
  line('  Ask Claude Code, in the project folder:');
  line('    "Add a build step that compiles src/*.jsx to plain JS into dist/src/ and');
  line('     repoints the page script tags at the compiled files. Use esbuild. No');
  line('     in-browser compiler. Then re-run scripts/export-transform.mjs."');
  line();
  process.exit(2);
}

line();
process.exit(0);
