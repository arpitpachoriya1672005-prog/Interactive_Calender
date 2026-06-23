'use client';

import { useState, useEffect } from 'react';
import { Plus, StickyNote, Trash2, Calendar as CalendarIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useGlobalStore } from '@/core/store/GlobalStore';

interface NotesPanelProps {
  selectedDate: Date | null;
  onClose: () => void;
}

export const NotesPanel = ({ selectedDate, onClose }: NotesPanelProps) => {
  const { dailyLogs, appendLog: contextAddNote, deleteLog, isHydrated } = useGlobalStore();
  const [newNote, setNewNote] = useState('');

  const appendLog = () => {
    if (!newNote.trim() || !selectedDate) return;
    
    contextAddNote({
      id: Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      content: newNote.trim(),
    });
    
    setNewNote('');
  };

  const filteredNotes = dailyLogs.filter(n => 
    selectedDate && format(n.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed z-max bottom-0 left-0 right-0 h-sheet rounded-t-3xl md:bottom-8 md:top-8 md:right-8 md:left-auto md:w-panel md:h-auto md:rounded-3xl bg-slate-900/60 backdrop-blur-3xl border border-white/10 shadow-panel flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-xl font-medium tracking-tight text-slate-100 flex items-center gap-4">
          <div className="p-2.5 bg-primary/20 rounded-2xl text-primary shadow-inner border border-primary/20">
            <StickyNote className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Plans for</span>
            <span className="leading-none">{selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'No Date'}</span>
          </div>
        </h2>
        <button 
          onClick={onClose}
          className="p-2.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      {selectedDate ? (
        <div className="flex-1 flex flex-col p-8 overflow-hidden gap-6">
          <div className="relative">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && appendLog()}
              placeholder="What's happening?"
              className="w-full bg-black/20 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-light shadow-inner text-sm"
            />
            <button
              onClick={appendLog}
              disabled={!newNote.trim()}
              className="absolute right-2.5 top-2.5 bottom-2.5 aspect-square rounded-xl bg-primary text-primary-foreground hover:brightness-110 md:hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed transition-all duration-300 shadow-md flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pb-12">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="p-5 rounded-2xl bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-colors group flex justify-between items-start"
                  >
                    <div className="space-y-1.5 pr-4">
                      <p className="text-slate-200 text-sm font-normal leading-relaxed">{note.content}</p>
                      <p className="text-[10px] text-primary/80 uppercase tracking-widest font-semibold flex items-center gap-1">
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
                  className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40 mt-12"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                    <CalendarIcon className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-slate-400 text-sm font-light leading-relaxed max-w-[200px]">
                    Your day is clear.<br/>Add a note to get started.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
          <CalendarIcon className="w-16 h-16 text-slate-500 mb-6" strokeWidth={1} />
          <p className="text-slate-400 text-sm">Select a date on the calendar to manage dailyLogs.</p>
        </div>
      )}
    </motion.div>
  );
}
