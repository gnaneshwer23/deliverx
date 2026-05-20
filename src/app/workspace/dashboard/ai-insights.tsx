"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function AiInsights() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-[#0F766E]/10 text-[#0F766E]">
          <Sparkles size={14} />
        </span>
        <h2 className="text-lg font-semibold">AI Insights</h2>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
          Preview
        </span>
      </div>
      <p className="text-sm text-slate-600">
        Delivery risk increasing due to repeated delays in infrastructure tasks.
        Consider resource reallocation.
      </p>
    </motion.section>
  );
}
