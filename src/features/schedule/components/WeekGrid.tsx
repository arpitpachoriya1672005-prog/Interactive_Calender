'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay, isToday as checkIsToday } from 'date-fns';
import { ScheduleItem, ITEM_COLORS } from '@/core/models/ScheduleTypes';
import { cn } from '@/core/utils/classNames';

interface WeekViewProps {
  currentMonth: Date;
  calendarItems: ScheduleItem[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: ScheduleItem) => void;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

/**
 * A 7-column week view with time slots.
 *
 * We show the week containing the 1st of the current month
 * (or the current date if viewing the present month).
 * Hourly rows provide a time-based layout for calendarItems.
 */
export const WeekGrid = ({ currentMonth, calendarItems, onDateClick, onEventClick }: WeekViewProps) => {
  const weekStart = useMemo(() => {
    // If we're viewing the current month, center on today. Otherwise, use 1st of month.
    const referenceDate = checkIsToday(currentMonth) ? new Date() : currentMonth;
    return startOfWeek(referenceDate, { weekStartsOn: 0 });
  }, [currentMonth]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Group calendarItems by day key for fast lookup
  const eventsByDay = useMemo(() => {
    const map: Record<string, ScheduleItem[]> = {};
    calendarItems.forEach(e => {
      const key = format(e.date, 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [calendarItems]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Day Headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-white/5">
        <div className="p-2" /> {/* spacer for time column */}
        {weekDays.map(day => {
          const isCurrentDay = checkIsToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={cn(
                'p-3 text-center border-l border-white/5 hover:bg-primary/5 transition-colors',
                isCurrentDay && 'bg-primary/10'
              )}
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                {format(day, 'EEE')}
              </p>
              <p className={cn(
                'text-lg font-bold mt-0.5',
                isCurrentDay ? 'text-primary' : 'text-foreground'
              )}>
                {format(day, 'd')}
              </p>
            </button>
          );
        })}
      </div>

      {/* Time Grid */}
      <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
        {HOURS.map(hour => (
          <div
            key={hour}
            className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[52px] border-b border-white/5 last:border-b-0"
          >
            {/* Time label */}
            <div className="p-2 text-[10px] text-muted-foreground/60 font-medium text-right pr-3 pt-1">
              {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </div>

            {/* Day columns */}
            {weekDays.map(day => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDay[dayKey] || [];
              return (
                <div
                  key={`${hour}-${dayKey}`}
                  onClick={() => onDateClick(day)}
                  className="border-l border-white/5 p-1 hover:bg-primary/5 cursor-pointer transition-colors relative"
                >
                  {/* Show calendarItems in the first hour slot to keep things clean */}
                  {hour === 7 && dayEvents.map(ev => (
                    <button
                      key={ev.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                      className="w-full text-left text-[9px] font-medium px-1.5 py-1 rounded mb-0.5 truncate"
                      style={{
                        backgroundColor: `${ITEM_COLORS[ev.category]}20`,
                        color: ITEM_COLORS[ev.category],
                      }}
                    >
                      {ev.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
