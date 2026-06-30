"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  isReadOnlyProjectSegment,
  projectSegmentFromPathname,
} from "@/lib/project-read-only-nav";

export function ReadOnlyProjectGuard({
  projectId,
  readOnly,
}: {
  projectId: string;
  readOnly: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!readOnly) return;
    const segment = projectSegmentFromPathname(pathname, projectId);
    if (!isReadOnlyProjectSegment(segment)) {
      router.replace(`/project/${projectId}?readOnly=1`);
    }
  }, [readOnly, pathname, projectId, router]);

  return null;
}
