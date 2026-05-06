import { Layers, Pill, FolderOpen } from 'lucide-react';

export default function SummaryCards({ total, totalMedicines, emptyCount }) {
  const cards = [
    {
      label: 'Tổng nhóm thuốc',
      value: total,
      icon: Layers,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-light)',
    },
    {
      label: 'Tổng loại thuốc',
      value: totalMedicines,
      icon: Pill,
      color: 'var(--color-profit)',
      bg: 'var(--color-profit-bg)',
    },
    {
      label: 'Nhóm chưa có thuốc',
      value: emptyCount,
      icon: FolderOpen,
      color: 'var(--color-warning)',
      bg: 'var(--color-warning-bg)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[var(--color-bg-surface)] border border-[var(--color-border-light)] rounded-[var(--radius-lg)] p-5 flex items-center gap-4"
        >
          <div
            className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: card.bg, color: card.color }}
          >
            <card.icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] m-0 leading-snug">
              {card.label}
            </p>
            <p
              className="text-[var(--font-size-kpi)] font-bold m-0 leading-tight"
              style={{ color: card.color }}
            >
              {value(card.value)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function value(n) {
  return n.toLocaleString('vi-VN');
}
