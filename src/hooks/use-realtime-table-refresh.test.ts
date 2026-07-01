import { beforeEach, describe, expect, it, vi } from "vitest";

const refreshMock = vi.fn();
const removeChannelMock = vi.fn();
const onCalls: Array<[string, Record<string, unknown>, () => void]> = [];

const channelStub = {
  on: vi.fn((event: string, config: Record<string, unknown>, cb: () => void) => {
    onCalls.push([event, config, cb]);
    return channelStub;
  }),
  subscribe: vi.fn(() => channelStub),
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel: vi.fn(() => channelStub),
    removeChannel: removeChannelMock,
  }),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useEffect: (fn: () => void | (() => void)) => {
      fn();
    },
  };
});

import { useRealtimeTableRefresh } from "./use-realtime-table-refresh";

describe("useRealtimeTableRefresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onCalls.length = 0;
  });

  it("subscribes to INSERT by default", () => {
    useRealtimeTableRefresh("tasks");

    expect(onCalls).toHaveLength(1);
    expect(onCalls[0]?.[1]).toMatchObject({
      event: "INSERT",
      schema: "public",
      table: "tasks",
    });
    expect(channelStub.subscribe).toHaveBeenCalled();
  });

  it("subscribes to INSERT and UPDATE when configured", () => {
    useRealtimeTableRefresh("tasks", { events: ["INSERT", "UPDATE"] });

    expect(onCalls).toHaveLength(2);
    expect(onCalls.map((call) => call[1].event)).toEqual(["INSERT", "UPDATE"]);
  });

  it("passes optional filter to postgres_changes", () => {
    useRealtimeTableRefresh("tasks", {
      events: ["INSERT"],
      filter: "project_id=eq.abc",
    });

    expect(onCalls[0]?.[1]).toMatchObject({
      filter: "project_id=eq.abc",
    });
  });

  it("calls router.refresh on postgres change", () => {
    useRealtimeTableRefresh("delivery_impact_events", {
      events: ["INSERT", "UPDATE"],
    });

    onCalls[0]?.[2]();
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
