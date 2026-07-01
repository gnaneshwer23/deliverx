#!/usr/bin/env node
/**
 * Quick env check — does not print secret values.
 * Usage:
 *   node scripts/check-env.mjs              # local dev
 *   node scripts/check-env.mjs --production # stricter (explicit INVITE_JWT_SECRET)
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env.local");
const productionMode = process.argv.includes("--production");

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

console.log(
  `DeliverX environment check${productionMode ? " (production strict)" : ""}\n`,
);

let fail = false;
for (const k of required) {
  const pass = ok(k, env);
  console.log(`${pass ? "✓" : "✗"} ${k}${pass ? "" : " (required)"}`);
  if (!pass) fail = true;
}

console.log(`${ok("OPENAI_MODEL", env) ? "✓" : "○"} OPENAI_MODEL (optional, default gpt-4o-mini)`);

const inviteExplicit = ok("INVITE_JWT_SECRET", env);
const inviteFallbackCron = ok("CRON_SECRET", env);
const inviteFallbackService = ok("SUPABASE_SERVICE_ROLE_KEY", env);
const inviteViaFallback = !inviteExplicit && (inviteFallbackCron || inviteFallbackService);

if (inviteExplicit) {
  console.log("✓ INVITE_JWT_SECRET (explicit)");
} else if (inviteViaFallback) {
  const fallback = inviteFallbackCron ? "CRON_SECRET" : "SUPABASE_SERVICE_ROLE_KEY";
  if (productionMode) {
    console.log(`✗ INVITE_JWT_SECRET (required in Production — only ${fallback} fallback available)`);
    fail = true;
  } else {
    console.log(`⚠ INVITE_JWT_SECRET (using ${fallback} fallback — set explicit secret for Production)`);
  }
} else {
  console.log("✗ INVITE_JWT_SECRET (required for invite links)");
  fail = true;
}

console.log(`${ok("CRON_SECRET", env) ? "✓" : "○"} CRON_SECRET (optional locally; required on Vercel Production for cron routes)`);

if (fail) {
  console.log("\nFix: docs/env-checklist.md, docs/OPS_ENV_RUNBOOK.md");
  process.exit(1);
}
console.log("\nAll required variables look set. Text AI uses OpenAI.");
