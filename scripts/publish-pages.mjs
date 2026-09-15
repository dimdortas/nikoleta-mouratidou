#!/usr/bin/env node
/**
 * Δημοσίευση του dist/ στο branch `gh-pages`, μέσω του GitHub API.
 *
 * Γιατί όχι git: σε αυτό το μηχάνημα το git δεν λειτουργεί (δεν έχει γίνει
 * αποδοχή της άδειας Xcode). Το script μιλά απευθείας στο GitHub Git Data API
 * με το `gh`, οπότε δεν χρειάζεται καθόλου τοπικό git.
 *
 *   npm run deploy:pages
 *
 * Προαπαιτούμενα: `gh auth login` (scope: repo).
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const REPO = process.env.REPO || 'dimdortas/nikoleta-mouratidou';
const BRANCH = process.env.BRANCH || 'gh-pages';
const DIR = process.env.DIR || 'dist';
const MESSAGE = process.env.MESSAGE || `Δημοσίευση ${new Date().toISOString()}`;

/* ------------------------------------------------------------------ */

function gh(args, input) {
  return execFileSync('gh', args, {
    input,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

function api(path, { method = 'GET', body } = {}) {
  const args = ['api', '-X', method, path];
  if (body !== undefined) args.push('--input', '-');
  const out = gh(args, body === undefined ? undefined : JSON.stringify(body));
  return out.trim() ? JSON.parse(out) : null;
}

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

/* ------------------------------------------------------------------ */

const files = walk(DIR);
if (files.length === 0) {
  console.error(`Κανένα αρχείο στο ${DIR}/ — τρέξτε πρώτα το build.`);
  process.exit(1);
}

console.log(`→ ${files.length} αρχεία από ${DIR}/ προς ${REPO}#${BRANCH}`);

/* 1. Ανεβάζουμε κάθε αρχείο ως blob (base64 — δουλεύει και για εικόνες) */
const tree = files.map((file) => {
  const sha = api(`repos/${REPO}/git/blobs`, {
    method: 'POST',
    body: { content: readFileSync(file).toString('base64'), encoding: 'base64' },
  }).sha;

  return {
    path: relative(DIR, file).split(sep).join('/'),
    mode: '100644',
    type: 'blob',
    sha,
  };
});

/* 2. Δέντρο + commit */
const treeSha = api(`repos/${REPO}/git/trees`, { method: 'POST', body: { tree } }).sha;

let parent = null;
try {
  parent = api(`repos/${REPO}/git/ref/heads/${BRANCH}`).object.sha;
} catch {
  /* το branch δεν υπάρχει ακόμη — πρώτο commit */
}

const commitSha = api(`repos/${REPO}/git/commits`, {
  method: 'POST',
  body: { message: MESSAGE, tree: treeSha, parents: parent ? [parent] : [] },
}).sha;

/* 3. Μετακίνηση του branch */
if (parent) {
  api(`repos/${REPO}/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: { sha: commitSha, force: true },
  });
} else {
  api(`repos/${REPO}/git/refs`, {
    method: 'POST',
    body: { ref: `refs/heads/${BRANCH}`, sha: commitSha },
  });
}

console.log(`✓ ${BRANCH} → ${commitSha.slice(0, 7)}`);
