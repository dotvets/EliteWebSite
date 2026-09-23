// ESLint flat config — initial adoption for CI (2026-09-23).
// Scope: real-defect rules on TS sources. Formatting is owned by Prettier;
// stylistic noise rules are intentionally off for the baseline.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "attached_assets/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Static browser scripts (no bundler) — browser globals, no TS rules.
    files: ["client/public/**/*.js"],
    languageOptions: {
      globals: { window: "readonly", document: "readonly", navigator: "readonly", location: "readonly", fetch: "readonly", URL: "readonly", URLSearchParams: "readonly", localStorage: "readonly", console: "readonly", setTimeout: "readonly", clearTimeout: "readonly" },
    },
    rules: { "no-undef": "error", "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }] },
  },
  {
    files: ["client/src/**/*.{ts,tsx}", "server/**/*.ts", "scripts/**/*.mts"],
    languageOptions: {
      globals: { process: "readonly", console: "readonly", Buffer: "readonly", fetch: "readonly", setTimeout: "readonly", clearTimeout: "readonly", URL: "readonly", URLSearchParams: "readonly", AbortController: "readonly", FormData: "readonly", crypto: "readonly", window: "readonly", document: "readonly", localStorage: "readonly", navigator: "readonly", location: "readonly", btoa: "readonly", atob: "readonly", alert: "readonly", confirm: "readonly", RequestInit: "readonly", Response: "readonly", Request: "readonly", Headers: "readonly" },
    },
    rules: {
      "no-undef": "off", // TS already guarantees this; the JS rule misfires on types/globals
      "@typescript-eslint/no-explicit-any": "off", // pre-existing usage; tracked separately
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
);
