import React from 'react';
import { Card } from 'antd';
import { CalendarCheck2, Clock3, UserCheck, UserX } from 'lucide-react';

const KPICard = ({ label, value, subtitle, icon, color, bgColor }) => {
  const iconNode = React.createElement(icon, { size: 23, style: { color } });

  return (
    <Card className="h-full rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">{label}</div>
          <div className="truncate text-[var(--font-size-kpi)] font-bold leading-tight text-[var(--color-text-primary)]">{value}</div>
          <div className="mt-1 truncate text-[12px] text-[var(--color-text-muted)]">{subtitle}</div>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)]" style={{ backgroundColor: bgColor }}>
          {iconNode}
        </div>
      </div>
    </Card>
  );
};

const ScheduleKPIs = ({ summary }) => {
  const cards = [
    { label: 'Tổng ca tuần', value: summary.total.toLocaleString('vi-VN'), subtitle: 'Ca làm đang hiển thị', icon: CalendarCheck2, color: '#0D9488', bgColor: '#F0FDFA' },
    { label: 'Có mặt', value: summary.confirmed.toLocaleString('vi-VN'), subtitle: 'Nhân sự đi làm đầy đủ', icon: UserCheck, color: '#16A34A', bgColor: '#F0FDF4' },
    { label: 'Đến muộn', value: (summary.late || 0).toLocaleString('vi-VN'), subtitle: 'Nhân sự đi làm muộn', icon: Clock3, color: '#D97706', bgColor: '#FFFBEB' },
    { label: 'Vắng mặt', value: summary.absent.toLocaleString('vi-VN'), subtitle: 'Ca cần bố trí thay thế', icon: UserX, color: '#DC2626', bgColor: '#FEF2F2' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div key={card.label} className="h-full">
          <KPICard {...card} />
        </div>
      ))}
    </div>
  );
};

export default ScheduleKPIs;
