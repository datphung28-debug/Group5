/**
 * Shared page header rendered inside each page's content area.
 * Provides consistent title/subtitle layout with an optional actions slot.
 */
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-[20px] md:text-[22px] font-bold text-[var(--color-text-primary)] m-0 leading-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-[var(--color-text-secondary)] m-0 mt-1 leading-snug">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
