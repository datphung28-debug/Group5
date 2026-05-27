import React from 'react';
import { Card, Row, Col, Space } from 'antd';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Scale, CreditCard, Banknote } from 'lucide-react';
import useCashbookStore from '../../../stores/useCashbookStore';

const KPICard = ({ title, value, label, icon, color, bgColor }) => (
  <Card className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)] h-full">
    <div className="flex items-center gap-4">
      <div 
        className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        {React.createElement(icon, { size: 24, style: { color } })}
      </div>
      <div className="min-w-0">
        <div className="text-[var(--color-text-primary)] text-[var(--font-size-kpi)] font-bold leading-tight truncate">
          {value}
        </div>
        <div className="text-[var(--color-text-secondary)] text-[var(--font-size-sm)] font-medium">
          {label || title}
        </div>
      </div>
    </div>
  </Card>
);

const SummaryCard = ({ title, count, total, icon, color, bgColor }) => (
  <Card size="small" className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-md)]">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          {React.createElement(icon, { size: 16, style: { color } })}
        </div>
        <span className="text-[var(--color-text-secondary)] font-medium">{title}</span>
      </div>
      <div className="text-right">
        <div className="font-bold text-[var(--color-text-primary)]">{total.toLocaleString()}đ</div>
        <div className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">{count} giao dịch</div>
      </div>
    </div>
  </Card>
);

const KPICards = () => {
  const { kpis, paymentSummaries } = useCashbookStore();

  const kpiData = [
    {
      title: 'Tổng thu kỳ này',
      value: `${kpis.totalRevenue.toLocaleString()}đ`,
      icon: ArrowUpCircle,
      color: 'var(--color-profit)',
      bgColor: 'var(--color-profit-bg)',
    },
    {
      title: 'Tổng chi kỳ này',
      value: `${kpis.totalExpense.toLocaleString()}đ`,
      icon: ArrowDownCircle,
      color: 'var(--color-debt)',
      bgColor: 'var(--color-debt-bg)',
    },
    {
      title: 'Số dư thuần kỳ',
      value: `${kpis.netBalance.toLocaleString()}đ`,
      icon: Scale,
      color: 'var(--color-revenue)',
      bgColor: 'var(--color-revenue-bg)',
    },
    {
      title: 'Số dư quỹ hiện tại',
      value: `${kpis.currentBalance.toLocaleString()}đ`,
      icon: Wallet,
      color: 'var(--color-inventory)',
      bgColor: 'var(--color-inventory-bg)',
    },
  ];

  return (
    <div className="mb-6">
      <Row gutter={[16, 16]} className="mb-4">
        {kpiData.map((kpi, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <KPICard {...kpi} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <SummaryCard 
            title="Tiền mặt"
            count={paymentSummaries.cash.count}
            total={paymentSummaries.cash.total}
            icon={Banknote}
            color="#d97706"
            bgColor="#fffbeb"
          />
        </Col>
        <Col xs={24} md={12}>
          <SummaryCard 
            title="Chuyển khoản"
            count={paymentSummaries.transfer.count}
            total={paymentSummaries.transfer.total}
            icon={CreditCard}
            color="#2563eb"
            bgColor="#eff6ff"
          />
        </Col>
      </Row>
    </div>
  );
};

export default KPICards;
