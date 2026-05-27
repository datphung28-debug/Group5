import React from 'react';
import { Card, Row, Col, Space, Typography } from 'antd';
import { TrendingUp, BadgeDollarSign, Receipt, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import useRevenueReportStore from '../../../../stores/useRevenueReportStore';

const { Text } = Typography;

const KPICard = ({ title, value, subtitle, icon, color, bgColor, trend }) => (
  <Card className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)] h-full overflow-hidden relative">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
          style={{ backgroundColor: bgColor }}
        >
          {React.createElement(icon, { size: 24, style: { color } })}
        </div>
        <div className="min-w-0">
          <div className="text-[var(--color-text-secondary)] text-[var(--font-size-sm)] font-medium mb-1">
            {title}
          </div>
          <div className="text-[var(--color-text-primary)] text-[22px] font-bold leading-tight truncate">
            {value}
          </div>
          {subtitle && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[13px] text-[var(--color-text-muted)]">{subtitle}</span>
              {trend && (
                <div className={`flex items-center text-[12px] font-bold ${trend > 0 ? 'text-[var(--color-profit)]' : 'text-[var(--color-debt)]'}`}>
                  {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(trend)}%
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </Card>
);

const RevenueKPIs = () => {
  const { kpis } = useRevenueReportStore();

  const kpiData = [
    {
      title: 'Tổng doanh thu',
      value: `${kpis.totalRevenue.toLocaleString()}đ`,
      subtitle: 'So với kỳ trước',
      trend: 12.5,
      icon: TrendingUp,
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
    },
    {
      title: 'Lãi gộp',
      value: `${kpis.grossProfit.toLocaleString()}đ`,
      subtitle: `Tỷ suất: ${kpis.margin}%`,
      trend: 8.2,
      icon: BadgeDollarSign,
      color: 'var(--color-profit)',
      bgColor: 'var(--color-profit-bg)',
    },
    {
      title: 'Số hóa đơn',
      value: kpis.invoiceCount.toLocaleString(),
      subtitle: 'Giao dịch thành công',
      trend: 5.4,
      icon: Receipt,
      color: 'var(--color-inventory)',
      bgColor: 'var(--color-inventory-bg)',
    },
    {
      title: 'TB / hóa đơn',
      value: `${kpis.avgOrderValue.toLocaleString()}đ`,
      subtitle: 'Giá trị đơn hàng trung bình',
      trend: -2.1,
      icon: BarChart3,
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-bg)',
    },
  ];

  return (
    <Row gutter={[16, 16]} className="mb-6">
      {kpiData.map((kpi, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <KPICard {...kpi} />
        </Col>
      ))}
    </Row>
  );
};

export default RevenueKPIs;
