import React from 'react';
import { Card, Col, Row } from 'antd';
import { Banknote, CircleDollarSign, ReceiptText, ShieldCheck } from 'lucide-react';

const formatCurrency = (value) => `${value.toLocaleString('vi-VN')} đ`;

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

const PayrollKPIs = ({ summary }) => {
  const cards = [
    { label: 'Tổng thực lĩnh', value: formatCurrency(summary.netPay), subtitle: 'Theo bộ lọc đang hiển thị', icon: CircleDollarSign, color: 'var(--color-primary)', bgColor: 'var(--color-primary-light)' },
    { label: 'Đã chi trả', value: formatCurrency(summary.paid), subtitle: 'Khoản lương đã hoàn tất', icon: ShieldCheck, color: 'var(--color-profit)', bgColor: 'var(--color-profit-bg)' },
    { label: 'Chờ xử lý', value: formatCurrency(summary.pending), subtitle: 'Nháp, chờ duyệt hoặc đã duyệt', icon: Banknote, color: 'var(--color-warning)', bgColor: 'var(--color-warning-bg)' },
    { label: 'Khấu trừ', value: formatCurrency(summary.deductions), subtitle: 'Tổng khấu trừ kỳ lương', icon: ReceiptText, color: 'var(--color-debt)', bgColor: 'var(--color-debt-bg)' },
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

export default PayrollKPIs;
