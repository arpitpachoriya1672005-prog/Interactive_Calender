import { cn } from '@/core/utils/classNames';
import { ReactNode } from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const FrostCard = ({ children, className, hover = false, ...props }: GlassCardProps) => {
  return (
    <div 
      className={cn(
        'glass rounded-2xl p-6 transition-all duration-300',
        hover && 'hover:bg-primary/5 hover:border-primary/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
