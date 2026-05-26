import React from 'react';
import { Card, Col, Row } from 'antd';
import { BadgeCheck, Clock3, ReceiptText, RotateCcw } from 'lucide-react';

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const KPICard = ({ label, value, subtitle, icon, color, bgColor }) => {
  const iconNode = React.createElement(icon, { size: 23, style: { color } });

  return (
    <Card className="h-full rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 text-[var(--font-size-sm)] font-medium text-[var(--color-text-secondary)]">
            {label}
          </div>
          <div className="truncate text-[var(--font-size-kpi)] font-bold leading-tight text-[var(--color-text-primary)]">
            {value}
          </div>
          <div className="mt-1 truncate text-[12px] text-[var(--color-text-muted)]">{subtitle}</div>
        </div>
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
          style={{ backgroundColor: bgColor }}
        >
          {iconNode}
        </div>
      </div>
    </Card>
  );
};

const ReturnKPIs = ({ summary }) => {
  const cards = [
    {
      label: 'Tổng phiếu trả',
      value: summary.totalReturns.toLocaleString('vi-VN'),
      subtitle: `${summary.totalItems.toLocaleString('vi-VN')} sản phẩm được ghi nhận`,
      icon: RotateCcw,
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
    },
    {
      label: 'Giá trị hoàn',
      value: formatCurrency(summary.refundAmount),
      subtitle: 'Tổng tiền hoàn trong danh sách',
      icon: ReceiptText,
      color: 'var(--color-debt)',
      bgColor: 'var(--color-debt-bg)',
    },
    {
      label: 'Chờ duyệt',
      value: summary.pendingCount.toLocaleString('vi-VN'),
      subtitle: 'Phiếu cần kiểm tra điều kiện trả',
      icon: Clock3,
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-bg)',
    },
    {
      label: 'Hoàn tất',
      value: summary.completedCount.toLocaleString('vi-VN'),
      subtitle: 'Phiếu đã nhập lại/hoàn tiền',
      icon: BadgeCheck,
      color: 'var(--color-profit)',
      bgColor: 'var(--color-profit-bg)',
    },
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

export default ReturnKPIs;
