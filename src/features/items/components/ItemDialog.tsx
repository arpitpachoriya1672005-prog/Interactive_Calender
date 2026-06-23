'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ScheduleItem, ItemCategory, ItemPriority, ITEM_COLORS } from '@/core/models/ScheduleTypes';
import { format } from 'date-fns';

interface EventModalProps {
  date: Date;
  existingEvent?: ScheduleItem;
  onSave: (event: ScheduleItem) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const CATEGORIES: ItemCategory[] = ['work', 'personal', 'health', 'education', 'other'];
const PRIORITIES: ItemPriority[] = ['low', 'medium', 'high'];

/**
 * Modal for creating or editing a calendar event.
 * Renders as a centered overlay with scrim backdrop.
 */
export const ItemDialog = ({ date, existingEvent, onSave, onDelete, onClose }: EventModalProps) => {
  const [title, setTitle] = useState(existingEvent?.title || '');
  const [description, setDescription] = useState(existingEvent?.description || '');
  const [category, setCategory] = useState<ItemCategory>(existingEvent?.category || 'personal');
  const [priority, setPriority] = useState<ItemPriority>(existingEvent?.priority || 'medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: existingEvent?.id || Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      category,
      priority,
    });
    onClose();
  };

  return (
    <>
      {/* Scrim */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[60]"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[90vw] max-w-md rounded-2xl
          bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-panel
          overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              {existingEvent ? 'Edit Event' : 'New Event'}
            </p>
            <p className="text-sm text-slate-200 font-medium">{format(date, 'EEEE, MMM d, yyyy')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            autoFocus
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500
              focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500
              focus:outline-none focus:border-primary/50 resize-none transition-all"
          />

          {/* Category */}
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    category === cat
                      ? 'ring-1 ring-white/30 scale-105'
                      : 'opacity-60 hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: `${ITEM_COLORS[cat]}25`,
                    color: ITEM_COLORS[cat],
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Priority</p>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all
                    ${priority === p
                      ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {existingEvent && onDelete && (
              <button
                type="button"
                onClick={() => { onDelete(existingEvent.id); onClose(); }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
              >
                Delete
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground
                hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                transition-all shadow-md"
            >
              {existingEvent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
