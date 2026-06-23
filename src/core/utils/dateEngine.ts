import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  areIntervalsOverlapping
} from 'date-fns';
import { TimePeriod } from '@/core/models/ScheduleTypes';

/**
 * Generates an array of days to display in a calendar grid.
 * includes padding days from previous and next months to ensure 
 * the grid always starts on Sunday and ends on Saturday.
 */
export const getCalendarGrid = (date: Date) => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
  
  return eachDayOfInterval({ start, end });
}

/**
 * Checks if a date falls within a selected range.
 */
export const isDateInRange = (date: Date, start: Date | null, end: Date | null) => {
  if (!start || !end) return false;
  
  // Sort dates to handle backward selection
  const rangeStart = start < end ? start : end;
  const rangeEnd = start < end ? end : start;
  
  return isWithinInterval(date, { start: rangeStart, end: rangeEnd });
}

/**
 * Checks if a specific date is one of the boundaries of a selection.
 */
export function isDateSelected(date: Date, start: Date | null, end: Date | null): boolean {
  return !!(
    (start && isSameDay(date, start)) ||
    (end && isSameDay(date, end))
  );
}

/**
 * Checks if a new range overlaps with any existing selectedPeriods.
 */
export function checkRangeOverlap(newRangeStart: Date, newRangeEnd: Date, existingRanges: TimePeriod[]): boolean {
  const newStart = newRangeStart < newRangeEnd ? newRangeStart : newRangeEnd;
  const newEnd = newRangeStart < newRangeEnd ? newRangeEnd : newRangeStart;

  for (const range of existingRanges) {
    if (!range.start || !range.end) continue;
    
    const rStart = range.start < range.end ? range.start : range.end;
    const rEnd = range.start < range.end ? range.end : range.start;

    if (areIntervalsOverlapping(
      { start: newStart, end: newEnd }, 
      { start: rStart, end: rEnd }, 
      { inclusive: true }
    )) {
      return true;
    }
  }
  return false;
}
