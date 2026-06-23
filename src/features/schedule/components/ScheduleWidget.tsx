'use client';
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

import { useScheduleState } from '@/core/hooks/useScheduleState';
import { ScheduleHeader } from './ScheduleHeader';
import { MonthGrid } from './MonthGrid';
import { WeekGrid } from './WeekGrid';
import { ItemDialog } from '@/features/items/components/ItemDialog';
import { ToastAlert } from '@/shared/components/ToastAlert';
import { RangeFooter } from '@/shared/components/RangeFooter';
import { motion, AnimatePresence } from 'framer-motion';

import { MONTH_THEMES } from '@/core/utils/themeConfig';
import { usePalette } from '@/core/hooks/usePalette';
import { useGlobalStore } from '@/core/store/GlobalStore';
import { ScheduleItem } from '@/core/models/ScheduleTypes';

interface CalendarContainerProps {
  onDateSelect?: (date: Date | null) => void;
  onClearSelect?: () => void;
  onMonthChange?: (date: Date) => void;
  highlightedDates?: Set<string>;
}

export interface CalendarContainerRef {
  goToMonth: (date: Date) => void;
}

/**
 * The master orchestration layout for the calendar. 
 * We intentionally keep complex logic segregated into custom hooks (like usePalette, useScheduleState)
 * to ensure this file focuses strictly on the visual composition sequence (Header -> Grid -> Footer).
 */
export const ScheduleWidget = forwardRef<CalendarContainerRef, CalendarContainerProps>(
  function ScheduleWidget({ onDateSelect, onClearSelect, onMonthChange, highlightedDates }, ref) {
  const { calendarItems, appendItem, modifyItem, deleteItem } = useGlobalStore();
  
  const [eventModalDate, setEventModalDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<ScheduleItem | undefined>(undefined);

  const {
    currentMonth,
    days,
    nextMonth,
    prevMonth,
    direction,
    selectedPeriods,
    activeRange,
    handleDateClick: baseHandleDateClick,
    isFinalRange,
    isPreviewRange,
    isSelected,
    isRangeStart,
    isRangeEnd,
    isSameMonth,
    isToday,
    setHoveredDate,
    clearSelections,
    conflictWarning,
    goToMonth,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    view,
    setView
  } = useScheduleState();

  // Expose goToMonth to parent via ref
  useImperativeHandle(ref, () => ({ goToMonth }), [goToMonth]);

  useEffect(() => {
    onMonthChange?.(currentMonth);
  }, [currentMonth, onMonthChange]);

  const handleDateClick = (date: Date) => {
    baseHandleDateClick(date);
    onDateSelect?.(date);
  };

  const activeMonthIndex = currentMonth.getMonth();
  const theme = MONTH_THEMES[activeMonthIndex];
  
  // Real-time extraction of dominant accent color from the hero image
  const dynamicThemeColor = usePalette(theme.image, theme.primary);

  return (
    <div 
      className="w-full space-y-2 transition-colors duration-1000"
      style={{ 
        // We inject physical variables rather than React Context here so Tailwind CSS `bg-primary` seamlessly inherits it implicitly.
        '--primary-color': dynamicThemeColor,
        '--primary-hover-color': dynamicThemeColor 
      } as React.CSSProperties}
    >
      <div className="relative">
        {/* Soft background ambient occlusion layer backing the main card */}
        <div className="absolute inset-0 bg-black/40 blur-3xl -z-10 rounded-full opacity-50" />
        
        <div className="bg-white/5 rounded-3xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm relative group">
          <ScheduleHeader 
            currentMonth={currentMonth}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            themeImage={theme.image}
            view={view}
            onViewChange={setView}
          />

          {/* Perspective wrapper isolates the 3D spring transition from flat components */}
          <div className="relative [perspective:2000px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentMonth.toISOString()}
                custom={direction}
                initial={{ 
                  x: direction * 50, 
                  opacity: 0, 
                  rotateY: direction * 15,
                  scale: 0.95,
                  z: -100
                }}
                animate={{ 
                  x: 0, 
                  opacity: 1, 
                  rotateY: 0,
                  scale: 1,
                  z: 0
                }}
                exit={{ 
                  x: -direction * 50, 
                  opacity: 0, 
                  rotateY: -direction * 15,
                  scale: 0.95,
                  z: -100
                }}
                transition={{ 
                  type: "spring", 
                  damping: 30, 
                  stiffness: 150, 
                  mass: 0.8 
                }}
                className="w-full h-full relative z-10"
              >
                {/* Visual shadow simulating depth exclusively during page rotations */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/10 pointer-calendarItems-none z-20"
                />
                
                {view === 'month' ? (
                  <MonthGrid 
                    currentMonth={currentMonth}
                    days={days}
                    handleDateClick={handleDateClick}
                    isFinalRange={isFinalRange}
                    isPreviewRange={isPreviewRange}
                    isSelected={isSelected}
                    isRangeStart={isRangeStart}
                    isRangeEnd={isRangeEnd}
                    isSameMonth={isSameMonth}
                    isToday={isToday}
                    setHoveredDate={setHoveredDate}
                    handlePointerDown={handlePointerDown}
                    handlePointerEnter={handlePointerEnter}
                    handlePointerUp={handlePointerUp}
                    highlightedDates={highlightedDates}
                  />
                ) : (
                  <WeekGrid 
                    currentMonth={currentMonth}
                    calendarItems={calendarItems}
                    onDateClick={(date) => {
                      setEventModalDate(date);
                      setEditingEvent(undefined);
                    }}
                    onEventClick={(event) => {
                      setEventModalDate(event.date);
                      setEditingEvent(event);
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        <ToastAlert key="toast" message={conflictWarning} />
      </AnimatePresence>

      <AnimatePresence>
        <RangeFooter 
          key="footer"
          selectedPeriods={selectedPeriods} 
          activeRange={activeRange} 
          onClear={() => {
            clearSelections();
            onClearSelect?.();
          }} 
        />
      </AnimatePresence>
      <AnimatePresence>
        {eventModalDate && (
          <ItemDialog
            date={eventModalDate}
            existingEvent={editingEvent}
            onSave={(event) => {
              if (editingEvent) modifyItem(event);
              else appendItem(event);
            }}
            onDelete={deleteItem}
            onClose={() => setEventModalDate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
});
