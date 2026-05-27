import React from 'react';
import { Card, Table, Button, Skeleton, Progress, Tag, Empty } from 'antd';
import { TrendingUp, BarChart2, FileText, Calendar, Medal, Package, Users, ShoppingCart } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import PageHeader from '../components/PageHeader';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { data, loading, formatCurrency, formatNumber } = useDashboard();

  if (loading || !data || !data.kpi) {
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

  // Tính max revenue để vẽ bar đơn giản
  const last7Days = (data.revenueProfit30Days || []).slice(-7);
  const last12Hours = (data.hourlyRevenueToday || []).slice(0, 12);
  const maxRevenue = Math.max(1, ...last7Days.map(d => d.revenue || 0));
  const maxHourly = Math.max(1, ...last12Hours.map(d => d.revenue || 0));

  return (
    <div className="p-6 w-full max-w-[1440px] mx-auto bg-[var(--color-bg-app)] min-h-full">
      <PageHeader
        title="Dashboard"
        subtitle="Tổng quan hoạt động kinh doanh"
      />

      {/* KPI Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card className="kpi-card revenue-card">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              <p className="kpi-label">Doanh thu hôm nay</p>
              <h3 className="kpi-value text-[var(--color-revenue)]">{formatCurrency(data.kpi.revenueToday)}</h3>
            </div>
            <div className="kpi-icon-wrapper text-[var(--color-revenue)] bg-[var(--color-revenue-bg)]">
              <TrendingUp size={20} />
            </div>
          </div>
        </Card>

        <Card className="kpi-card profit-card">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
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
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
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
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
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
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              <p className="kpi-label">Công nợ khách hàng</p>
              <h4 className="kpi-value-mini text-[var(--color-debt)]">{formatCurrency(data.kpi.customerDebt)}</h4>
            </div>
            <div className="kpi-icon-wrapper bg-red-50 text-red-500">
              <Users size={20} />
            </div>
          </div>
        </Card>

        <Card className="kpi-card-mini">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              <p className="kpi-label">Công nợ nhà cung cấp</p>
              <h4 className="kpi-value-mini text-[var(--color-warning)]">{formatCurrency(data.kpi.supplierDebt)}</h4>
            </div>
            <div className="kpi-icon-wrapper bg-amber-50 text-[var(--color-warning)]">
              <ShoppingCart size={20} />
            </div>
          </div>
        </Card>

        <Card className="kpi-card-mini">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              <p className="kpi-label">Giá trị tồn kho</p>
              <h4 className="kpi-value-mini text-[var(--color-inventory)]">{formatCurrency(data.kpi.inventoryValue)}</h4>
            </div>
            <div className="kpi-icon-wrapper bg-blue-50 text-blue-500">
              <Package size={20} />
            </div>
          </div>
        </Card>

        <Card className="kpi-card-mini">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              <p className="kpi-label">Biên lãi gộp tháng</p>
              <h4 className="kpi-value-mini text-[var(--color-profit)]">{data.kpi.profitMarginMonth}%</h4>
            </div>
            <div className="kpi-icon-wrapper bg-green-50 text-[var(--color-profit)]">
              <BarChart2 size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Row 1 — Simple Bar Charts (No external lib dependency) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Doanh thu 7 ngày gần nhất */}
        <Card
          className="lg:col-span-2 chart-card"
          title="Doanh thu & Lãi gộp 7 ngày gần nhất"
          extra={
            <Tag color="blue" className="text-xs">
              7 ngày
            </Tag>
          }
        >
          <div className="space-y-3 pt-2">
            {last7Days.length === 0 ? (
              <Empty description="Chưa có dữ liệu doanh thu" />
            ) : (
              last7Days.map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-secondary)] w-12 flex-shrink-0">{day.date}</span>
                  <div className="flex-1 flex flex-col gap-1">
                    {/* Revenue bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[var(--color-bg-subtle)] rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[var(--color-text-primary)] w-20 text-right">
                        {formatCurrency(day.revenue)}
                      </span>
                    </div>
                    {/* Profit bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[var(--color-bg-subtle)] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-400 transition-all"
                          style={{ width: `${(day.profit / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-green-600 w-20 text-right">
                        +{formatCurrency(day.profit)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--color-border-light)]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-[var(--color-text-secondary)]">Doanh thu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs text-[var(--color-text-secondary)]">Lãi gộp</span>
            </div>
          </div>
        </Card>

        {/* Doanh thu theo giờ */}
        <Card className="lg:col-span-1 chart-card" title="Doanh thu theo giờ hôm nay">
          <div className="flex items-end gap-1.5 h-[220px] pt-2">
            {last12Hours.length === 0 ? (
              <div className="w-full flex items-center justify-center">
                <Empty description="Chưa có dữ liệu theo giờ" />
              </div>
            ) : (
              last12Hours.map((h) => (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className="w-full rounded-t-sm bg-blue-500 opacity-80 hover:opacity-100 transition-opacity cursor-pointer min-h-[4px]"
                    style={{ height: `${Math.max(4, (h.revenue / maxHourly) * 180)}px` }}
                    title={formatCurrency(h.revenue)}
                  />
                  <span className="text-[10px] text-[var(--color-text-muted)] leading-none">{h.hour}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Chart Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tổng kết năm */}
        <Card
          className="lg:col-span-2 chart-card"
          title="Tổng kết doanh thu năm 2026"
        >
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

          {/* Monthly breakdown */}
          <div className="space-y-2">
            {data.yearlyRevenue.map((m) => {
              const maxYearly = Math.max(1, ...data.yearlyRevenue.map(d => d.revenueThisYear || 0));
              const pct = Math.round(((m.revenueThisYear || 0) / maxYearly) * 100);
              return (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-secondary)] w-8 flex-shrink-0">{m.month}</span>
                  <div className="flex-1">
                    <Progress
                      percent={pct}
                      showInfo={false}
                      strokeColor="var(--color-primary)"
                      trailColor="var(--color-bg-subtle)"
                      size={['100%', 8]}
                    />
                  </div>
                  <span className="text-xs font-medium text-[var(--color-text-primary)] w-20 text-right">
                    {formatCurrency(m.revenueThisYear)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top sản phẩm */}
        <Card
          className="lg:col-span-1 chart-card flex flex-col"
          title="Top 10 thuốc tháng"
          extra={<Button type="link" size="small" className="text-[var(--color-primary)] text-xs">Báo cáo</Button>}
          styles={{ body: { padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' } }}
        >
          <div className="overflow-auto" style={{ maxHeight: '420px' }}>
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
