'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { DailyLog } from '@/core/models/ScheduleTypes';

export interface SearchResult {
  type: 'date-note' | 'month-note';
  /** Display text shown in the results dropdown */
  label: string;
  /** The matching content fragment */
  snippet: string;
  /** Date to jump to — either the note's date or the 1st of the month */
  targetDate: Date;
  /** The raw matching text for highlighting purposes */
  matchedQuery: string;
}

/**
 * Centralized search logic, intentionally separated from UI.
 *
 * Why a custom hook instead of inline logic?
 * Search touches both date dailyLogs and month dailyLogs — two distinct data sources.
 * Isolating the fuzzy-match + debounce here prevents the GlobalSearch component
 * from coupling to the shape of GlobalStoreProvider's state.
 */
export function useSearchEngine(
  dailyLogs: DailyLog[],
  monthlyLogs: Record<string, string>
) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 300ms debounce — fast enough to feel responsive, slow enough to skip noise
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const results = useMemo<SearchResult[]>(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];

    const matched: SearchResult[] = [];

    // Search through per-date dailyLogs
    dailyLogs.forEach(note => {
      if (note.content.toLowerCase().includes(q)) {
        matched.push({
          type: 'date-note',
          label: format(note.date, 'MMM d, yyyy'),
          snippet: note.content,
          targetDate: note.date,
          matchedQuery: q,
        });
      }
    });

    // Search through monthly dailyLogs
    Object.entries(monthlyLogs).forEach(([key, content]) => {
      if (content.toLowerCase().includes(q)) {
        const [year, month] = key.split('-').map(Number);
        const targetDate = new Date(year, month - 1, 1);
        matched.push({
          type: 'month-note',
          label: format(targetDate, 'MMMM yyyy'),
          snippet: content,
          targetDate,
          matchedQuery: q,
        });
      }
    });

    return matched;
  }, [debouncedQuery, dailyLogs, monthlyLogs]);

  // Set of date strings that match — used by the calendar grid to add glow
  const highlightedDates = useMemo(() => {
    const set = new Set<string>();
    results.forEach(r => {
      if (r.type === 'date-note') {
        set.add(format(r.targetDate, 'yyyy-MM-dd'));
      }
    });
    return set;
  }, [results]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    setQuery,
    results,
    highlightedDates,
    clearSearch,
    isSearching: debouncedQuery.trim().length > 0,
  };
}
