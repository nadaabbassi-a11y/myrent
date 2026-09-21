interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className = "" }: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-2xl font-semibold text-ink tracking-tight">{title}</h1>
      {description && (
        <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{description}</p>
      )}
    </div>
  );
}
