import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-cream-warm p-4">
        <Icon size={32} className="text-coffee-light/60" />
      </div>
      <p className="text-sm font-medium text-coffee">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-sub">{description}</p>
      )}
    </div>
  );
}
