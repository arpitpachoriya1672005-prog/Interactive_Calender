'use client';

import { useState, useEffect } from 'react';
import { extractDominantColor } from '@/core/utils/colorEngine';
import { useGlobalStore } from '@/core/store/GlobalStore';

/**
 * Automatically extracts the dominant color from the given theme image,
 * and recalibrates it perfectly based on the active dark/light mode context.
 */
export const usePalette = (imageUrl: string, fallbackColor: string) => {
  const { theme } = useGlobalStore();
  const [extractedHsl, setExtractedHsl] = useState<{ h: number; s: number; l: number } | null>(null);

  useEffect(() => {
    let active = true;
    
    extractDominantColor(imageUrl).then((hsl) => {
      if (active && hsl) setExtractedHsl(hsl);
    });

    return () => {
      active = false;
    };
  }, [imageUrl]);

  /**
   * Adjust lightness and saturation dynamically so the text/UI elements
   * remain accessible regardless of the raw extracted image value.
   */
  const getDynamicColor = () => {
    if (!extractedHsl) return fallbackColor;
    
    const { h, s, l } = extractedHsl;
    if (theme === 'dark') {
      return `hsl(${h}, ${Math.max(60, s)}%, ${Math.min(65, l)}%)`;
    } else {
      return `hsl(${h}, ${Math.max(70, s)}%, ${Math.min(45, l)}%)`;
    }
  };

  return getDynamicColor();
}
