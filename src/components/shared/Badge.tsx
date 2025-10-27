import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export default function Badge({ children, variant, className }: BadgeProps) {
  const variantStyles = {
    success: 'bg-semantic-success text-white',
    warning: 'bg-semantic-warning text-white',
    danger: 'bg-semantic-danger text-white',
    info: 'bg-semantic-info text-white',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}


