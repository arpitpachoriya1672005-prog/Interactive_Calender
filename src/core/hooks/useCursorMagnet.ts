'use client';

import { useMotionValue, useSpring } from 'framer-motion';
import { useRef, useState, MouseEvent } from 'react';

/**
 * Handles the physics for the "sticky" magnetic hover effect.
 * When physics are active, the element mathematically pulls toward the cursor position.
 * 
 * @param isActive Determine if the element should react. Useful for preventing 
 *                 layout tearing if the element is part of a contiguous structure.
 * @param pullStrength The fractional limit of the cursor's pull (default 15%).
 */
export const useCursorMagnet = (isActive: boolean = true, pullStrength: number = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Unified spring configuration for smooth deceleration
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springScale = useSpring(isHovered && isActive ? 1.08 : 1, springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !isActive) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;

    x.set(distX * pullStrength);
    y.set(distY * pullStrength);
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Snap back to origin
    x.set(0);
    y.set(0);
  };

  return {
    ref,
    isHovered,
    x: isActive ? springX : 0,
    y: isActive ? springY : 0,
    scale: isActive ? springScale : 1,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  };
}
