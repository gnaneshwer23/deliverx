import { dxClass } from "@/lib/dx-theme";

const ROWS = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    where: "Supabase → Settings → API → Project URL",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    where: "Supabase → Settings → API → anon public",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    where: "Supabase → Settings → API → service_role (server only)",
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    required: true,
    where: "http://localhost:3000 locally, or your Vercel URL",
  },
  {
    name: "MINIMAX_API_KEY or ANTHROPIC_API_KEY",
    required: true,
    where: "MiniMax or Anthropic console — text AI features",
  },
  {
    name: "OPENAI_API_KEY",
    required: false,
    where: "OpenAI platform — Whisper + embeddings (optional)",
  },
  {
    name: "CRON_SECRET",
    required: false,
    where: "Vercel env only — secures daily twin snapshot cron",
  },
];

export function EnvKeysGuide() {
  return (
    <section className={`${dxClass.cardPad}`}>
      <h2 className="mb-1 font-semibold">Environment variables</h2>
      <p className="mb-4 text-sm text-[#6B6B64]">
        Local: copy <code className="text-[#1C4A2E]">.env.example</code> →{" "}
        <code className="text-[#1C4A2E]">.env.local</code> and fill values. Production: Vercel →
        Settings → Environment Variables → redeploy.
      </p>
      <div className={`${dxClass.card} overflow-x-auto`}>
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E4E4DC] bg-[#F7F7F2]">
              <th className="px-3 py-2 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#6B6B64]">
                Variable
              </th>
              <th className="px-3 py-2 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wider text-[#6B6B64]">
                Where
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.name} className="border-b border-[#F0F0E8] last:border-0">
                <td className="px-3 py-2 align-top">
                  <code className="text-xs text-[#1C4A2E]">{row.name}</code>
                  {row.required ? (
                    <span className="ml-2 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase text-[#C0392B]">
                      Required
                    </span>
                  ) : (
                    <span className="ml-2 font-[family-name:var(--font-dx-mono)] text-[7px] uppercase text-[#A8A89E]">
                      Optional
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-[#6B6B64]">{row.where}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
