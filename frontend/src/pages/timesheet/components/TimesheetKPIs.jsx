import React from 'react';
import { Card, Col, Row } from 'antd';
import { Clock3, Timer, UserCheck, UserX } from 'lucide-react';

const KPICard = ({ label, value, subtitle, icon, color, bgColor, isActive, onClick }) => {
  const iconNode = React.createElement(icon, { size: 23, style: { color } });

  return (
    <Card 
      onClick={onClick}
      className={`h-full rounded-[var(--radius-lg)] border transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-md ${
        isActive 
          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/20 shadow-md shadow-[var(--color-primary-light)]' 
          : 'border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]'
      }`}
    >
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

const TimesheetKPIs = ({ summary, activeType, onSelectType }) => {
  const cards = [
    { type: 'all', label: 'Tổng bản ghi', value: summary.total.toLocaleString('vi-VN'), subtitle: 'Click để xem tất cả', icon: Clock3, color: 'var(--color-primary)', bgColor: 'var(--color-primary-light)' },
    { type: 'complete', label: 'Đủ công', value: summary.complete.toLocaleString('vi-VN'), subtitle: 'Click để xem ca đủ giờ', icon: UserCheck, color: 'var(--color-profit)', bgColor: 'var(--color-profit-bg)' },
    { type: 'exceptions', label: 'Bất thường', value: summary.exceptions.toLocaleString('vi-VN'), subtitle: 'Click để xem đi muộn/thiếu', icon: UserX, color: 'var(--color-debt)', bgColor: 'var(--color-debt-bg)' },
    { type: 'overtime', label: 'Giờ tăng ca', value: `${summary.overtimeHours.toFixed(1)}h`, subtitle: 'Click để xem ca tăng giờ', icon: Timer, color: 'var(--color-warning)', bgColor: 'var(--color-warning-bg)' },
  ];

  return (
    <Row gutter={[16, 16]} className="mb-6">
      {cards.map((card) => (
        <Col xs={24} sm={12} lg={6} key={card.label}>
          <KPICard 
            {...card} 
            isActive={activeType === card.type}
            onClick={() => onSelectType(card.type)}
          />
        </Col>
      ))}
    </Row>
  );
};

export default TimesheetKPIs;
