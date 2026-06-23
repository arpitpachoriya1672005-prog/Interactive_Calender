'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/core/utils/classNames';
import { useRipple, RippleEffect } from '@/shared/components/RippleEffect';
import { useCursorMagnet } from '@/core/hooks/useCursorMagnet';
import { ScheduleItem, ITEM_COLORS } from '@/core/models/ScheduleTypes';

interface CalendarDayProps {
  date: Date;
  isSameMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isFinalRange: boolean;
  isPreviewRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  onClick: () => void;
  onHover: (date: Date | null) => void;
  holiday?: string;
  /** When true, renders a subtle glow ring to mark this cell as a search match */
  isHighlighted?: boolean;
  onPointerDown?: () => void;
  onPointerEnter?: () => void;
  calendarItems?: ScheduleItem[];
}

export function DayTile({
  date,
  isSameMonth,
  isToday,
  isSelected,
  isFinalRange,
  isPreviewRange,
  isRangeStart,
  isRangeEnd,
  onClick,
  onHover,
  holiday,
  isHighlighted = false,
  onPointerDown,
  onPointerEnter,
  calendarItems = [],
}: CalendarDayProps) {
  const { ripples, addRipple, removeRipple } = useRipple();
  
  // We disable magnetic hover for middle-range segments to preserve the contiguous background pill boundary.
  const isMiddleRange = (isFinalRange || isPreviewRange) && !isRangeStart && !isRangeEnd;
  
  const { 
    ref, 
    isHovered, 
    x, y, scale, 
    handleMouseMove, handleMouseEnter, handleMouseLeave 
  } = useCursorMagnet(!isMiddleRange);

  const propagateMouseEnter = () => {
    handleMouseEnter();
    onHover(date);
    onPointerEnter?.();
  };

  const propagateMouseLeave = () => {
    handleMouseLeave();
    onHover(null);
  };

  const handlePointerDownEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    addRipple(e);
    onPointerDown?.();
  };

  return (
    <motion.div
      ref={ref}
      style={{
        x, y, scale,
        zIndex: isHovered ? 50 : (isRangeStart || isRangeEnd ? 20 : 10),
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={propagateMouseEnter}
      onMouseLeave={propagateMouseLeave}
      onMouseDown={handlePointerDownEvent}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={holiday}
      className={cn(
        'relative h-14 md:h-cell w-full flex items-center justify-center cursor-pointer transition-colors duration-300 text-sm md:text-lg lg:text-2xl font-medium outline-none group',
        // Subtle magnetic shadow
        isHovered && !isMiddleRange && 'shadow-float shadow-primary/20',
        // Default standalone styling
        !isFinalRange && !isPreviewRange && 'rounded-xl',
        (isHovered && !isFinalRange && !isPreviewRange) && 'bg-primary/10',
        // Outside active month display
        isSameMonth ? 'text-foreground' : 'text-foreground/20',
        // Active 'Today' highlight
        isToday && 'text-primary font-bold bg-primary/5 ring-1 ring-inset ring-primary/20',
        
        // finalized selected range block styling
        isFinalRange && [
          'bg-gradient-to-r from-primary/20 to-primary/5 text-primary-foreground',
          isRangeStart ? 'rounded-l-full' : 'rounded-l-none',
          isRangeEnd ? 'rounded-r-full' : 'rounded-r-none',
          !isRangeStart && !isRangeEnd && 'rounded-none'
        ],
        
        // user actively hovering to form a range styling
        isPreviewRange && [
          'bg-primary/5 border-y border-dashed border-primary/20 text-primary-foreground/70',
          isRangeStart ? 'rounded-l-full border-l' : 'rounded-l-none',
          isRangeEnd ? 'rounded-r-full border-r' : 'rounded-r-none',
          !isRangeStart && !isRangeEnd && 'rounded-none'
        ],
        
        // Exact selected boundaries highlight layer
        (isRangeStart || isRangeEnd) && 'bg-primary text-primary-foreground shadow-glow rounded-full gradient-border-animated',
        // Search highlight — pulsing glow to draw the eye without being intrusive
        isHighlighted && 'ring-2 ring-primary/60 shadow-glow-sm'
      )}
    >
      <RippleEffect ripples={ripples} onClear={removeRipple} />

      {isToday && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full shadow-glow-sm z-20" />
      )}
      
      {holiday && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary rounded-full z-20" />
      )}
      
      <span className="relative z-20">{format(date, 'd')}</span>

      {calendarItems.length > 0 && (
        <div className="absolute bottom-1 w-full flex justify-center gap-0.5 z-20">
          {calendarItems.slice(0, 3).map((e, idx) => (
            <span
              key={e.id || idx}
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: ITEM_COLORS[e.category] || '#6366f1' }}
            />
          ))}
          {calendarItems.length > 3 && <span className="w-1 h-1 rounded-full bg-foreground/50" />}
        </div>
      )}
    </motion.div>
  );
}
