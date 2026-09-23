// CI: automated test-suite runner. Discovers *.test.mts / *.test.ts outside
// node_modules and runs each with tsx. Any suite failure fails the step.
// NOTE: as of 2026-09-23 the repository has no *.test.* suites — the active
// suites are scripts/im-verify.mts and scripts/migration-verify.mts, which CI
// runs as dedicated steps. This runner exists so future suites are picked up
// automatically; it prints an explicit notice when the suite set is empty
// (it does NOT silently pass off as coverage).
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;
const SKIP = new Set(["node_modules", "dist", ".git"]);
const suites: string[] = [];
(function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (!SKIP.has(name)) walk(p);
    } else if (/\.test\.(mts|ts)$/.test(name)) suites.push(p);
  }
})(ROOT);

if (!suites.length) {
  console.log(
    "run-tests: no *.test.* suites exist yet — nothing to run (im-verify/migration-verify run as separate CI steps)",
  );
  process.exit(0);
}
let failed = 0;
for (const s of suites) {
  console.log("running", s.slice(ROOT.length));
  const r = spawnSync("npx", ["tsx", s], { stdio: "inherit", cwd: ROOT });
  if (r.status !== 0) failed++;
}
if (failed) {
  console.error(`${failed}/${suites.length} suites FAILED`);
  process.exit(1);
}
console.log(`${suites.length} suites PASS`);
