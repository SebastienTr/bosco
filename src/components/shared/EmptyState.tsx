import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      {icon ? (
        <div className="mb-6 text-mist">{icon}</div>
      ) : null}
      <h2 className="font-heading text-h1 text-navy">{title}</h2>
      <p className="mt-3 max-w-md text-body text-slate">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}
