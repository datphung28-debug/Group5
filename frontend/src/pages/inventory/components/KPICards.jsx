import React from 'react';
import { Card, Row, Col } from 'antd';
import { Pill, Banknote, AlertTriangle, PackageSearch } from 'lucide-react';

const formatCompactCurrency = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`;
  return `${(value / 1000).toFixed(0)}k`;
};

const KPICard = ({ value, label, icon, color, bgColor }) => {
  const IconComponent = icon;

  return (
    <Card className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)]">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          <IconComponent size={24} style={{ color }} />
        </div>
        <div>
          <div className="text-[var(--color-text-primary)] text-[var(--font-size-kpi)] font-bold leading-tight">
            {value}
          </div>
          <div className="text-[var(--color-text-secondary)] text-[var(--font-size-sm)] font-medium">
            {label}
          </div>
        </div>
      </div>
    </Card>
  );
};

const KPICards = ({ summary }) => {
  const kpis = [
    {
      value: summary.totalItems.toLocaleString('vi-VN'),
      label: 'Loại thuốc đang bán',
      icon: Pill,
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
    },
    {
      value: formatCompactCurrency(summary.inventoryValue),
      label: 'Tổng giá trị tồn kho',
      icon: Banknote,
      color: 'var(--color-profit)',
      bgColor: 'var(--color-profit-bg)',
    },
    {
      value: summary.expiringSoonCount.toLocaleString('vi-VN'),
      label: 'Thuốc sắp hết hạn (30 ngày)',
      icon: AlertTriangle,
      color: 'var(--color-debt)',
      bgColor: 'var(--color-debt-bg)',
    },
    {
      value: summary.lowStockCount.toLocaleString('vi-VN'),
      label: 'Thuốc sắp hết tồn',
      icon: PackageSearch,
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-bg)',
    },
  ];

  return (
    <Row gutter={[16, 16]} className="mb-6">
      {kpis.map((kpi, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <KPICard {...kpi} />
        </Col>
      ))}
    </Row>
  );
};

export default KPICards;
