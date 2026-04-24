import React, { useState } from 'react';
import { Card, Table, Button, Skeleton } from 'antd';
import { TrendingUp, BarChart2, FileText, Calendar, Medal } from 'lucide-react';
import { Column, DualAxes } from '@ant-design/charts';
import { useDashboard } from '../hooks/useDashboard';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { data, loading, formatCurrency, formatNumber } = useDashboard();
  const [showRevenue, setShowRevenue] = useState(true);
  const [compareYear, setCompareYear] = useState('2026');

  if (loading || !data) {
    return (
      <div className="p-6 w-full max-w-[1440px] mx-auto bg-[var(--color-bg-app)] min-h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i} className="rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border-[var(--color-border)]">
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border-[var(--color-border)] h-[400px]">
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
          <Card className="lg:col-span-1 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] border-[var(--color-border)] h-[400px]">
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </div>
      </div>
    );
  }

  // --- Charts Configuration ---

  // 1. Combo chart (Bar + Line) for 30 Days Revenue/Profit
  const comboConfig30Days = {
    data: data.revenueProfit30Days,
    xField: 'date',
    children: [
      {
        type: 'interval',
        yField: 'revenue',
        style: { fill: 'var(--color-primary)' },
        tooltip: { channel: 'y', valueFormatter: (d) => formatCurrency(d) }
      },
      {
        type: 'line',
        yField: 'profit',
        shapeField: 'smooth',
        style: { stroke: 'var(--color-profit)', lineWidth: 2 },
        axis: {
          y: { position: 'right', title: 'Lãi gộp' },
        },
        tooltip: { channel: 'y', valueFormatter: (d) => formatCurrency(d) }
      },
    ],
    legend: {
      color: {
        itemMarker: (value) => {
          if (v === 'profit') return 'smooth';
          return 'rect';
        },
      },
    },
  };

  // 2. Column chart for Hourly Revenue
  const columnConfigHourly = {
    data: data.hourlyRevenueToday,
    xField: 'hour',
    yField: 'revenue',
    color: 'var(--color-primary)',
    columnWidthRatio: 0.8,
    yAxis: {
      label: {
        formatter: (value) => `${(Number(value) / 1000).toFixed(0)}k`,
      },
    },
    tooltip: {
      formatter: (datum) => ({
        name: 'Doanh thu',
        value: formatCurrency(datum.revenue),
      }),
    },
  };

  // 3. DualAxes Chart for Yearly Comparison
  const yearlyBarData = data.yearlyRevenue.flatMap(d => [
    { month: d.month, type: 'Năm nay', value: d.revenueThisYear },
    { month: d.month, type: 'Năm ngoái', value: d.revenueLastYear }
  ]);

  const dualAxesConfigYearly = {
    xField: 'month',
    children: [
      {
        type: 'interval',
        data: yearlyBarData,
        yField: 'value',
        colorField: 'type',
        transform: [{ type: 'dodgeX' }],
        scale: {
          color: { range: ['var(--color-primary)', 'var(--color-border-light)'] }
        },
        tooltip: { channel: 'y', valueFormatter: (d) => formatCurrency(d) }
      },
      {
        type: 'line',
        data: data.yearlyRevenue,
        yField: 'profitThisYear',
        shapeField: 'smooth',
        style: { stroke: 'var(--color-profit)', lineWidth: 2 },
        axis: {
          y: { position: 'right', title: 'Lãi gộp' },
        },
        tooltip: { channel: 'y', valueFormatter: (d) => formatCurrency(d) }
      },
    ],
  };

  // --- Table Configuration ---
  const topProductsColumns = [
    {
      title: '#',
      key: 'index',
      width: 40,
      render: (_text, _record, index) => {
        if (index === 0) return <Medal size={16} className="text-yellow-500" />;
        if (index === 1) return <Medal size={16} className="text-gray-400" />;
        if (index === 2) return <Medal size={16} className="text-amber-600" />;
        return <span className="text-[var(--color-text-secondary)]">{index + 1}</span>;
      },
    },
    {
      title: 'Thuốc',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--color-text-primary)]">{text}</span>
          <span className="text-xs text-[var(--color-text-secondary)]">SL: {record.quantity}</span>
        </div>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      render: (val) => (
        <span className="text-[var(--color-text-primary)]">{formatCurrency(val)}</span>
      ),
    },
    {
      title: 'Lãi',
      key: 'profit',
      align: 'right',
      render: (_, record) => (
        <div className="flex flex-col items-end">
          <span className="text-[var(--color-profit)] font-medium">{formatCurrency(record.profit)}</span>
          <span className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-subtle)] px-1 rounded">
            {(record.profitMargin * 100).toFixed(1)}%
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 w-full max-w-[1440px] mx-auto bg-[var(--color-bg-app)] min-h-full">
      {/* KPI Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card className="kpi-card revenue-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="kpi-label">Doanh thu hôm nay</p>
              <h3 className="kpi-value text-[var(--color-revenue)]">{formatCurrency(data.kpi.revenueToday)}</h3>
            </div>
            <div className="kpi-icon-wrapper text-[var(--color-revenue)] bg-[var(--color-revenue-bg)]">
              <TrendingUp size={20} />
            </div>
          </div>
        </Card>

        <Card className="kpi-card profit-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="kpi-label">Lãi gộp hôm nay</p>
              <div className="flex items-baseline gap-2">
                <h3 className="kpi-value text-[var(--color-profit)]">{formatCurrency(data.kpi.profitToday)}</h3>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[var(--color-profit-bg)] text-[var(--color-profit)]">
                  {data.kpi.profitMarginToday}%
                </span>
              </div>
            </div>
            <div className="kpi-icon-wrapper text-[var(--color-profit)] bg-[var(--color-profit-bg)]">
              <BarChart2 size={20} />
            </div>
          </div>
        </Card>

        <Card className="kpi-card neutral-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="kpi-label">Hóa đơn hôm nay</p>
              <div className="flex items-baseline gap-2">
                <h3 className="kpi-value text-[var(--color-text-primary)]">{formatNumber(data.kpi.invoicesToday)}</h3>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  TB: {formatCurrency(data.kpi.avgInvoiceValue)}/HĐ
                </span>
              </div>
            </div>
            <div className="kpi-icon-wrapper text-[var(--color-text-secondary)] bg-[var(--color-bg-subtle)]">
              <FileText size={20} />
            </div>
          </div>
        </Card>

        <Card className="kpi-card inventory-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="kpi-label">Doanh thu tháng</p>
              <h3 className="kpi-value text-[var(--color-inventory)]">{formatCurrency(data.kpi.revenueMonth)}</h3>
            </div>
            <div className="kpi-icon-wrapper text-[var(--color-inventory)] bg-[var(--color-inventory-bg)]">
              <Calendar size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="kpi-card-mini">
          <p className="kpi-label">Công nợ khách hàng</p>
          <h4 className="kpi-value-mini text-[var(--color-debt)]">{formatCurrency(data.kpi.customerDebt)}</h4>
        </Card>

        <Card className="kpi-card-mini">
          <p className="kpi-label">Công nợ nhà cung cấp</p>
          <h4 className="kpi-value-mini text-[var(--color-warning)]">{formatCurrency(data.kpi.supplierDebt)}</h4>
        </Card>

        <Card className="kpi-card-mini">
          <p className="kpi-label">Giá trị tồn kho</p>
          <h4 className="kpi-value-mini text-[var(--color-inventory)]">{formatCurrency(data.kpi.inventoryValue)}</h4>
        </Card>

        <Card className="kpi-card-mini">
          <p className="kpi-label">Biên lãi gộp tháng</p>
          <h4 className="kpi-value-mini text-[var(--color-profit)]">{data.kpi.profitMarginMonth}%</h4>
        </Card>
      </div>

      {/* Chart Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 chart-card" title="Doanh thu & Lãi gộp 30 ngày gần nhất"
              extra={
                <div className="flex bg-[var(--color-bg-subtle)] rounded-[var(--radius-sm)] p-1 cursor-pointer">
                  <div
                    className={`px-3 py-1 text-xs rounded-sm transition-colors duration-200 ${showRevenue ? 'bg-white shadow-sm text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-secondary)]'}`}
                    onClick={() => setShowRevenue(true)}
                  >
                    Doanh thu
                  </div>
                  <div
                    className={`px-3 py-1 text-xs rounded-sm transition-colors duration-200 ${!showRevenue ? 'bg-white shadow-sm text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-secondary)]'}`}
                    onClick={() => setShowRevenue(false)}
                  >
                    Lãi gộp
                  </div>
                </div>
              }>
          <div className="h-[300px] w-full">
            {/* Note: DualAxes from ant-design/charts can be complex to type correctly in TS without exact versions,
                so using any or ignoring TS checks for config might be needed in a real project depending on version */}
            <DualAxes {...comboConfig30Days} />
          </div>
        </Card>

        <Card className="lg:col-span-1 chart-card" title="Doanh thu theo giờ hôm nay">
          <div className="h-[300px] w-full">
            <Column {...columnConfigHourly} />
          </div>
        </Card>
      </div>

      {/* Chart Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 chart-card" title="Doanh thu 12 tháng — So sánh năm ngoái"
              extra={
                <div className="flex items-center gap-2">
                  <span
                    className={`cursor-pointer px-2 py-1 rounded text-xs transition-colors duration-200 ${compareYear === '2026' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium' : 'text-[var(--color-text-secondary)]'}`}
                    onClick={() => setCompareYear('2026')}
                  >
                    2026
                  </span>
                  <span className="text-[var(--color-border)]">|</span>
                  <span
                    className={`cursor-pointer px-2 py-1 rounded text-xs transition-colors duration-200 ${compareYear === '2025' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium' : 'text-[var(--color-text-secondary)]'}`}
                    onClick={() => setCompareYear('2025')}
                  >
                    2025
                  </span>
                </div>
              }>
          <div className="grid grid-cols-3 gap-4 mb-6 bg-[var(--color-bg-subtle)] p-4 rounded-[var(--radius-md)]">
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">Tổng DT năm nay</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{formatCurrency(data.yearlySummary.revenueThisYear)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">Tổng DT năm ngoái</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{formatCurrency(data.yearlySummary.revenueLastYear)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">Tổng lãi gộp năm nay</p>
              <p className="text-sm font-semibold text-[var(--color-profit)]">{formatCurrency(data.yearlySummary.profitThisYear)}</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <DualAxes {...dualAxesConfigYearly} />
          </div>
        </Card>

        <Card className="lg:col-span-1 chart-card flex flex-col" title="Top 10 thuốc tháng"
              extra={<Button type="link" size="small" className="text-[var(--color-primary)] text-xs">Báo cáo</Button>}
              styles={{ body: { padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}>
          <div className="overflow-auto" style={{ height: '400px' }}>
            <Table
              dataSource={data.topProducts}
              columns={topProductsColumns}
              pagination={false}
              rowKey="id"
              size="small"
              className="top-products-table"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
