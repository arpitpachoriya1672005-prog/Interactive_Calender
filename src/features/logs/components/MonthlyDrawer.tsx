'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { format } from 'date-fns';
import { PanelLeftOpen, PanelLeftClose, StickyNote, Check, CalendarCheck, Calendar } from 'lucide-react';
import { useGlobalStore } from '@/core/store/GlobalStore';
import { MiniSchedule } from '@/features/schedule/components/MiniSchedule';

interface MonthNotesSidebarProps {
  currentMonth: Date;
  onGoToToday?: () => void;
  onDateClick?: (date: Date) => void;
}

/**
 * A collapsible sidebar that stores free-form dailyLogs per month.
 * 
 * Why month-level granularity instead of per-date?
 * Month dailyLogs capture high-level planning — goals, deadlines, reminders —
 * while the existing date-click NotesPanel handles day-specific items.
 * This avoids overlapping concerns and keeps both panels useful.
 */
export const MonthlyDrawer = ({ currentMonth, onGoToToday, onDateClick }: MonthNotesSidebarProps) => {
  const { monthlyLogs, setMonthlyLog, calendarItems, isHydrated } = useGlobalStore();
  const [isOpen, setIsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive the storage key from the active month (e.g. "2026-04")
  const monthKey = format(currentMonth, 'yyyy-MM');
  const monthLabel = format(currentMonth, 'MMMM yyyy');
  const currentNote = monthlyLogs[monthKey] || '';

  // Auto-focus the textarea when the sidebar opens for immediate typing
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Small delay so framer-motion finishes the slide animation first
      const timer = setTimeout(() => textareaRef.current?.focus(), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Debounced save — writes to context (which persists to localStorage)
  // 500ms delay prevents thrashing on every keystroke
  const handleNoteChange = useCallback((value: string) => {
    setSaveStatus('saving');

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setMonthlyLog(monthKey, value);
      setSaveStatus('saved');

      // Reset the "Saved" indicator after a moment so it doesn't linger forever
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  }, [monthKey, setMonthlyLog]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Desktop sidebar animation — slides in from the left
  const sidebarVariants: Variants = {
    closed: { 
      width: 0, 
      opacity: 0,
      transition: { type: 'spring' as const, damping: 25, stiffness: 200 }
    },
    open: { 
      width: 340, 
      opacity: 1,
      transition: { type: 'spring' as const, damping: 25, stiffness: 200 }
    },
  };

  // Mobile overlay — slides up as a bottom sheet
  const mobileOverlayVariants: Variants = {
    closed: { y: '100%', opacity: 0 },
    open: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring' as const, damping: 30, stiffness: 250 }
    },
  };

  if (!isHydrated) return null;

  return (
    <>
      {/* Section: Toggle Button  */}
      {/* Always visible — pinned to the left edge so the user can find it regardless of scroll */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 md:top-8 md:left-8 z-50 p-2.5 md:p-3 rounded-xl glass hover:bg-white/20 transition-all hover:scale-105 active:scale-95 group"
        whileTap={{ scale: 0.9 }}
        aria-label={isOpen ? 'Close dailyLogs sidebar' : 'Open dailyLogs sidebar'}
        title={isOpen ? 'Close dailyLogs sidebar' : 'Open dailyLogs sidebar'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <PanelLeftClose className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <PanelLeftOpen className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Section: Desktop Sidebar  */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="desktop-sidebar"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col overflow-hidden"
          >
            <div className="h-full w-[340px] glass border-r border-white/10 flex flex-col">
              {/* Sidebar Header */}
              <div className="p-6 pt-20 border-b border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <StickyNote className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-heading font-bold text-foreground tracking-tight">
                      Monthly Notes
                    </h2>
                  </div>
                  {/* Jump-to-today shortcut */}
                  <button
                    onClick={onGoToToday}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                      bg-primary/10 text-primary hover:bg-primary/20
                      transition-all active:scale-95"
                    title="Go to today"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    Today
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {monthLabel}
                </p>
              </div>

              {/* Mini Calendar */}
              <div className="p-5 pb-0">
                <MiniSchedule
                  currentMonth={currentMonth}
                  selectedDate={currentMonth} 
                  onDateClick={(d) => onDateClick?.(d)}
                  calendarItems={calendarItems}
                />
              </div>

              {/* Notes Content */}
              <div className="flex-1 flex flex-col p-5 overflow-hidden">
                <textarea
                  ref={textareaRef}
                  defaultValue={currentNote}
                  key={monthKey} // Re-mount when month changes to reset defaultValue
                  onChange={(e) => handleNoteChange(e.target.value)}
                  placeholder="Write dailyLogs for this month..."
                  className="flex-1 w-full bg-transparent text-foreground placeholder:text-muted-foreground/50
                    text-sm leading-relaxed resize-none outline-none
                    custom-scrollbar rounded-xl p-3
                    border border-white/5 focus:border-primary/30
                    transition-colors duration-300"
                  spellCheck={true}
                />

                {/* Save Status Indicator */}
                <AnimatePresence>
                  {saveStatus !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-1.5 mt-3 text-xs"
                    >
                      {saveStatus === 'saving' ? (
                        <span className="text-muted-foreground">Saving...</span>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Saved</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Section: Mobile Bottom Sheet  */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Scrim overlay — tapping it closes the sheet */}
            <motion.div
              key="mobile-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />

            <motion.div
              key="mobile-sheet"
              variants={mobileOverlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden fixed left-0 right-0 bottom-0 z-50 max-h-[65vh] rounded-t-3xl overflow-hidden"
            >
              <div className="glass border-t border-white/10 h-full flex flex-col">
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Sheet Header */}
                <div className="px-5 pb-3 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StickyNote className="w-4 h-4 text-primary" />
                      <h2 className="text-base font-heading font-bold text-foreground">
                        Monthly Notes
                      </h2>
                    </div>
                    <button
                      onClick={onGoToToday}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                        bg-primary/10 text-primary hover:bg-primary/20
                        transition-all active:scale-95"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      Today
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {monthLabel}
                  </p>
                </div>

                {/* Mini Calendar - Mobile */}
                <div className="p-4 pb-0">
                  <MiniSchedule
                    currentMonth={currentMonth}
                    selectedDate={currentMonth} 
                    onDateClick={(d) => onDateClick?.(d)}
                    calendarItems={calendarItems}
                  />
                </div>

                {/* Sheet Content */}
                <div className="flex-1 flex flex-col p-4 overflow-hidden">
                  <textarea
                    defaultValue={currentNote}
                    key={`mobile-${monthKey}`}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    placeholder="Write dailyLogs for this month..."
                    className="flex-1 w-full bg-transparent text-foreground placeholder:text-muted-foreground/50
                      text-sm leading-relaxed resize-none outline-none
                      custom-scrollbar rounded-xl p-3 min-h-[200px]
                      border border-white/5 focus:border-primary/30
                      transition-colors duration-300"
                    spellCheck={true}
                  />

                  {/* Save Status */}
                  <AnimatePresence>
                    {saveStatus !== 'idle' && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-1.5 mt-2 text-xs"
                      >
                        {saveStatus === 'saving' ? (
                          <span className="text-muted-foreground">Saving...</span>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Saved</span>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
