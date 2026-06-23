'use client';

import { motion } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { DayTile } from './DayTile';
import { FrostCard } from '@/shared/components/FrostCard';
import { HOLIDAYS } from '@/core/utils/themeConfig';
import { ScheduleItem } from '@/core/models/ScheduleTypes';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarGridProps {
  currentMonth: Date;
  days: Date[];
  calendarItems?: ScheduleItem[];
  handleDateClick: (date: Date) => void;
  isFinalRange: (date: Date) => boolean;
  isPreviewRange: (date: Date) => boolean;
  isSelected: (date: Date) => boolean;
  isRangeStart: (date: Date) => boolean;
  isRangeEnd: (date: Date) => boolean;
  isSameMonth: (date: Date) => boolean;
  isToday: (date: Date) => boolean;
  setHoveredDate: (date: Date | null) => void;
  handlePointerDown: (date: Date) => void;
  handlePointerEnter: (date: Date) => void;
  handlePointerUp: () => void;
  /** Set of 'yyyy-MM-dd' strings from search results to glow on the grid */
  highlightedDates?: Set<string>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02, // Increased for a visible staggered effect
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function MonthGrid({
  currentMonth,
  days,
  calendarItems = [],
  handleDateClick,
  isFinalRange,
  isPreviewRange,
  isSelected,
  isRangeStart,
  isRangeEnd,
  isSameMonth,
  isToday,
  setHoveredDate,
  handlePointerDown,
  handlePointerEnter,
  handlePointerUp,
  highlightedDates,
}: CalendarGridProps) {
  return (
    <FrostCard 
      className="border-0 rounded-none bg-transparent select-none touch-none"
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchEnd={handlePointerUp}
      onTouchCancel={handlePointerUp}
    >
      <div className="grid grid-cols-7 gap-1 mb-4">
        {WEEKDAYS.map((day) => (
          <div key={day} className="h-10 md:h-[4vh] flex items-center justify-center text-[10px] md:text-sm lg:text-base font-bold text-muted-foreground uppercase tracking-[0.2em]">
            {day}
          </div>
        ))}
      </div>

      <motion.div 
        key={format(currentMonth, 'yyyy-MM')}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-7 gap-1"
      >
        {days.map((day) => {
          // get all calendarItems for this day
          const dayEvents = calendarItems.filter(e => {
            // Very simple same day check, doesn't check cross-day bounds fully
            return isSameDay(e.date, day);
          });

          return (
            <motion.div key={day.toString()} variants={itemVariants}>
              <DayTile
                date={day}
                isSameMonth={isSameMonth(day)}
                isToday={isToday(day)}
                isSelected={isSelected(day)}
                isFinalRange={isFinalRange(day)}
                isPreviewRange={isPreviewRange(day)}
                isRangeStart={isRangeStart(day)}
                isRangeEnd={isRangeEnd(day)}
                onClick={() => handleDateClick(day)}
                onHover={setHoveredDate}
                onPointerDown={() => handlePointerDown(day)}
                onPointerEnter={() => handlePointerEnter(day)}
                holiday={HOLIDAYS[format(day, 'MM-dd')]}
                isHighlighted={highlightedDates?.has(format(day, 'yyyy-MM-dd'))}
                calendarItems={dayEvents}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </FrostCard>
  );
}
