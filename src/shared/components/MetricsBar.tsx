'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, getWeek, isSameMonth } from 'date-fns';
import { CalendarDays, StickyNote, Layers, TrendingUp } from 'lucide-react';
import { useGlobalStore } from '@/core/store/GlobalStore';

interface SummaryPanelProps {
  currentMonth: Date;
}

/**
 * A compact insights strip that gives the user a quick pulse on their data.
 *
 * Placed below the calendar as a horizontal stat row on desktop,
 * and stacks vertically on mobile. Updates reactively when:
 * - The month is navigated
 * - Notes are added/removed
 * - Ranges change
 */
export const MetricsBar = ({ currentMonth }: SummaryPanelProps) => {
  const { dailyLogs, monthlyLogs, selectedPeriods } = useGlobalStore();

  // Notes belonging to the currently viewed month
  const monthlyDateNotes = useMemo(() => {
    return dailyLogs.filter(n => isSameMonth(n.date, currentMonth));
  }, [dailyLogs, currentMonth]);

  const monthKey = format(currentMonth, 'yyyy-MM');
  const hasMonthNote = Boolean(monthlyLogs[monthKey]?.trim());

  // Total selected days across all finalized selectedPeriods
  const totalSelectedDays = useMemo(() => {
    let count = 0;
    selectedPeriods.forEach(r => {
      if (r.start && r.end) {
        const diff = Math.abs(r.end.getTime() - r.start.getTime());
        count += Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
      }
    });
    return count;
  }, [selectedPeriods]);

  // Most active week — the week number with the most dailyLogs this month
  const mostActiveWeek = useMemo(() => {
    if (monthlyDateNotes.length === 0) return null;

    const weekCounts: Record<number, number> = {};
    monthlyDateNotes.forEach(n => {
      const w = getWeek(n.date);
      weekCounts[w] = (weekCounts[w] || 0) + 1;
    });

    let maxWeek = 0;
    let maxCount = 0;
    Object.entries(weekCounts).forEach(([week, count]) => {
      if (count > maxCount) {
        maxWeek = Number(week);
        maxCount = count;
      }
    });

    return maxWeek > 0 ? `Week ${maxWeek}` : null;
  }, [monthlyDateNotes]);

  const stats = [
    {
      icon: <CalendarDays className="w-4 h-4" />,
      value: totalSelectedDays,
      label: 'Selected Days',
    },
    {
      icon: <StickyNote className="w-4 h-4" />,
      value: monthlyDateNotes.length + (hasMonthNote ? 1 : 0),
      label: 'Notes This Month',
    },
    {
      icon: <Layers className="w-4 h-4" />,
      value: selectedPeriods.length,
      label: 'Saved Ranges',
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      value: mostActiveWeek || '—',
      label: 'Most Active',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 + i * 0.08 }}
          className="glass rounded-2xl p-4 flex items-center gap-3 group hover:bg-primary/5 transition-colors duration-200"
        >
          <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            {stat.icon}
          </div>
          <div>
            <p className="text-xl font-bold text-foreground leading-none">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 whitespace-nowrap">
              {stat.label}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
