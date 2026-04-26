const requiredServerEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export function validateServerEnv(): void {
  for (const key of requiredServerEnv) {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
}

export function getGoogleAiKey(): string | null {
  return process.env.GOOGLE_AI_API_KEY ?? null;
}

export function getSummaryTargetWords(): number {
  const raw = process.env.SUMMARY_WORD_TARGET ?? "200";
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 80 || parsed > 500) {
    return 200;
  }
  return parsed;
}
