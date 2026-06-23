import { motion } from 'framer-motion';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { FrostCard } from '@/shared/components/FrostCard';
import { TimePeriod } from '@/core/models/ScheduleTypes';

interface SelectionFooterProps {
  selectedPeriods: TimePeriod[];
  activeRange: TimePeriod;
  onClear: () => void;
}

/**
 * A persistent glassmorphism footer that anchors the calendar UI when picking dates.
 * Relies on AnimatePresence from the parent router.
 */
export const RangeFooter = ({ selectedPeriods, activeRange, onClear }: SelectionFooterProps) => {
  if (selectedPeriods.length === 0 && !activeRange.start) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <FrostCard className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20 text-primary">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">
              {selectedPeriods.length > 0 ? `${selectedPeriods.length} Selected Range(s)` : 'Selecting New Range...'}
            </h3>
            <p className="text-sm text-slate-400">
              {activeRange.start ? `Selecting from ${format(activeRange.start, 'MMM d, yyyy')}...` : 'Selections confirmed'}
            </p>
          </div>
        </div>
        <button 
          onClick={onClear}
          className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          Clear All
        </button>
      </FrostCard>
    </motion.div>
  );
}
