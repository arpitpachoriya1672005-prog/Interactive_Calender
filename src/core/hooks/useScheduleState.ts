'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  addMonths, 
  subMonths, 
  startOfMonth, 
  isSameMonth, 
  isToday,
  isSameDay,
  format
} from 'date-fns';
import { TimePeriod } from '@/core/models/ScheduleTypes';
import { getCalendarGrid, isDateSelected, isDateInRange, checkRangeOverlap } from '@/core/utils/dateEngine';
import { useGlobalStore } from '@/core/store/GlobalStore';

export const useScheduleState = (initialDate = new Date()) => {
  const { selectedPeriods, setSelectedPeriods } = useGlobalStore();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialDate));
  const [view, setView] = useState<'month' | 'week'>('month');
  
  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragHasMoved, setDragHasMoved] = useState(false);
  const [dragOrigin, setDragOrigin] = useState<Date | null>(null);
  
  // The range currently being drawn
  const [activeRange, setActiveRange] = useState<TimePeriod>({ start: null, end: null });
  
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState(0);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Clear conflict warnings after a few seconds
  useEffect(() => {
    if (conflictWarning) {
      const timer = setTimeout(() => setConflictWarning(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [conflictWarning]);

  const nextMonth = () => {
    setDirection(1);
    // If in week view, we might navigate weekly, but for simplicity we'll keep month navigation for both 
    // or just change the month, which triggers week update locally.
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const days = useMemo(() => getCalendarGrid(currentMonth), [currentMonth]);

  const handlePointerDown = (date: Date) => {
    setConflictWarning(null);
    setIsDragging(true);
    setDragHasMoved(false);
    setDragOrigin(date);
    setHoveredDate(date);
  };

  const handlePointerEnter = (date: Date) => {
    setHoveredDate(date);
    if (isDragging && dragOrigin) {
      if (!dragHasMoved && date.getTime() !== dragOrigin.getTime()) {
        setDragHasMoved(true);
        if (!activeRange.start) {
          setActiveRange({ start: dragOrigin, end: null });
        }
      }
    }
  };

  const handlePointerUp = () => {
    if (isDragging && activeRange.start && hoveredDate && dragHasMoved) {
      if (checkRangeOverlap(activeRange.start, hoveredDate, selectedPeriods)) {
        setConflictWarning("You already have something planned here");
      } else {
        const start = activeRange.start < hoveredDate ? activeRange.start : hoveredDate;
        const end = activeRange.start < hoveredDate ? hoveredDate : activeRange.start;
        const newRanges = [...selectedPeriods, { start, end }];
        setSelectedPeriods(newRanges);
      }
      setActiveRange({ start: null, end: null });
    }
    setIsDragging(false);
    setDragOrigin(null);
  };

  // Backwards compatibility for single clicks or click-to-click range selection
  const handleDateClick = (date: Date) => {
    if (dragHasMoved) {
      setDragHasMoved(false);
      return; // Ignore click triggered by releasing a drag
    }

    setConflictWarning(null);

    // Initial click to start selection
    if (!activeRange.start) {
      if (checkRangeOverlap(date, date, selectedPeriods)) {
        setConflictWarning("You already have something planned here");
        return;
      }
      setActiveRange({ start: date, end: null });
    } 
    // Second click to finish selection
    else {
      if (checkRangeOverlap(activeRange.start, date, selectedPeriods)) {
        setConflictWarning("You already have something planned here");
        return;
      }
      const newRanges = [...selectedPeriods, { 
        start: activeRange.start < date ? activeRange.start : date, 
        end: activeRange.start < date ? date : activeRange.start 
      }];
      setSelectedPeriods(newRanges);
      setActiveRange({ start: null, end: null });
    }
  };

  const isFinalRange = (date: Date) => {
    return selectedPeriods.some(range => isDateInRange(date, range.start, range.end));
  };

  const isPreviewRange = (date: Date) => {
    if (activeRange.start && !activeRange.end && hoveredDate) {
      return isDateInRange(date, activeRange.start, hoveredDate);
    }
    return false;
  };

  const isSelected = (date: Date) => 
    selectedPeriods.some(range => isDateSelected(date, range.start, range.end)) ||
    isDateSelected(date, activeRange.start, activeRange.end);

  const isRangeStart = (date: Date): boolean => {
    if (activeRange.start && format(date, 'yyyy-MM-dd') === format(activeRange.start, 'yyyy-MM-dd')) return true;
    return selectedPeriods.some(r => r.start && format(r.start, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  };

  const isRangeEnd = (date: Date): boolean => {
    if (activeRange.end && format(date, 'yyyy-MM-dd') === format(activeRange.end, 'yyyy-MM-dd')) return true;
    return selectedPeriods.some(r => r.end && format(r.end, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  };

  const clearSelections = () => {
    setSelectedPeriods([]);
    setActiveRange({ start: null, end: null });
    setConflictWarning(null);
  };

  // Allow external navigation — e.g. the "Today" button in the sidebar
  const goToMonth = (date: Date) => {
    setDirection(0);
    setCurrentMonth(startOfMonth(date));
  };

  return {
    currentMonth,
    days,
    nextMonth,
    prevMonth,
    direction,
    selectedPeriods,
    activeRange,
    setSelectedPeriods,
    handleDateClick,
    handlePointerDown,
    handlePointerEnter,
    handlePointerUp,
    isDragging,
    isFinalRange,
    isPreviewRange,
    isSelected,
    isRangeStart,
    isRangeEnd,
    clearSelections,
    isSameMonth: (date: Date) => isSameMonth(date, currentMonth),
    isToday,
    setHoveredDate,
    hoveredDate,
    conflictWarning,
    goToMonth,
    view,
    setView
  };
}
