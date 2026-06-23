'use client';

import { ScheduleItem, ITEM_COLORS } from '@/core/models/ScheduleTypes';

interface EventCardProps {
  event: ScheduleItem;
  compact?: boolean;
}

/**
 * A color-coded event chip.
 * "compact" mode renders a single-line dot+title for inside calendar cells.
 * Full mode shows more detail for lists/panels.
 */
export const ItemChip = ({ event, compact = false }: EventCardProps) => {
  const color = ITEM_COLORS[event.category];

  if (compact) {
    return (
      <div
        className="flex items-center gap-1 text-[9px] md:text-[10px] leading-tight px-1 py-0.5 rounded truncate max-w-full"
        style={{ backgroundColor: `${color}20`, color }}
        title={event.title}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="truncate font-medium">{event.title}</span>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl border border-white/5 bg-white/[0.04] hover:bg-white/[0.08] transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-foreground truncate">{event.title}</span>
        <span
          className="ml-auto text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {event.priority}
        </span>
      </div>
      {event.description && (
        <p className="text-xs text-muted-foreground/70 leading-relaxed pl-4 line-clamp-2">
          {event.description}
        </p>
      )}
    </div>
  );
}
