'use client';

import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CalendarDays } from 'lucide-react';
import { FrostCard } from '@/shared/components/FrostCard';

interface CalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  themeImage: string;
  view: 'month' | 'week';
  onViewChange: (view: 'month' | 'week') => void;
}

export const ScheduleHeader = ({ currentMonth, onPrevMonth, onNextMonth, themeImage, view, onViewChange }: CalendarHeaderProps) => {
  // Extract vertical scroll progress to drive the subtle parallax hero image
  const { scrollY } = useScroll();
  // Translate down slightly slower than the scroll creating depth
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <div className="relative group">
      {/* Physical Binding Effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[80%] h-6 flex justify-around px-4 z-30 pointer-calendarItems-none">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="w-2 h-6 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full shadow-lg" />
        ))}
      </div>

      <FrostCard className="relative overflow-hidden h-60 md:h-[35vh] flex flex-col justify-end p-0 border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${format(currentMonth, 'yyyy-MM')}-${themeImage}`}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center bg-slate-800"
            style={{ 
              backgroundImage: `url("${themeImage}")`,
              y // Map framer motion transform for parallax
            }}
          />
        </AnimatePresence>
        
        <div className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-end p-6 md:p-[4vh] w-full gap-4 md:gap-0">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-5xl md:text-8xl font-heading font-bold text-foreground tracking-[-0.05em] leading-[0.8] mb-4 drop-shadow-sm transition-colors duration-1000">
              {format(currentMonth, 'MMMM')}
            </h1>
            <p className="text-primary font-bold text-lg md:text-2xl tracking-[0.3em] uppercase opacity-90">
              {format(currentMonth, 'yyyy')}
            </p>
          </motion.div>
          
           <div className="flex gap-3 pb-0 md:pb-2 self-end md:self-auto">
            <div className="flex glass rounded-xl p-1 items-center mr-2">
              <button
                onClick={() => onViewChange('month')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'month' ? 'bg-primary/20 text-primary' : 'text-white hover:bg-white/10'}`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Month
              </button>
              <button
                onClick={() => onViewChange('week')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'week' ? 'bg-primary/20 text-primary' : 'text-white hover:bg-white/10'}`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Week
              </button>
            </div>
            <button 
              onClick={onPrevMonth}
              className="p-2 md:p-3 rounded-xl glass hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
            <button 
              onClick={onNextMonth}
              className="p-2 md:p-3 rounded-xl glass hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
          </div>
        </div>
      </FrostCard>
    </div>
  );
}
