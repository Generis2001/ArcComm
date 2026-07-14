'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { CreatorCard } from '@/components/creator/CreatorCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CreatorProfile } from '@/types/creator';

const CONTENT_CATEGORIES = [
  { value: 'ALL', label: 'All categories' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'ARTICLE', label: 'Article' },
  { value: 'IMAGE_GALLERY', label: 'Image gallery' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'FILE', label: 'File' },
];

function updateSearchParams(search: string, category: string) {
  const params = new URLSearchParams();

  if (search.trim()) params.set('q', search.trim());
  if (category !== 'ALL') params.set('category', category);

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function ExploreCreators({ creators }: { creators: CreatorProfile[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [category, setCategory] = useState(() => searchParams.get('category') ?? 'ALL');

  const persistFilters = (nextSearch: string, nextCategory: string) => {
    router.replace(`${pathname}${updateSearchParams(nextSearch, nextCategory)}`, { scroll: false });
  };

  const filteredCreators = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return creators.filter((creator) => {
      const content = creator.content ?? [];
      const matchesCategory = category === 'ALL' || content.some((item) => item.type === category);
      if (!matchesCategory) return false;

      if (!query) return true;

      const searchableText = [
        creator.displayName,
        creator.handle,
        creator.bio ?? '',
        ...content.flatMap((item) => [item.title, item.description ?? '', item.type.replaceAll('_', ' ')]),
      ]
        .join(' ')
        .toLocaleLowerCase();

      return searchableText.includes(query);
    });
  }, [category, creators, search]);

  const clearSearch = () => {
    setSearch('');
    persistFilters('', category);
  };

  return (
    <div className="space-y-5">
      <div className="arc-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/[0.38]" />
          <Input
            value={search}
            onChange={(event) => {
              const nextSearch = event.target.value;
              setSearch(nextSearch);
              persistFilters(nextSearch, category);
            }}
            placeholder="Search creators or content"
            aria-label="Search creators or content"
            className="h-11 border-white/[0.10] bg-black/[0.24] pl-10 pr-10 text-white placeholder:text-white/[0.36]"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-white/[0.48] hover:bg-white/[0.08] hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <select
          value={category}
          onChange={(event) => {
            const nextCategory = event.target.value;
            setCategory(nextCategory);
            persistFilters(search, nextCategory);
          }}
          aria-label="Filter by content category"
          className="h-11 rounded-full border border-white/[0.10] bg-black/[0.24] px-4 text-sm text-white/[0.74] outline-none transition-colors focus:border-white/[0.28] sm:w-48"
        >
          {CONTENT_CATEGORIES.map((option) => (
            <option key={option.value} value={option.value} className="bg-zinc-950">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-white/[0.48]" aria-live="polite">
        {filteredCreators.length} {filteredCreators.length === 1 ? 'creator' : 'creators'} found
      </p>

      {filteredCreators.length === 0 ? (
        <div className="arc-panel py-16 text-center text-white/[0.54]">
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
