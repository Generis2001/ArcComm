'use client';

import { useMemo, useRef, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { CreatorCard } from '@/components/creator/CreatorCard';
import type { CreatorProfile } from '@/types/creator';


function updateSearchParams(search: string) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('q', search.trim());
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function ExploreCreators({ creators }: { creators: CreatorProfile[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');

  // Controls the expanded / collapsed state of the search bar
  const [expanded, setExpanded] = useState(() => !!(searchParams.get('q')));
  const inputRef = useRef<HTMLInputElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistFilters = (nextSearch: string) => {
    router.replace(`${pathname}${updateSearchParams(nextSearch)}`, {
      scroll: false,
    });
  };

  // Open on hover (with a tiny debounce so it doesn't flicker)
  const handleMouseEnter = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setExpanded(true);
  }, []);

  // Close on leave only when there's no active search text and input isn't focused
  const handleMouseLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      if (!search && document.activeElement !== inputRef.current) setExpanded(false);
    }, 150);
  }, [search]);

  const handleIconClick = () => {
    setExpanded(true);
    // slight delay lets the width transition start before focus triggers scroll
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleInputBlur = () => {
    if (!search) {
      leaveTimer.current = setTimeout(() => setExpanded(false), 200);
    }
  };

  const clearSearch = () => {
    setSearch('');
    persistFilters('');
    setExpanded(false);
    inputRef.current?.blur();
  };

  const filteredCreators = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return creators;

    return creators.filter((creator) => {
      const content = creator.content ?? [];
      const searchableText = [
        creator.displayName,
        creator.handle,
        creator.bio ?? '',
        ...content.flatMap((item) => [
          item.title,
          item.description ?? '',
          item.type.replaceAll('_', ' '),
        ]),
      ]
        .join(' ')
        .toLocaleLowerCase();

      return searchableText.includes(query);
    });
  }, [creators, search]);

  return (
    <div className="space-y-5">
      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3">

        {/* Expanding search — icon on left, bar grows right on hover */}
        <div
          className="relative flex items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Search icon button — always visible */}
          <button
            type="button"
            onClick={handleIconClick}
            aria-label="Search creators or content"
            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center text-white/[0.50] transition-colors duration-200 hover:text-white"
          >
            <Search className="h-[15px] w-[15px]" />
          </button>

          {/* Expanding input — slides out to the right */}
          <div
            style={{
              width: expanded ? '260px' : '0px',
              opacity: expanded ? 1 : 0,
              transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease',
              overflow: 'hidden',
            }}
          >
            <div className="relative ml-2">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearch(v);
                  persistFilters(v);
                }}
                onFocus={() => {
                  if (leaveTimer.current) clearTimeout(leaveTimer.current);
                  setExpanded(true);
                }}
                onBlur={handleInputBlur}
                placeholder="Search creators or content…"
                aria-label="Search creators or content"
                className="h-10 w-full rounded-full border border-white/[0.10] bg-black/[0.30] pl-4 pr-9 text-sm text-white placeholder:text-white/[0.34] outline-none transition-colors focus:border-white/[0.26] focus:bg-white/[0.04]"
              />
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/[0.40] transition-colors hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Result count */}
        <p className="ml-auto text-sm text-white/[0.40]" aria-live="polite">
          {filteredCreators.length}{' '}
          {filteredCreators.length === 1 ? 'creator' : 'creators'}
        </p>
      </div>

      {/* ── Creator grid ── */}
      {filteredCreators.length === 0 ? (
        <div className="py-16 text-center text-white/[0.54]">
          No creators match your search or category filter.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}
    </div>
  );
}
