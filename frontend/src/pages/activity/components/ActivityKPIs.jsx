import React from 'react';
import { Card, Col, Row } from 'antd';
import { ActivitySquare, AlertTriangle, FileOutput, UserRoundCheck } from 'lucide-react';

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

const ActivityKPIs = ({ summary }) => {
  const cards = [
    { label: 'Tổng hoạt động', value: summary.total.toLocaleString('vi-VN'), subtitle: 'Bản ghi đang hiển thị', icon: ActivitySquare, color: 'var(--color-primary)', bgColor: 'var(--color-primary-light)' },
    { label: 'Người dùng', value: summary.users.toLocaleString('vi-VN'), subtitle: 'Tài khoản có phát sinh', icon: UserRoundCheck, color: 'var(--color-profit)', bgColor: 'var(--color-profit-bg)' },
    { label: 'Cảnh báo', value: summary.warnings.toLocaleString('vi-VN'), subtitle: 'Sự kiện cần theo dõi', icon: AlertTriangle, color: 'var(--color-warning)', bgColor: 'var(--color-warning-bg)' },
    { label: 'Xuất dữ liệu', value: summary.exports.toLocaleString('vi-VN'), subtitle: 'Thao tác xuất báo cáo/file', icon: FileOutput, color: 'var(--color-inventory)', bgColor: 'var(--color-inventory-bg)' },
  ];

  return (
    <Row gutter={[16, 16]} className="mb-6">
      {cards.map((card) => (
        <Col xs={24} sm={12} lg={6} key={card.label}>
          <KPICard {...card} />
        </Col>
      ))}
    </Row>
  );
};

export default ActivityKPIs;
