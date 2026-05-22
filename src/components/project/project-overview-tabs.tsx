"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProjectOverviewTabs({
  overview,
  insights,
}: {
  overview: ReactNode;
  insights: ReactNode;
}) {
  return (
    <Tabs defaultValue="overview" className="gap-6">
      <TabsList variant="line" className="h-auto w-full justify-start gap-0 border-b border-slate-200 bg-transparent p-0">
        <TabsTrigger
          value="overview"
          className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-active:border-[#0F766E] data-active:bg-transparent data-active:text-[#0F766E]"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="insights"
          className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-active:border-[#0F766E] data-active:bg-transparent data-active:text-[#0F766E]"
        >
          Insights
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-0 outline-none">
        {overview}
      </TabsContent>
      <TabsContent value="insights" className="mt-0 outline-none">
        {insights}
      </TabsContent>
    </Tabs>
  );
}
