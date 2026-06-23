'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface RippleState {
  id: number;
  x: number;
  y: number;
}

/**
 * Encapsulates the ripple generation logic to prevent polluting the parent component.
 * We track localized click coordinates to spawn circles exactly under the user's cursor.
 */
export const useRipple = () => {
  const [ripples, setRipples] = useState<RippleState[]>([]);

  const addRipple = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples((prev) => [...prev, { x, y, id: Date.now() }]);
  };

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return { ripples, addRipple, removeRipple };
}

interface TouchRippleProps {
  ripples: RippleState[];
  onClear: (id: number) => void;
}

/**
 * A highly reusable material-style ripple layer.
 * Relies on the parent having `relative` position.
 */
export const RippleEffect = ({ ripples, onClear }: TouchRippleProps) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-calendarItems-none rounded-[inherit]">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }} // Start with slightly higher visibility
            animate={{ scale: 3.5, opacity: 0 }} // Expand more to ensure full cell coverage
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }} // Custom spring-like slowing curve for smooth fade
            onAnimationComplete={() => onClear(ripple.id)}
            className="absolute rounded-full bg-primary/40 mix-blend-plus-lighter"
            style={{
              left: ripple.x - 50,
              top: ripple.y - 50,
              width: 100,
              height: 100,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
