"use client";

import { motion } from "framer-motion";

const steps = [
  "Business Case",
  "AI Structuring",
  "Execution",
  "Monitoring",
  "Reporting",
  "Learning",
];

export function Workflow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {steps.map((step, i) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.12, duration: 0.4, ease: "easeOut" }}
          className="rounded-xl bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-slate-200"
        >
          <span className="mr-2 text-[#0F766E]">{i + 1}.</span>
          {step}
        </motion.div>
      ))}
    </div>
  );
}
