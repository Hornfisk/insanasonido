/**
 * Post-build script: scans dist/**\/*.html, extracts all inline <script>
 * content (including type="application/ld+json"), computes SHA-256 hashes,
 * and writes dist/_headers with the full CSP including those hashes.
 *
 * Netlify reads _headers from the publish directory after the build, so
 * hashes computed here are applied to the live deployment.
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

// ── Collect all HTML files ────────────────────────────────────────────────────
function htmlFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...htmlFiles(full));
    else if (entry.endsWith('.html')) results.push(full);
  }
  return results;
}

// ── Extract inline <script> content (all types) ───────────────────────────────
const SCRIPT_RE = /<script(?:\s[^>]*)?>([^]*?)<\/script>/gi;

function extractInlineScripts(html) {
  const scripts = [];
  for (const match of html.matchAll(SCRIPT_RE)) {
    const attrs = match[0].slice(0, match[0].indexOf('>'));
    // Skip external scripts (have a src= attribute)
    if (/\bsrc\s*=/.test(attrs)) continue;
    const content = match[1];
    if (content.trim()) scripts.push(content);
  }
  return scripts;
}

// ── Compute SHA-256 hash in base64 ───────────────────────────────────────────
function sha256b64(str) {
  return createHash('sha256').update(str).digest('base64');
}

// ── Main ─────────────────────────────────────────────────────────────────────
const hashes = new Set();

for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  for (const script of extractInlineScripts(html)) {
    hashes.add(`'sha256-${sha256b64(script)}'`);
  }
}

console.log(`Found ${hashes.size} unique inline script hash(es).`);

const hashList = [...hashes].join(' ');

const CSP_MAIN = [
  `default-src 'none'`,
  `script-src 'self' ${hashList} https://www.googletagmanager.com https://connect.facebook.net`,
  `style-src 'self' 'unsafe-inline'`,
  `font-src 'self'`,
  `img-src 'self' data: blob: https://www.googletagmanager.com https://www.facebook.com`,
  `connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.facebook.com`,
  `frame-ancestors 'none'`,
].join('; ');

const CSP_420 = [
  `default-src 'self'`,
  `script-src 'self' https://unpkg.com https://identity.netlify.com 'unsafe-inline' 'unsafe-eval'`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src https://fonts.gstatic.com`,
  `img-src 'self' data: blob: https:`,
  `connect-src 'self' https://api.github.com https://identity.netlify.com https://*.netlify.com`,
  `frame-ancestors 'none'`,
].join('; ');

const headers = `/*
  Content-Security-Policy: ${CSP_MAIN}

/420/*
  Content-Security-Policy: ${CSP_420}
`;

writeFileSync(join(DIST, '_headers'), headers, 'utf8');
console.log('dist/_headers written.');
