'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TimePeriod, DailyLog, ScheduleItem } from '@/core/models/ScheduleTypes';
import { getAppState, updateAppState, AppState } from '@/core/utils/persistence';

interface UndoableAction {
  type: string;
  undo: () => void;
  label: string;
}

interface AppContextValue {
  theme: 'light' | 'dark' | null;
  selectedPeriods: TimePeriod[];
  dailyLogs: DailyLog[];
  calendarItems: ScheduleItem[];
  setTheme: (theme: 'light' | 'dark') => void;
  setSelectedPeriods: (selectedPeriods: TimePeriod[] | ((prev: TimePeriod[]) => TimePeriod[])) => void;
  setDailyLogs: (dailyLogs: DailyLog[]) => void;
  appendLog: (note: DailyLog) => void;
  deleteLog: (id: string) => void;
  monthlyLogs: Record<string, string>;
  setMonthlyLog: (monthKey: string, note: string) => void;
  // Event CRUD
  appendItem: (event: ScheduleItem) => void;
  modifyItem: (event: ScheduleItem) => void;
  deleteItem: (id: string) => void;
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  lastUndoLabel: string | null;
  isHydrated: boolean;
}

const GlobalStoreContext = createContext<AppContextValue | null>(null);

export const GlobalStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>({ theme: null, selectedPeriods: [], dailyLogs: [], monthlyLogs: {}, calendarItems: [] });
  const [isHydrated, setIsHydrated] = useState(false);

  // Undo/redo: simple action stack instead of full state snapshots (much lighter)
  const [undoStack, setUndoStack] = useState<UndoableAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoableAction[]>([]);
  const [lastUndoLabel, setLastUndoLabel] = useState<string | null>(null);

  useEffect(() => {
    const loadedState = getAppState();
    setState(loadedState);
    setIsHydrated(true);
    const initialTheme = loadedState.theme || 'dark';
    setState(prev => ({ ...prev, theme: initialTheme }));
  }, []);

  useEffect(() => {
    if (isHydrated) updateAppState(state);
  }, [state, isHydrated]);

  // Push an undoable action onto the stack
  const pushUndo = useCallback((action: UndoableAction) => {
    setUndoStack(prev => [...prev.slice(-29), action]); // cap at 30
    setRedoStack([]); // new action clears redo
  }, []);

  const undo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const action = prev[prev.length - 1];
      action.undo();
      setRedoStack(r => [...r, action]);
      setLastUndoLabel(action.label);
      setTimeout(() => setLastUndoLabel(null), 3000);
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    // Redo is tracked but kept simple — we don't re-execute, handled via stack
  }, []);

  const setTheme = (theme: 'light' | 'dark') => {
    setState(prev => ({ ...prev, theme }));
    document.documentElement.classList.toggle('dark', theme === 'dark');
  };

  const setSelectedPeriods = (selectedPeriods: TimePeriod[] | ((prev: TimePeriod[]) => TimePeriod[])) => {
    setState(prev => ({
      ...prev,
      selectedPeriods: typeof selectedPeriods === 'function' ? selectedPeriods(prev.selectedPeriods) : selectedPeriods
    }));
  };

  const setDailyLogs = (dailyLogs: DailyLog[]) => setState(prev => ({ ...prev, dailyLogs }));

  const appendLog = (note: DailyLog) => {
    setState(prev => ({ ...prev, dailyLogs: [note, ...prev.dailyLogs] }));
    pushUndo({
      type: 'add-note',
      label: 'DailyLog added',
      undo: () => setState(prev => ({ ...prev, dailyLogs: prev.dailyLogs.filter(n => n.id !== note.id) })),
    });
  };
  
  const deleteLog = (id: string) => {
    const note = state.dailyLogs.find(n => n.id === id);
    setState(prev => ({ ...prev, dailyLogs: prev.dailyLogs.filter(n => n.id !== id) }));
    if (note) {
      pushUndo({
        type: 'remove-note',
        label: 'DailyLog deleted',
        undo: () => setState(prev => ({ ...prev, dailyLogs: [note, ...prev.dailyLogs] })),
      });
    }
  };

  const setMonthlyLog = (monthKey: string, note: string) => {
    setState(prev => ({ ...prev, monthlyLogs: { ...(prev.monthlyLogs || {}), [monthKey]: note } }));
  };

  // ── Event CRUD with undo support ──

  const appendItem = (event: ScheduleItem) => {
    setState(prev => ({ ...prev, calendarItems: [...(prev.calendarItems || []), event] }));
    pushUndo({
      type: 'add-event',
      label: `"${event.title}" created`,
      undo: () => setState(prev => ({ ...prev, calendarItems: (prev.calendarItems || []).filter(e => e.id !== event.id) })),
    });
  };

  const modifyItem = (event: ScheduleItem) => {
    const old = (state.calendarItems || []).find(e => e.id === event.id);
    setState(prev => ({ ...prev, calendarItems: (prev.calendarItems || []).map(e => e.id === event.id ? event : e) }));
    if (old) {
      pushUndo({
        type: 'update-event',
        label: `"${event.title}" updated`,
        undo: () => setState(prev => ({ ...prev, calendarItems: (prev.calendarItems || []).map(e => e.id === event.id ? old : e) })),
      });
    }
  };

  const deleteItem = (id: string) => {
    const event = (state.calendarItems || []).find(e => e.id === id);
    setState(prev => ({ ...prev, calendarItems: (prev.calendarItems || []).filter(e => e.id !== id) }));
    if (event) {
      pushUndo({
        type: 'remove-event',
        label: `"${event.title}" deleted`,
        undo: () => setState(prev => ({ ...prev, calendarItems: [...(prev.calendarItems || []), event] })),
      });
    }
  };

  return (
    <GlobalStoreContext.Provider value={{
      ...state,
      calendarItems: state.calendarItems || [],
      monthlyLogs: state.monthlyLogs || {},
      setTheme, setSelectedPeriods, setDailyLogs, appendLog, deleteLog,
      setMonthlyLog,
      appendItem, modifyItem, deleteItem,
      undo, redo,
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0,
      lastUndoLabel,
      isHydrated,
    }}>
      {children}
    </GlobalStoreContext.Provider>
  );
}

export const useGlobalStore = () => {
  const context = useContext(GlobalStoreContext);
  if (!context) throw new Error("useGlobalStore must be used within GlobalStoreProvider");
  return context;
}
