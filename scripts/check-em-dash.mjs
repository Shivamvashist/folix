// Fails when an em-dash appears in any tracked text file.
// Rule: docs/rules/README.md, working rule 2. Run with `pnpm check:dashes`.
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const EM_DASH = String.fromCharCode(0x2014);
const ROOT = process.cwd();
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.turbo',
  'dist',
  'coverage',
  'plan',
  'migrations',
]);
// Files written by tools, which we do not control.
const SKIP_FILES = new Set([join('apps', 'web', 'AGENTS.md')]);
const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.css',
  '.yml',
  '.yaml',
  '.html',
  '.sql',
]);

function collectFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) files.push(...collectFiles(join(dir, entry.name)));
    } else if (
      TEXT_EXTENSIONS.has(extname(entry.name)) &&
      entry.name !== 'pnpm-lock.yaml' &&
      !SKIP_FILES.has(relative(ROOT, join(dir, entry.name)))
    ) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

const hits = [];
for (const file of collectFiles(ROOT)) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (line.includes(EM_DASH)) hits.push(`${relative(ROOT, file)}:${index + 1}`);
  });
}

if (hits.length > 0) {
  console.error(`Em-dash found in ${hits.length} place(s). Use a comma, colon, full stop or brackets:`);
  for (const hit of hits) console.error(`  ${hit}`);
  process.exit(1);
}
console.log('No em-dashes found.');
