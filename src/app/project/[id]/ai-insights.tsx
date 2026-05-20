"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function AiInsights() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-6 rounded-xl border border-indigo-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-[#4F46E5]/10 text-[#4F46E5]">
          <Sparkles size={14} />
        </span>
        <h3 className="font-semibold text-[#4F46E5]">AI Insights</h3>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
          Preview
        </span>
      </div>
      <p className="text-sm text-slate-600">
        Delivery slowdown detected in infrastructure workstream. Recommend
        resource reallocation.
      </p>
    </motion.section>
  );
}
