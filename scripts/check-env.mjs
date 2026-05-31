#!/usr/bin/env node
/**
 * Quick local env check — does not print secret values.
 * Usage: node scripts/check-env.mjs
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env.local");

function loadEnv() {
  if (!existsSync(envPath)) return {};
  const text = readFileSync(envPath, "utf8");
  const out = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function ok(name, env) {
  const v = env[name] || process.env[name];
  if (!v) return false;
  if (/your-|YOUR-|sk-your|any-random-string/i.test(v)) return false;
  if (name === "OPENAI_API_KEY" && !v.startsWith("sk-")) return false;
  return true;
}

const env = { ...process.env, ...loadEnv() };

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "OPENAI_API_KEY",
];

console.log("DeliverX environment check\n");

let fail = false;
for (const k of required) {
  const pass = ok(k, env);
  console.log(`${pass ? "✓" : "✗"} ${k}${pass ? "" : " (required)"}`);
  if (!pass) fail = true;
}

console.log(`${ok("OPENAI_MODEL", env) ? "✓" : "○"} OPENAI_MODEL (optional, default gpt-4o-mini)`);

if (fail) {
  console.log("\nFix: docs/API_KEYS.md");
  process.exit(1);
}
console.log("\nAll required variables look set. Text AI uses OpenAI.");
