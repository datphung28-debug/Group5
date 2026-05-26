import React from 'react';
import { Card, Col, Row } from 'antd';
import { AlertTriangle, CircleDollarSign, ShieldCheck, WalletCards } from 'lucide-react';
import { formatCurrency } from '../../../suppliers/supplierData';

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

const DebtKPIs = ({ summary }) => {
  const cards = [
    {
      label: 'Tổng công nợ',
      value: formatCurrency(summary.totalDebt),
      subtitle: `${summary.debtorCount} nhà cung cấp còn nợ`,
      icon: CircleDollarSign,
      color: 'var(--color-debt)',
      bgColor: 'var(--color-debt-bg)',
    },
    {
      label: 'Quá hạn',
      value: formatCurrency(summary.overdueDebt),
      subtitle: `${summary.overdueCount} hồ sơ cần xử lý`,
      icon: AlertTriangle,
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-bg)',
    },
    {
      label: 'Còn hạn mức',
      value: formatCurrency(summary.availableLimit),
      subtitle: 'Hạn mức khả dụng với NCC',
      icon: ShieldCheck,
      color: 'var(--color-profit)',
      bgColor: 'var(--color-profit-bg)',
    },
    {
      label: 'Đã tất toán',
      value: summary.fullyPaidCount.toLocaleString('vi-VN'),
      subtitle: 'Nhà cung cấp không còn nợ',
      icon: WalletCards,
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
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

export default DebtKPIs;
