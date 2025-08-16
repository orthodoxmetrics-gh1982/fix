#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';

/**
 * migrate_inplace.js
 * Reorganize files IN-PLACE within the same repo.
 *
 * - Keeps top-level paths the same (e.g., prod/server stays prod/server).
 * - Supports explicit move map (--moves=path/to/moves_map.json).
 * - Can delete using a JSON list (--remove=files_to_remove.json).
 * - Optional helpers:
 *     --dev-examples        Move *Code.tsx to front-end/src/dev/examples/**
 *     --move-demos          Move Demo/Preview/Test files to front-end/src/dev/**
 *     --rename-index-collision  If a dir has both index.ts and index.tsx, rename index.tsx → index.component.tsx
 *     --move-md-to-docs     Move component .md files to docs/**
 * - Dry run by default; writes moves.sh/deletes.sh. Add --apply to execute.
 * - Uses git by default; add --strategy=fs to bypass git.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const cp = require('child_process');
const crypto = require('crypto');

const args = parseArgs(process.argv.slice(2));
const ROOT = path.resolve(args.root || '.');
const APPLY = !!args.apply;
const STRATEGY = (args.strategy || 'git').toLowerCase(); // git|fs
const OVERWRITE = !!args.overwrite;
const VERBOSE = !!args.verbose;

const MOVE_MAP_FILE = args.moves ? path.resolve(args.moves) : null;
const REMOVE_LIST_FILE = args.remove ? path.resolve(args.remove) : null;

const ENABLE_DEV_EXAMPLES = !!args['dev-examples'];
const ENABLE_MOVE_DEMOS = !!args['move-demos'];
const ENABLE_RENAME_INDEX_COLLISION = !!args['rename-index-collision'];
const ENABLE_MOVE_MD_TO_DOCS = !!args['move-md-to-docs'];

const moves = [];     // {srcAbs, destAbs}
const deletes = [];   // {abs}
const logs = { conflicts: [], skipped: [], done: [], errors: [] };

(async function main() {
  console.log(`[inplace] root=${ROOT}`);
  console.log(`[inplace] apply=${APPLY} strategy=${STRATEGY} overwrite=${OVERWRITE}`);

  // 1) Load explicit move map (optional)
  if (MOVE_MAP_FILE && fs.existsSync(MOVE_MAP_FILE)) {
    const map = JSON.parse(fs.readFileSync(MOVE_MAP_FILE, 'utf8'));
    for (const [fromRel, toRel] of Object.entries(map)) {
      const srcAbs = path.join(ROOT, fromRel);
      const destAbs = path.join(ROOT, toRel);
      if (!fs.existsSync(srcAbs)) { logs.skipped.push(`missing: ${fromRel}`); continue; }
      moves.push({ srcAbs, destAbs });
    }
  }

  // 2) Load deletes (optional)
  if (REMOVE_LIST_FILE && fs.existsSync(REMOVE_LIST_FILE)) {
    const list = JSON.parse(fs.readFileSync(REMOVE_LIST_FILE, 'utf8'));
    for (const rel of list) {
      const abs = path.join(ROOT, rel);
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) deletes.push({ abs });
    }
  }

  // 3) Auto-rules (optional flags)
  if (ENABLE_DEV_EXAMPLES) {
    const exampleGlobs = [
      path.join(ROOT, 'front-end'),
    ];
    const codeFiles = await findFiles(exampleGlobs, name => /Code\.tsx$/.test(name));
    for (const abs of codeFiles) {
      const relAfterFE = relFrom(abs, path.join(ROOT, 'front-end', 'src')) ||
                         relFrom(abs, path.join(ROOT, 'front-end'));
      const destRel = relAfterFE
        ? path.join('front-end', 'src', 'dev', 'examples', relAfterFE)
        : path.join('front-end', 'src', 'dev', 'examples', path.basename(abs));
      const destAbs = path.join(ROOT, destRel);
      moves.push({ srcAbs: abs, destAbs });
    }
  }

  if (ENABLE_MOVE_DEMOS) {
    const demoFiles = await findFiles([path.join(ROOT, 'front-end')], name =>
      /(Demo|Preview|Test)\.tsx$/i.test(name)
    );
    for (const abs of demoFiles) {
      const base = path.basename(abs);
      const destAbs = path.join(ROOT, 'front-end', 'src', 'dev', base);
      moves.push({ srcAbs: abs, destAbs });
    }
  }

  if (ENABLE_RENAME_INDEX_COLLISION) {
    const dirs = await listDirs([path.join(ROOT, 'front-end', 'src'), path.join(ROOT, 'server')]);
    for (const d of dirs) {
      const ts = path.join(d, 'index.ts');
      const tsx = path.join(d, 'index.tsx');
      if (fs.existsSync(ts) && fs.existsSync(tsx)) {
        const destAbs = path.join(d, 'index.component.tsx');
        moves.push({ srcAbs: tsx, destAbs });
      }
    }
  }

  if (ENABLE_MOVE_MD_TO_DOCS) {
    const mdFiles = await findFiles([path.join(ROOT, 'front-end', 'src', 'components')], name => /\.md$/i.test(name));
    for (const abs of mdFiles) {
      const rel = path.relative(path.join(ROOT, 'front-end', 'src', 'components'), abs);
      const destAbs = path.join(ROOT, 'docs', 'components', rel);
      moves.push({ srcAbs: abs, destAbs });
    }
  }

  // 4) De-duplicate moves, build scripts
  const uniqMoves = uniqueBy(moves, m => `${m.srcAbs}→${m.destAbs}`);
  const moveLines = [];
  for (const { srcAbs, destAbs } of uniqMoves) {
    const res = await planMove(srcAbs, destAbs);
    if (!res) continue;
    moveLines.push(res.line);
  }
  const delLines = deletes.map(({ abs }) => isGitRepo(ROOT)
    ? `git rm -f '${abs}'`
    : `rm -f '${abs}'`
  );

  // 5) Dry-run output
  await fsp.writeFile(path.join(ROOT, 'moves.sh'), moveLines.join('\n') + '\n');
  await fsp.writeFile(path.join(ROOT, 'deletes.sh'), delLines.join('\n') + '\n');

  if (!APPLY) {
    console.log(`[inplace] Dry run. Wrote moves.sh (${moveLines.length}) and deletes.sh (${delLines.length}).`);
    return;
  }

  // 6) Apply deletes first
  for (const { abs } of deletes) {
    try {
      if (isGitRepo(ROOT)) run('git', ['rm', '-f', abs], ROOT);
      else fs.unlinkSync(abs);
      if (VERBOSE) console.log(`[rm] ${abs}`);
      logs.done.push(`rm ${abs}`);
    } catch (e) {
      logs.errors.push(`rm ${abs}: ${e.message}`);
    }
  }

  // 7) Apply moves
  for (const { srcAbs, destAbs } of uniqMoves) {
    try {
      await ensureDir(path.dirname(destAbs));
      if (fs.existsSync(destAbs)) {
        if (await isSameFile(srcAbs, destAbs)) {
          // identical: delete source
          if (isGitRepo(ROOT)) run('git', ['rm', '-f', srcAbs], ROOT);
          else fs.unlinkSync(srcAbs);
          logs.done.push(`skip-identical+rm ${srcAbs}`);
          continue;
        }
        if (!OVERWRITE) { logs.conflicts.push(`${destAbs} exists (different)`); continue; }
      }
      if (STRATEGY === 'git' && isGitRepo(ROOT)) {
        const ok = run('git', ['mv', '-k', srcAbs, destAbs], ROOT);
        if (!ok) await fsMove(srcAbs, destAbs);
      } else {
        await fsMove(srcAbs, destAbs);
      }
      if (VERBOSE) console.log(`[mv] ${srcAbs} -> ${destAbs}`);
      logs.done.push(`mv ${srcAbs} -> ${destAbs}`);
    } catch (e) {
      logs.errors.push(`mv ${srcAbs} -> ${destAbs}: ${e.message}`);
    }
  }

  // 8) Summary
  console.log(`[inplace] done=${logs.done.length} conflicts=${logs.conflicts.length} errors=${logs.errors.length}`);
  if (logs.conflicts.length) console.log('Conflicts:\n' + logs.conflicts.join('\n'));
  if (logs.errors.length) console.log('Errors:\n' + logs.errors.join('\n'));
})();

// ---------- helpers ----------
function parseArgs(argv) {
  const out = {};
  for (const a of argv) if (a.startsWith('--')) {
    const [k, v] = a.slice(2).split('=');
    out[k] = v === undefined ? true : v;
  }
  return out;
}
function uniqueBy(arr, keyFn) {
  const seen = new Set(); const out = [];
  for (const it of arr) { const k = keyFn(it); if (!seen.has(k)) { seen.add(k); out.push(it); } }
  return out;
}
function run(cmd, args, cwd) {
  const r = cp.spawnSync(cmd, args, { cwd, stdio: 'inherit' });
  return r.status === 0;
}
async function planMove(srcAbs, destAbs) {
  if (!fs.existsSync(srcAbs) || !fs.statSync(srcAbs).isFile()) return null;
  await ensureDir(path.dirname(destAbs));
  const line = isGitRepo(ROOT)
    ? `mkdir -p "$(dirname '${destAbs}')" && git mv -k '${srcAbs}' '${destAbs}'`
    : `mkdir -p "$(dirname '${destAbs}')" && mv '${srcAbs}' '${destAbs}'`;
  return { line };
}
async function ensureDir(p) { await fsp.mkdir(p, { recursive: true }); }
async function findFiles(roots, filterFn) {
  const out = [];
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    await walk(r, out, filterFn);
  }
  return out;
}
async function walk(dir, out, filterFn) {
  const ents = await fsp.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      await walk(full, out, filterFn);
    } else if (e.isFile()) {
      if (!filterFn || filterFn(e.name, full)) out.push(full);
    }
  }
}
async function listDirs(roots) {
  const out = [];
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    await walkDirs(r, out);
  }
  return out;
}
async function walkDirs(dir, out) {
  const ents = await fsp.readdir(dir, { withFileTypes: true });
  out.push(dir);
  for (const e of ents) if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.git') {
    await walkDirs(path.join(dir, e.name), out);
  }
}
function relFrom(abs, base) {
  const a = path.normalize(abs), b = path.normalize(base);
  if (!a.startsWith(b)) return null;
  return a.slice(b.length + (b.endsWith(path.sep) ? 0 : 1));
}
function isGitRepo(dir) {
  try { fs.accessSync(path.join(dir, '.git'), fs.constants.F_OK); return true; } catch { return false; }
}
async function isSameFile(a, b) {
  try {
    const sa = fs.statSync(a), sb = fs.statSync(b);
    if (sa.size !== sb.size) return false;
    const [ha, hb] = await Promise.all([hash(a), hash(b)]);
    return ha === hb;
  } catch { return false; }
}
function hash(file) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash('sha1');
    fs.createReadStream(file).on('error', reject).on('data', d => h.update(d)).on('end', () => resolve(h.digest('hex')));
  });
}
async function fsMove(src, dest) {
  try { await fsp.rename(src, dest); }
  catch {
    await fsp.copyFile(src, dest);
    await fsp.unlink(src);
  }
}

