import { TimePeriod, DailyLog, ScheduleItem } from '@/core/models/ScheduleTypes';

export interface AppState {
  theme: 'light' | 'dark' | null;
  selectedPeriods: TimePeriod[];
  dailyLogs: DailyLog[];
  monthlyLogs?: Record<string, string>;
  calendarItems?: ScheduleItem[];
}

const STORAGE_KEY = 'calendar_app_state';

const defaultState: AppState = {
  theme: null,
  selectedPeriods: [],
  dailyLogs: [],
  monthlyLogs: {},
  calendarItems: [],
};

export function getAppState(): AppState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    
    return {
      theme: parsed.theme || null,
      selectedPeriods: Array.isArray(parsed.selectedPeriods) ? parsed.selectedPeriods.map((r: any) => ({
        start: r.start ? new Date(r.start) : null,
        end: r.end ? new Date(r.end) : null
      })) : [],
      dailyLogs: Array.isArray(parsed.dailyLogs) ? parsed.dailyLogs.map((n: any) => ({
        ...n,
        date: new Date(n.date)
      })) : [],
      monthlyLogs: parsed.monthlyLogs || {},
      calendarItems: Array.isArray(parsed.calendarItems) ? parsed.calendarItems.map((e: any) => ({
        ...e,
        date: new Date(e.date),
        endDate: e.endDate ? new Date(e.endDate) : undefined,
      })) : [],
    };
  } catch (e) {
    console.error("Failed to parse app state", e);
    return defaultState;
  }
}

export const updateAppState = (updates: Partial<AppState>) => {
  if (typeof window === 'undefined') return;
  const current = getAppState();
  const nextState = { ...current, ...updates };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch (e) {
    console.error("Failed to save app state", e);
  }
}
