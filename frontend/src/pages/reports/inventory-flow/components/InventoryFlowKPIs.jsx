import React from 'react';
import { Card, Col, Row } from 'antd';
import { ArrowDownToLine, ArrowUpFromLine, Banknote, Boxes } from 'lucide-react';

const formatCurrencyCompact = (value) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} tỷ`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`;
  return `${Math.round(value / 1000).toLocaleString('vi-VN')}k`;
};

const KPICard = ({ label, value, subtitle, icon, color, bgColor }) => {
  const iconNode = React.createElement(icon, { size: 23, style: { color } });

  return (
    <Card className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)] h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[var(--color-text-secondary)] text-[var(--font-size-sm)] font-medium mb-1">
            {label}
          </div>
          <div className="text-[var(--color-text-primary)] text-[var(--font-size-kpi)] font-bold leading-tight truncate">
            {value}
          </div>
          <div className="text-[var(--color-text-muted)] text-[12px] mt-1 truncate">{subtitle}</div>
        </div>
        <div
          className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          {iconNode}
        </div>
      </div>
    </Card>
  );
};

const InventoryFlowKPIs = ({ summary }) => {
  const cards = [
    {
      label: 'Tổng tồn cuối',
      value: summary.closingStock.toLocaleString('vi-VN'),
      subtitle: `${summary.itemCount.toLocaleString('vi-VN')} mặt hàng theo dõi`,
      icon: Boxes,
      color: 'var(--color-inventory)',
      bgColor: 'var(--color-inventory-bg)',
    },
    {
      label: 'Tổng nhập',
      value: summary.imported.toLocaleString('vi-VN'),
      subtitle: 'Số lượng nhập trong kỳ',
      icon: ArrowDownToLine,
      color: 'var(--color-profit)',
      bgColor: 'var(--color-profit-bg)',
    },
    {
      label: 'Tổng xuất',
      value: summary.exported.toLocaleString('vi-VN'),
      subtitle: 'Số lượng bán/xuất trong kỳ',
      icon: ArrowUpFromLine,
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-bg)',
    },
    {
      label: 'Giá trị tồn',
      value: formatCurrencyCompact(summary.inventoryValue),
      subtitle: 'Theo giá nhập hiện tại',
      icon: Banknote,
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

export default InventoryFlowKPIs;
