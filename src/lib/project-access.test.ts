import { describe, expect, it } from "vitest";
import {
  isReadOnlyProjectSegment,
  projectSegmentFromPathname,
} from "@/lib/project-access";

describe("project-access", () => {
  it("allows read-only segments", () => {
    expect(isReadOnlyProjectSegment("")).toBe(false);
    expect(isReadOnlyProjectSegment("reports")).toBe(false);
    expect(isReadOnlyProjectSegment("decisions")).toBe(false);
    expect(isReadOnlyProjectSegment("raid")).toBe(false);
  });

  it("blocks write segments for read-only sponsors", () => {
    expect(isReadOnlyProjectSegment("requirements")).toBe(true);
    expect(isReadOnlyProjectSegment("tasks")).toBe(true);
    expect(isReadOnlyProjectSegment("charter")).toBe(true);
  });

  it("parses project segment from pathname", () => {
    const projectId = "22222222-2222-4222-8222-222222222222";
    expect(projectSegmentFromPathname(`/project/${projectId}`, projectId)).toBe("");
    expect(projectSegmentFromPathname(`/project/${projectId}/tasks`, projectId)).toBe(
      "tasks",
    );
    expect(
      projectSegmentFromPathname(`/project/${projectId}/reports/abc`, projectId),
    ).toBe("reports");
  });
});
