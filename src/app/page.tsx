'use client';

import { useState, useCallback, useRef } from 'react';
import { ScheduleWidget, CalendarContainerRef } from '@/features/schedule/components/ScheduleWidget';
import { MonthlyDrawer } from '@/features/logs/components/MonthlyDrawer';
import { DetailSidebar } from '@/features/logs/components/DetailSidebar';
import { GlobalSearch } from '@/features/search/components/GlobalSearch';
import { MetricsBar } from '@/shared/components/MetricsBar';
import { DarkModeSwitch } from '@/shared/components/DarkModeSwitch';
import { useSearchEngine, SearchResult } from '@/core/hooks/useSearchEngine';
import { useGlobalStore } from '@/core/store/GlobalStore';
import { useKeyBinds } from '@/core/hooks/useKeyBinds';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  // Refactored structure
  const { dailyLogs, monthlyLogs, selectedPeriods } = useGlobalStore();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Ref to control the calendar's internal month from outside (e.g. "Today" button)
  const calendarRef = useRef<CalendarContainerRef>(null);

  const {
    query,
    setQuery,
    results,
    highlightedDates,
    clearSearch,
    isSearching,
  } = useSearchEngine(dailyLogs, monthlyLogs);

  const handleDateSelect = useCallback((date: Date | null) => {
    setSelectedDate(date);
  }, []);

  const handleClearSelect = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handleSearchResultClick = useCallback((result: SearchResult) => {
    setCurrentMonth(result.targetDate);
    calendarRef.current?.goToMonth(result.targetDate);
    if (result.type === 'date-note') {
      setSelectedDate(result.targetDate);
    }
    clearSearch();
  }, [clearSearch]);

  // Jump the actual calendar grid to today's month
  const handleGoToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    calendarRef.current?.goToMonth(today);
  }, []);

  useKeyBinds({
    onPrevMonth: () => {
      const prev = new Date(currentMonth);
      prev.setMonth(prev.getMonth() - 1);
      setCurrentMonth(prev);
      calendarRef.current?.goToMonth(prev);
    },
    onNextMonth: () => {
      const next = new Date(currentMonth);
      next.setMonth(next.getMonth() + 1);
      setCurrentMonth(next);
      calendarRef.current?.goToMonth(next);
    },
    onGoToToday: handleGoToToday,
    onFocusSearch: () => {
      document.getElementById('calendar-search-input')?.focus();
    },
    onOpenSidebar: () => {
      // Create a custom event to tell the sidebar to open/toggle, or manage state here
      window.dispatchEvent(new CustomEvent('toggle-dailyLogs-sidebar'));
    },
    onClosePanels: () => {
      handleClearSelect();
      window.dispatchEvent(new CustomEvent('close-panels'));
    }
  });

  return (
    <main className="min-h-screen w-full relative overflow-x-hidden bg-background pb-12">
      {/* Background Ambient Gradient */}
      <div className="fixed inset-0 z-[-1] animate-ambient bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 opacity-60" />

      {/* Section: Fixed Controls */}
      <MonthlyDrawer
        currentMonth={currentMonth}
        onGoToToday={handleGoToToday}
        onDateClick={(date: Date) => {
          setCurrentMonth(date);
          calendarRef.current?.goToMonth(date);
          handleDateSelect(date);
        }}
      />

      <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50">
        <DarkModeSwitch />
      </div>

      {/* Section: Top Search Bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:top-8">
        <GlobalSearch
          query={query}
          onQueryChange={setQuery}
          results={results}
          onResultClick={handleSearchResultClick}
          onClear={clearSearch}
          isSearching={isSearching}
        />
      </div>

      {/* Section: Main Content */}
      <div className="flex h-full w-full max-w-container mx-auto items-center justify-center p-4 pt-20 md:p-8 md:pt-24 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-5xl"
        >
          <ScheduleWidget
            ref={calendarRef}
            onDateSelect={handleDateSelect}
            onClearSelect={handleClearSelect}
            onMonthChange={setCurrentMonth}
            highlightedDates={highlightedDates}
          />

          {/* Summary Panel — compact insight cards below the calendar */}
          <MetricsBar currentMonth={currentMonth} />
        </motion.div>
      </div>

      {/* Section: Unified Inspector Panel */}
      <AnimatePresence>
        {selectedDate && (
          <DetailSidebar
            selectedDate={selectedDate}
            selectedPeriods={selectedPeriods}
            onClose={handleClearSelect}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

export default Home;