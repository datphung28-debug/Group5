import React from 'react';
import { Card, Row, Col } from 'antd';
import { Pill, Banknote, AlertTriangle, PackageSearch } from 'lucide-react';

const KPICard = ({ title, value, label, icon: Icon, color, bgColor }) => (
  <Card className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)]">
    <div className="flex items-center gap-4">
      <div 
        className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        <Icon size={24} style={{ color: color }} />
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

const KPICards = () => {
  const kpis = [
    {
      title: 'Loại thuốc đang bán',
      value: '1,248',
      label: 'Loại thuốc đang bán',
      icon: Pill,
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
    },
    {
      title: 'Tổng giá trị tồn kho',
      value: '425.8tr',
      label: 'Tổng giá trị tồn kho',
      icon: Banknote,
      color: 'var(--color-profit)',
      bgColor: 'var(--color-profit-bg)',
    },
    {
      title: 'Lô sắp hết hạn',
      value: '15',
      label: 'Lô sắp hết hạn (30 ngày)',
      icon: AlertTriangle,
      color: 'var(--color-debt)',
      bgColor: 'var(--color-debt-bg)',
    },
    {
      title: 'Thuốc sắp hết tồn',
      value: '24',
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
