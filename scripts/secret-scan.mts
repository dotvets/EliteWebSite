// CI: secret scan — fails if any tracked source file contains what looks like
// a committed secret. Patterns mirror server/integrations/registry.ts scanner
// plus common provider formats. No network, no env access.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "attached_assets"]);
const SKIP_FILES = new Set(["package-lock.json", "secret-scan.mts"]);
const EXT = /\.(ts|tsx|mts|js|jsx|json|md|yml|yaml|css|html|env|txt)$/;

const PATTERNS: [RegExp, string][] = [
  [/-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----/, "private key block"],
  [/\bEAA[A-Za-z0-9_-]{20,}/, "Meta/Graph access token (EAA…)"],
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key id"],
  [/\b(xox[baprs]-[A-Za-z0-9-]{10,})\b/, "Slack token"],
  [/\bsk_live_[A-Za-z0-9]{16,}\b/, "Stripe live secret"],
  [/\bya29\.[A-Za-z0-9_-]{20,}\b/, "Google OAuth access token"],
  [/\bghp_[A-Za-z0-9]{30,}\b/, "GitHub PAT"],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, "Google API key"],
  [
    /"(?:private_key|client_secret|api_secret)"\s*:\s*"[^"]{8,}"/,
    "JSON-embedded secret field",
  ],
];

const findings: string[] = [];
function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(p);
      continue;
    }
    if (SKIP_FILES.has(name) || !EXT.test(name)) continue;
    const text = readFileSync(p, "utf8");
    const rel = p.slice(ROOT.length);
    text.split("\n").forEach((line, i) => {
      if (line.includes("secret-scan:allow")) return; // explicit documented fixture exception
      for (const [re, label] of PATTERNS) {
        if (re.test(line)) findings.push(`${rel}:${i + 1} — ${label}`);
      }
    });
  }
}
walk(ROOT);

if (findings.length) {
  console.error("secret-scan FAIL — possible committed secrets:");
  for (const f of findings) console.error("  " + f);
  process.exit(1);
}
console.log("secret-scan: no committed secrets found — PASS");
