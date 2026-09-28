"use client";

import Link from "next/link";
import { Search, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Result = {
  type: string;
  label: string;
  title: string;
  description: string;
  href: string;
};

export default function AdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const value = query.trim();

    if (value.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const id = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(value)}`, {
          cache: "no-store",
        });

        if (id !== requestId.current) return;

        if (!response.ok) {
          setResults([]);
          return;
        }

        const data = await response.json();
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch {
        if (id === requestId.current) setResults([]);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative hidden w-[280px] md:block">
      <div className="flex h-10 items-center gap-2 rounded-[10px] border border-[#E7E2DA] bg-white px-3 shadow-sm">
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#98A2B3]" />
        ) : (
          <Search className="h-4 w-4 shrink-0 text-[#98A2B3]" />
        )}
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder="جست‌وجو در پنل..."
          aria-label="جست‌وجو در پنل مدیریت"
          dir="rtl"
          className="min-w-0 flex-1 bg-transparent text-xs text-[#1A2332] outline-none placeholder:text-[#98A2B3]"
        />
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute right-0 top-12 z-50 max-h-[min(70vh,520px)] w-[360px] overflow-y-auto rounded-2xl border border-[#E7E2DA] bg-white p-2 shadow-[0_18px_50px_rgba(26,35,50,0.14)]">
          {loading && results.length === 0 ? (
            <div className="p-5 text-center text-xs text-[#98A2B3]">در حال جست‌وجو...</div>
          ) : results.length === 0 ? (
            <div className="p-5 text-center text-xs text-[#98A2B3]">نتیجه‌ای پیدا نشد.</div>
          ) : (
            results.map((result, index) => (
              <Link
                key={`${result.type}-${index}-${result.title}`}
                href={result.href}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#F1F5E8]"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#B86F5B]">{result.label}</span>
                  </div>
                  <p className="truncate text-xs font-semibold text-[#194342]">{result.title}</p>
                  <p className="mt-0.5 truncate text-[10px] text-[#98A2B3]">{result.description}</p>
                </div>
                <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-[#98A2B3]" />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
