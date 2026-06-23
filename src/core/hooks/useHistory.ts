'use client';

import { useState, useCallback } from 'react';

/**
 * Lightweight undo/redo engine.
 *
 * Why a generic hook instead of baking this into GlobalStoreProvider?
 * Undo/redo is fundamentally about tracking *snapshots* of state.
 * By keeping it generic over type T, we can apply it to any slice
 * of state (calendarItems, selectedPeriods, dailyLogs) without coupling to specific shapes.
 *
 * Usage: call `pushState(currentState)` BEFORE mutating, then the
 * user can `undo()` / `redo()` to walk the snapshot history.
 */
export function useHistory<T>(initialState: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);

  // Save a snapshot before making a change
  const pushState = useCallback((newState: T) => {
    setPast(prev => [...prev, present]);
    setPresent(newState);
    // Any new action invalidates the redo stack
    setFuture([]);
  }, [present]);

  const undo = useCallback(() => {
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    setPast(prev => prev.slice(0, -1));
    setFuture(prev => [present, ...prev]);
    setPresent(previous);
    return previous;
  }, [past, present]);

  const redo = useCallback(() => {
    if (future.length === 0) return null;
    const next = future[0];
    setFuture(prev => prev.slice(1));
    setPast(prev => [...prev, present]);
    setPresent(next);
    return next;
  }, [future, present]);

  return {
    state: present,
    pushState,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
