'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, StickyNote, CalendarDays } from 'lucide-react';
import { SearchResult } from '@/core/hooks/useSearchEngine';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  onClear: () => void;
  isSearching: boolean;
}

/**
 * A top-level search bar with live results dropdown.
 *
 * Architectural choice: this component is purely presentational.
 * All search logic lives in the useSearchEngine hook — this just renders
 * the input and the results list.
 */
export function GlobalSearch({
  query,
  onQueryChange,
  results,
  onResultClick,
  onClear,
  isSearching,
}: SearchBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Don't clear the query — just collapse the dropdown naturally
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Truncate long note content for the dropdown preview
  const truncate = (text: string, max = 60) =>
    text.length > max ? text.slice(0, max) + '…' : text;

  // Highlight the matching substring inside the snippet
  const highlightMatch = (text: string, match: string) => {
    const idx = text.toLowerCase().indexOf(match.toLowerCase());
    if (idx === -1) return <span>{truncate(text)}</span>;
    const before = text.slice(0, idx);
    const matched = text.slice(idx, idx + match.length);
    const after = text.slice(idx + match.length);
    return (
      <span>
        {truncate(before, 30)}
        <mark className="bg-primary/30 text-primary-foreground rounded px-0.5">{matched}</mark>
        {truncate(after, 30)}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search dailyLogs…"
          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl glass 
            text-foreground placeholder:text-muted-foreground/60
            focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30
            transition-all duration-200"
        />
        {/* Clear button — only visible when there's a query */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg
                text-muted-foreground hover:text-foreground hover:bg-white/10
                transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 
              glass rounded-xl overflow-hidden shadow-panel
              max-h-[280px] overflow-y-auto custom-scrollbar"
          >
            {results.length > 0 ? (
              <div className="py-1">
                {results.map((result, i) => (
                  <button
                    key={`${result.type}-${result.label}-${i}`}
                    onClick={() => onResultClick(result)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3
                      hover:bg-primary/10 transition-colors duration-150
                      border-b border-white/5 last:border-b-0"
                  >
                    <div className="p-1.5 rounded-lg bg-primary/15 text-primary mt-0.5 flex-shrink-0">
                      {result.type === 'date-note' ? (
                        <StickyNote className="w-3.5 h-3.5" />
                      ) : (
                        <CalendarDays className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-primary/80 uppercase tracking-wider mb-0.5">
                        {result.type === 'date-note' ? 'Date DailyLog' : 'Month DailyLog'} · {result.label}
                      </p>
                      <p className="text-sm text-foreground/80 leading-snug">
                        {highlightMatch(result.snippet, result.matchedQuery)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">No results found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Try searching for a note or keyword
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
