'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInCalendarDays } from 'date-fns';
import { CalendarDays, Hash, StickyNote, Info, X, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { useGlobalStore } from '@/core/store/GlobalStore';
import { TimePeriod } from '@/core/models/ScheduleTypes';

interface InspectorPanelProps {
  selectedDate: Date | null;
  selectedPeriods: TimePeriod[];
  onClose: () => void;
}

/**
 * Unified right-side panel that merges inspector context AND note editing.
 *
 * Why merge instead of two panels?
 * Having both NotesPanel and DetailSidebar open simultaneously created
 * overlapping fixed-position elements. A single panel keeps the UI clean
 * and gives the user one place to both view context and manage dailyLogs.
 */
export const DetailSidebar = ({ selectedDate, selectedPeriods, onClose }: InspectorPanelProps) => {
  const { dailyLogs, monthlyLogs, appendLog: contextAddNote, deleteLog } = useGlobalStore();
  const [newNote, setNewNote] = useState('');

  // Find which finalized range contains the selected date (if any)
  const activeRange = useMemo(() => {
    if (!selectedDate) return null;
    return selectedPeriods.find(r => {
      if (!r.start || !r.end) return false;
      const d = selectedDate.getTime();
      const s = Math.min(r.start.getTime(), r.end.getTime());
      const e = Math.max(r.start.getTime(), r.end.getTime());
      return d >= s && d <= e;
    }) || null;
  }, [selectedDate, selectedPeriods]);

  const totalDays = useMemo(() => {
    if (!activeRange?.start || !activeRange?.end) return selectedDate ? 1 : 0;
    return Math.abs(differenceInCalendarDays(activeRange.end, activeRange.start)) + 1;
  }, [activeRange, selectedDate]);

  // Notes for the selected date
  const dateNotes = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return dailyLogs.filter(n => format(n.date, 'yyyy-MM-dd') === key);
  }, [selectedDate, dailyLogs]);

  // Month note for the selected date's month
  const currentMonthNote = useMemo(() => {
    if (!selectedDate) return '';
    const key = format(selectedDate, 'yyyy-MM');
    return monthlyLogs[key] || '';
  }, [selectedDate, monthlyLogs]);

  const appendLog = () => {
    if (!newNote.trim() || !selectedDate) return;
    contextAddNote({
      id: Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      content: newNote.trim(),
    });
    setNewNote('');
  };

  if (!selectedDate) return null;

  return (
    <motion.aside
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="
        fixed z-40
        bottom-0 left-0 right-0 max-h-[75vh] rounded-t-3xl
        md:bottom-auto md:top-0 md:left-auto md:right-0 md:max-h-none md:h-full md:w-[380px] md:rounded-none md:rounded-l-3xl
        bg-slate-900/60 backdrop-blur-3xl border-t md:border-t-0 md:border-l border-white/10 shadow-panel
        flex flex-col overflow-hidden
      "
    >
      {/* Header */}
      {/* pt-20 on desktop pushes the header below the fixed DarkModeSwitch button */}
      <div className="flex items-center justify-between px-6 py-5 md:pt-20 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/20 rounded-2xl text-primary shadow-inner border border-primary/20">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Details for</p>
            <h2 className="text-base font-heading font-bold text-slate-100 leading-tight">
              {format(selectedDate, 'EEEE, MMM d, yyyy')}
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

        {/* Section: Stat Cards  */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<CalendarDays className="w-4 h-4" />}
            label="Days"
            value={totalDays.toString()}
          />
          <StatCard
            icon={<Hash className="w-4 h-4" />}
            label="Ranges"
            value={selectedPeriods.length.toString()}
          />
        </div>

        {/* Section: Active Range Info  */}
        {activeRange?.start && activeRange?.end && (
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-primary/80 uppercase tracking-wider font-semibold mb-2">Selected Range</p>
            <p className="text-sm text-slate-200 font-medium">
              {format(activeRange.start < activeRange.end ? activeRange.start : activeRange.end, 'MMM d')}
              {' → '}
              {format(activeRange.start < activeRange.end ? activeRange.end : activeRange.start, 'MMM d, yyyy')}
            </p>
          </div>
        )}

        {/* Section: Add DailyLog Input  */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
            <StickyNote className="w-3.5 h-3.5" />
            Notes ({dateNotes.length})
          </p>
          <div className="relative">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && appendLog()}
              placeholder="What's happening?"
              className="w-full bg-black/20 border border-white/10 rounded-2xl pl-5 pr-14 py-3.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-light shadow-inner text-sm"
            />
            <button
              onClick={appendLog}
              disabled={!newNote.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-primary text-primary-foreground hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-md flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section: Notes List  */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {dateNotes.length > 0 ? (
              dateNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="p-4 rounded-2xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-colors group flex justify-between items-start"
                >
                  <div className="space-y-1 pr-3">
                    <p className="text-slate-200 text-sm leading-relaxed">{note.content}</p>
                    <p className="text-[10px] text-primary/80 uppercase tracking-widest font-semibold">
                      {format(note.date, 'h:mm a')}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteLog(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all active:scale-90 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center py-6 opacity-40"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <CalendarIcon className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                </div>
                <p className="text-slate-400 text-sm font-light leading-relaxed max-w-[200px]">
                  Your day is clear.<br/>Add a note to get started.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section: Month DailyLog Preview  */}
        {currentMonthNote && (
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">
              Month DailyLog
            </p>
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 text-sm text-slate-400 leading-relaxed line-clamp-4">
              {currentMonthNote}
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

// Section: Internal Stat Card 
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-slate-100 leading-none">{value}</p>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
}
