export interface TimePeriod {
  start: Date | null;
  end: Date | null;
}

export interface DailyLog {
  id: string;
  date: Date;
  content: string;
}

// Section: Event System 

export type ItemCategory = 'work' | 'personal' | 'health' | 'education' | 'other';
export type ItemPriority = 'low' | 'medium' | 'high';

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  category: ItemCategory;
  priority: ItemPriority;
}

/** Color mapping per category — used by ItemChip and calendar dots */
export const ITEM_COLORS: Record<ItemCategory, string> = {
  work: '#6366f1',      // indigo
  personal: '#ec4899',  // pink
  health: '#10b981',    // emerald
  education: '#f59e0b', // amber
  other: '#8b5cf6',     // violet
};

export type ViewMode = 'month' | 'week';
