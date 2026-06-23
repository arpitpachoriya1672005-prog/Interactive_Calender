'use client';

import { useMemo } from 'react';
import { format, isSameMonth, isToday, isSameDay } from 'date-fns';
import { getCalendarGrid } from '@/core/utils/dateEngine';
import { cn } from '@/core/utils/classNames';

interface MiniCalendarProps {
  currentMonth: Date;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  calendarItems?: { date: Date }[];
}

export const MiniSchedule = ({ currentMonth, selectedDate, onDateClick, calendarItems = [] }: MiniCalendarProps) => {
  const days = useMemo(() => getCalendarGrid(currentMonth), [currentMonth]);

  const hasEvent = (date: Date) => {
    return calendarItems.some(e => isSameDay(e.date, date));
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-muted-foreground uppercase">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDayToday = isToday(day);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const dayHasEvent = hasEvent(day);

          return (
            <button
              key={i}
              onClick={() => onDateClick(day)}
              className={cn(
                'relative h-8 w-full rounded-md flex items-center justify-center text-xs transition-colors',
                !isCurrentMonth && 'text-muted-foreground/30',
                isCurrentMonth && !isSelected && !isDayToday && 'hover:bg-white/10 text-foreground',
                isDayToday && !isSelected && 'text-primary font-bold bg-primary/10 ring-1 ring-primary/30',
                isSelected && 'bg-primary text-primary-foreground font-bold shadow-md'
              )}
            >
              <span>{format(day, 'd')}</span>
              {dayHasEvent && (
                <span className={cn(
                  "absolute bottom-1 w-1 h-1 rounded-full",
                  isSelected ? "bg-primary-foreground" : "bg-primary"
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
