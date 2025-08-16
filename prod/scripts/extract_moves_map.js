// scripts/extract_moves_map.js
'use strict';
const fs = require('fs');
const path = require('path');

const input = process.argv[2] || 'moves.sh';
if (!fs.existsSync(input)) {
  console.error(`Input file not found: ${input}`);
  process.exit(1);
}

const root = process.cwd().replace(/\\/g, '/') + '/';
const text = fs.readFileSync(input, 'utf8');

const map = {};
let matched = 0;

for (const raw of text.split(/\r?\n/)) {
  const line = raw.trim();
  if (!line || line.includes('migrate_inplace.js')) continue;

  // Match: git mv [-k] "<from>" "<to>"  OR  git mv [-k] '<from>' '<to>'
  // Fallback: mv "<from>" "<to>"  (possibly after &&)
  let m =
    line.match(/git\s+mv(?:\s+-k)?\s+(['"])([^'"]+)\1\s+(['"])([^'"]+)\3/) ||
    line.match(/(?:^|&&\s*)mv\s+(['"])([^'"]+)\1\s+(['"])([^'"]+)\3/);

  if (!m) continue;

  let from = m[2].replace(/\\/g, '/');
  let to   = m[4].replace(/\\/g, '/');

  if (from.startsWith(root)) from = from.slice(root.length);
  if (to.startsWith(root))   to   = to.slice(root.length);
  if (from.startsWith('./')) from = from.slice(2);
  if (to.startsWith('./'))   to   = to.slice(2);

  map[from] = to;
  matched++;
}

if (!matched) {
  console.error('No moves matched. Quick checks:\n' +
    '  1) grep -n "git mv" moves.sh | head\n' +
    '  2) head -n 3 moves.sh\n' +
    '  3) Ensure paths are quoted (single or double).');
  process.exit(2);
}

fs.writeFileSync('moves_map.json', JSON.stringify(map, null, 2));
console.log(`Wrote moves_map.json with ${matched} entries`);
