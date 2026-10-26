import { cn } from '../ui';

export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8', className)}>{children}</div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:mb-8', className)}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          {eyebrow && <div className="label-mono mb-2 flex items-center gap-2">{eyebrow}</div>}
          <h1 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-ink-100 sm:text-[28px]">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-400">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
