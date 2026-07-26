"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SEARCH_CATALOGUE,
  clampSearchIndex,
  filterCatalogue,
  moveSearchIndex,
  type SearchHit,
} from "@/lib/global-search";

const KIND_LABEL: Record<SearchHit["kind"], string> = {
  destination: "Go to",
  help: "Help",
  evidence: "Evidence",
  project: "Project",
  artefact: "Artefact",
  enrolment: "Experience",
};

function isModK(event: KeyboardEvent) {
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
}

export function GlobalSearchChrome({ enabled }: { enabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remoteItems, setRemoteItems] = useState<SearchHit[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const router = useRouter();

  const localItems = useMemo(() => {
    const q = query.trim();
    return filterCatalogue(SEARCH_CATALOGUE, q).slice(0, q ? 10 : 14);
  }, [query]);

  const items = remoteItems ?? localItems;
  const safeIndex = clampSearchIndex(activeIndex, items.length);

  useEffect(() => {
    if (!enabled) return;
    function onKeyDown(event: KeyboardEvent) {
      if (!isModK(event)) return;
      event.preventDefault();
      setOpen((value) => !value);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open || !enabled) return;
    const q = query.trim();
    if (!q) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/pi/search?q=${encodeURIComponent(q)}`, {
            signal: controller.signal,
          });
          const data = (await response.json()) as {
            ok?: boolean;
            items?: SearchHit[];
            error?: string;
          };
          if (!response.ok) {
            throw new Error(data.error || "Search failed");
          }
          if (controller.signal.aborted) return;
          setRemoteItems(data.items ?? []);
          setActiveIndex(0);
        } catch (cause) {
          if (controller.signal.aborted) return;
          setError(cause instanceof Error ? cause.message : "Search failed");
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      })();
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, open, enabled]);

  if (!enabled) return null;

  function resetDialogState() {
    setQuery("");
    setRemoteItems(null);
    setError(null);
    setLoading(false);
    setActiveIndex(0);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetDialogState();
  }

  function goTo(hit: SearchHit | undefined) {
    if (!hit) return;
    handleOpenChange(false);
    router.push(hit.href);
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        moveSearchIndex(clampSearchIndex(current, items.length), "ArrowDown", items.length),
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        moveSearchIndex(clampSearchIndex(current, items.length), "ArrowUp", items.length),
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      goTo(items[safeIndex]);
    }
  }

  const activeId = items[safeIndex] ? `${listId}-option-${safeIndex}` : undefined;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#0D0D0B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E]"
        aria-label="Open search"
        aria-keyshortcuts="Meta+K Control+K"
      >
        <Search size={16} aria-hidden />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden rounded border border-[#E5E7EB] bg-[#F9FAFB] px-1.5 py-0.5 font-[family-name:var(--font-dx-mono)] text-[10px] text-[#6B7280] lg:inline">
          ⌘K
        </kbd>
      </button>

      <Link
        href="/help"
        className="hidden min-h-11 shrink-0 items-center rounded-lg px-3 text-sm text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#0D0D0B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C4A2E] sm:inline-flex"
      >
        Help
      </Link>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton
          className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          <DialogHeader className="border-b border-[var(--dx-rul)] px-4 py-3 text-left">
            <DialogTitle className="text-base font-medium text-[#0D0D0B]">
              Search DeliverX
            </DialogTitle>
            <DialogDescription className="text-sm text-[#6B6B64]">
              Find destinations and your own evidence, projects, and Experience work. Not a new
              product — results route into Profile, Experience, Launchpad, Workspace, Portfolio,
              and Settings.
            </DialogDescription>
          </DialogHeader>

          <div className="border-b border-[var(--dx-rul)] px-3 py-2">
            <label htmlFor={`${listId}-input`} className="sr-only">
              Search query
            </label>
            <input
              ref={inputRef}
              id={`${listId}-input`}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setRemoteItems(null);
                setActiveIndex(0);
                setError(null);
              }}
              onKeyDown={onInputKeyDown}
              placeholder="Search destinations, help, or your records"
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={true}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeId}
              className="w-full rounded-md border border-transparent bg-transparent px-2 py-2 text-sm text-[#0D0D0B] outline-none placeholder:text-[#9CA3AF] focus-visible:border-[#1C4A2E]/40"
            />
          </div>

          <div className="max-h-[min(50vh,360px)] overflow-y-auto px-2 py-2" role="presentation">
            {error ? (
              <p className="px-2 py-3 text-sm text-[#9B2C2C]" role="alert">
                {error}
              </p>
            ) : null}
            {loading ? (
              <p className="px-2 py-1 text-xs text-[#6B6B64]" aria-live="polite">
                Searching your records…
              </p>
            ) : null}
            {items.length === 0 && !loading ? (
              <p className="px-2 py-3 text-sm text-[#6B6B64]">
                No matches. Try a product name, or open Help for orientation.
              </p>
            ) : (
              <ul id={listId} role="listbox" aria-label="Search results" className="space-y-0.5">
                {items.map((item, index) => {
                  const selected = index === safeIndex;
                  return (
                    <li key={item.id} role="presentation">
                      <button
                        type="button"
                        id={`${listId}-option-${index}`}
                        role="option"
                        aria-selected={selected}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => goTo(item)}
                        className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                          selected ? "bg-[#EEF5F1]" : "hover:bg-[#F3F4F6]"
                        }`}
                      >
                        <span className="mt-0.5 shrink-0 font-[family-name:var(--font-dx-mono)] text-[10px] uppercase tracking-wide text-[#6B6B64]">
                          {KIND_LABEL[item.kind]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-[#0D0D0B]">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-[#6B6B64]">
                            {item.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <p className="border-t border-[var(--dx-rul)] px-4 py-2 text-xs text-[#6B6B64]">
            Use arrow keys to move, Enter to open, Escape to close. Results are limited to your
            account.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
