#!/usr/bin/env node
/**
 * cache-stamp.mjs  -  give every changed script and stylesheet a URL nobody has cached.
 *
 * WHAT IT DOES  Walks every .html file in dist/, finds each local <script src> and
 *   stylesheet <link href>, hashes the file it points at, and rewrites the reference to
 *   file.css?v=<first 8 characters of the sha1>. A file whose contents changed gets a URL
 *   no browser and no edge server has ever seen, so the new version reaches everyone. A
 *   file that did not change keeps its URL and stays fast.
 * HOW TO RUN   node scripts/cache-stamp.mjs
 *              node scripts/cache-stamp.mjs dist --dry-run
 *              node scripts/cache-stamp.mjs --help
 * WHAT IT NEEDS  Node 18 or newer, and a built dist/ folder. Run it AFTER
 *   scripts/export-transform.mjs and before you commit. No packages to install.
 * WHAT IT PRINTS  One line per reference it changed (old token -> new token), then
 *   totals. Running it twice with no content change prints "no changes" and touches
 *   nothing, so it is safe inside a build.
 * WHAT IT WILL NOT DO  Images and fonts are not stamped. They sit under a one-year
 *   immutable header, where the only thing that reaches a warm cache is a NEW FILENAME.
 * EXIT CODES   0 done. 1 a referenced file does not exist in dist/, or dist/ is missing.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KIT_ROOT = path.resolve(HERE, '..');

const USAGE = `
cache-stamp.mjs  -  content-hash every script and stylesheet reference in dist/

  node scripts/cache-stamp.mjs [dist folder] [options]

  --dist <dir>   the built site. Default: <folder above this script>/dist
  --dry-run      show what would change, write nothing
  --help         this text
`;

// ---------------------------------------------------------------- arguments

let distArg = null;
let dryRun = false;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--help' || a === '-h') { console.log(USAGE); process.exit(0); }
  else if (a === '--dry-run') dryRun = true;
  else if (a === '--dist' || a === '--out') {
    distArg = argv[++i];
    if (distArg === undefined) { console.error(`\nERROR  ${a} needs a folder after it.\n`); process.exit(1); }
  } else if (!a.startsWith('-') && distArg === null) distArg = a;
  else { console.error(`\nERROR  I do not know the option "${a}". Run with --help.\n`); process.exit(1); }
}

const DIST = path.resolve(distArg || path.join(KIT_ROOT, 'dist'));

if (!fs.existsSync(DIST) || !fs.statSync(DIST).isDirectory()) {
  console.error(`\nERROR  No built site at ${DIST}\n       Run node scripts/export-transform.mjs first, or pass the folder:\n       node scripts/cache-stamp.mjs path/to/dist\n`);
  process.exit(1);
}

// ---------------------------------------------------------------- helpers

function walk(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, out);
    else if (entry.isFile()) out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

const hashCache = new Map();
function hashOf(absFile) {
  if (hashCache.has(absFile)) return hashCache.get(absFile);
  const h = crypto.createHash('sha1').update(fs.readFileSync(absFile)).digest('hex').slice(0, 8);
  hashCache.set(absFile, h);
  return h;
}

const EXTERNAL = /^(https?:|\/\/|data:|blob:|mailto:|tel:|#)/i;

/** turn a reference on a page into the file on disk it points at, or null */
function resolveRef(ref, pageRel) {
  const filePart = ref.split(/[?#]/)[0];
  if (!filePart) return null;
  const rel = filePart.startsWith('/')
    ? filePart.slice(1)
    : path.posix.normalize(path.posix.join(path.posix.dirname(pageRel), filePart)).replace(/^\/+/, '');
  return { rel, abs: path.join(DIST, rel.split('/').join(path.sep)) };
}

/** keep any other query parameters, replace only our own ?v= token */
function stamp(ref, hash) {
  const [beforeHash, hashPart] = ref.split('#');
  const [file, query = ''] = beforeHash.split('?');
  const params = query.split('&').filter(p => p && !/^v=/.test(p));
  params.push('v=' + hash);
  return file + '?' + params.join('&') + (hashPart ? '#' + hashPart : '');
}

// ---------------------------------------------------------------- do the work

// <script ... src="...">  and  <link ... rel="stylesheet" ... href="...">
const SCRIPT_TAG = /<script\b[^>]*\bsrc\s*=\s*("|')([^"']+)\1[^>]*>/gi;
const STYLE_TAG = /<link\b[^>]*>/gi;

const pages = walk(DIST).filter(f => /\.html$/i.test(f));
if (pages.length === 0) {
  console.error(`\nERROR  No .html files under ${DIST}\n       Nothing to stamp. Did the build write anywhere else?\n`);
  process.exit(1);
}

const changes = [];
const missing = [];
let refsSeen = 0;

for (const pageRel of pages) {
  const abs = path.join(DIST, pageRel.split('/').join(path.sep));
  const before = fs.readFileSync(abs, 'utf8');
  let after = before;

  const rewriteAttr = (tag, attr) => tag.replace(
    new RegExp(`\\b${attr}\\s*=\\s*("|')([^"']+)\\1`, 'i'),
    (whole, q, ref) => {
      if (EXTERNAL.test(ref.trim())) return whole;
      refsSeen++;
      const target = resolveRef(ref, pageRel);
      if (!target || !fs.existsSync(target.abs)) {
        missing.push({ page: pageRel, ref });
        return whole;
      }
      const next = stamp(ref, hashOf(target.abs));
      if (next !== ref) changes.push({ page: pageRel, from: ref, to: next });
      return `${attr}=${q}${next}${q}`;
    }
  );

  after = after.replace(SCRIPT_TAG, tag => rewriteAttr(tag, 'src'));
  after = after.replace(STYLE_TAG, tag => {
    // stylesheets only: a favicon or a preconnect must keep its plain URL
    if (!/\brel\s*=\s*("|')[^"']*stylesheet[^"']*\1/i.test(tag)) return tag;
    return rewriteAttr(tag, 'href');
  });

  if (after !== before && !dryRun) fs.writeFileSync(abs, after, 'utf8');
}

// ---------------------------------------------------------------- report

console.log();
console.log(`cache-stamp  ${path.relative(process.cwd(), DIST) || DIST}`);
console.log(`  pages read        ${pages.length}`);
console.log(`  local refs found  ${refsSeen}`);

if (missing.length) {
  console.error(`\nERROR  ${missing.length} reference(s) point at a file that is not in the build:`);
  for (const m of missing) console.error(`         ${m.page}  ->  ${m.ref}`);
  console.error(`       Every one of those is a 404 on the live site. Fix the path in the source,`);
  console.error(`       or add the file to scripts/keep-list.txt, then re-run the transform.\n`);
  process.exit(1);
}

if (changes.length === 0) {
  console.log(`  changed           0  (nothing to do, already stamped)`);
  console.log();
  process.exit(0);
}

console.log(`  changed           ${changes.length}${dryRun ? '  (dry run, nothing written)' : ''}`);
console.log();
for (const c of changes) console.log(`  ${c.page}\n      ${c.from}\n   -> ${c.to}`);
console.log();
console.log('  Commit these pages in the SAME commit as the file whose contents changed.');
console.log('  A code change without a token change is a shipped bug.');
console.log();
process.exit(0);
