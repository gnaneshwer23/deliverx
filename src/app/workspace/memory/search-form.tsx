"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchForm({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(q ? `/workspace/memory?q=${encodeURIComponent(q)}` : "/workspace/memory");
      }}
      className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2"
    >
      <Search size={14} className="text-slate-500" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search memory (tag or text)…"
        className="w-64 bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
      {defaultValue ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            router.push("/workspace/memory");
          }}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          Clear
        </button>
      ) : null}
    </form>
  );
}
