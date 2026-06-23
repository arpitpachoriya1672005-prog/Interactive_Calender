export interface Theme {
  primary: string;
  image: string;
}

export const MONTH_THEMES: Record<number, Theme> = {
  0: { primary: '#60a5fa', image: 'https://picsum.photos/id/29/2000/1200' }, // Jan - Winter Blue
  1: { primary: '#f472b6', image: 'https://images.unsplash.com/photo-1516047487059-fd288d84e8cb?auto=format&fit=crop&q=80&w=2000' }, // Feb - Snow
  2: { primary: '#4ade80', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000' }, // Mar - Spring Green
  3: { primary: '#6366f1', image: 'https://picsum.photos/id/28/2000/1200' }, // Apr - Indigo
  4: { primary: '#fbbf24', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=2000' }, // May - Golden
  5: { primary: '#2dd4bf', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000' }, // Jun - Teal
  6: { primary: '#f87171', image: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&q=80&w=2000' }, // Jul - Summer Red
  7: { primary: '#fb923c', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=2000' }, // Aug - Sunset
  8: { primary: '#8b5cf6', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000' }, // Sep - Forest Purple
  9: { primary: '#d97706', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=2000' }, // Oct - Autumn
  10: { primary: '#94a3b8', image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=2000' }, // Nov - Slate
  11: { primary: '#ef4444', image: 'https://picsum.photos/id/1015/2000/1200' }, // Dec - Festive Red
};

export const HOLIDAYS: Record<string, string> = {
  '01-01': 'New Year\'s Day',
  '12-25': 'Christmas',
  '07-04': 'Independence Day',
  '10-31': 'Halloween',
  '02-14': 'Valentine\'s Day',
  '01-20': 'Martin Luther King Jr. Day',
};
