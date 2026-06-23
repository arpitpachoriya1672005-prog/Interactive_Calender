'use client';

import { useEffect } from 'react';
import { useGlobalStore } from '@/core/store/GlobalStore';

interface KeyboardShortcutsOptions {
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onFocusSearch: () => void;
  onOpenSidebar: () => void;
  onClosePanels: () => void;
}

export function useKeyBinds({
  onPrevMonth,
  onNextMonth,
  onGoToToday,
  onFocusSearch,
  onOpenSidebar,
  onClosePanels
}: KeyboardShortcutsOptions) {
  const { undo, redo } = useGlobalStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          onPrevMonth();
          break;
        case 'ArrowRight':
          onNextMonth();
          break;
        case 't':
        case 'T':
          onGoToToday();
          break;
        case '/':
          e.preventDefault();
          onFocusSearch();
          break;
        case 'Escape':
          onClosePanels();
          break;
        case 'n':
        case 'N':
          onOpenSidebar();
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, onNextMonth, onPrevMonth, onGoToToday, onFocusSearch, onOpenSidebar, onClosePanels]);
}
