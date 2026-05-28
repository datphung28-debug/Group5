import React, { useMemo } from 'react';
import { Skeleton } from 'antd';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  CalendarDays,
  Users,
  ShoppingCart,
  Package,
  Percent,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDashboard } from '../hooks/useDashboard';
import '../styles/dashboard.css';

// ═══════════════════════════════════════════════════════════════════
// Animation Variants
// ═══════════════════════════════════════════════════════════════════
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardHover = {
  y: -4,
  transition: { duration: 0.25, ease: 'easeOut' },
};

// ═══════════════════════════════════════════════════════════════════
// Custom Tooltip Component
// ═══════════════════════════════════════════════════════════════════
const CustomAreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: entry.color }} />
          <span>{entry.name}:</span>
          <span style={{ fontWeight: 700 }}>{formatCurrencyStatic(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: entry.color || '#2563eb' }} />
          <span>Doanh thu:</span>
          <span style={{ fontWeight: 700 }}>{formatCurrencyStatic(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

// Standalone formatter for use in tooltips (outside hook)
const formatCurrencyStatic = (value = 0) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}tỷ`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}tr đ`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return `${value.toLocaleString('vi-VN')}đ`;
};

// ═══════════════════════════════════════════════════════════════════
// KPI Card Component
// ═══════════════════════════════════════════════════════════════════
function KPICard({ label, value, icon: Icon, iconBg, iconColor, variant, sub, subType }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={cardHover}
      className={`kpi-card ${variant || ''}`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="kpi-label">{label}</p>
          <h3 className="kpi-value" style={{ color: iconColor }}>
            {value}
          </h3>
          {sub && (
            <div className={`kpi-sub ${subType || 'neutral'}`}>
              {subType === 'positive' && <ArrowUpRight size={13} />}
              {subType === 'negative' && <ArrowDownRight size={13} />}
              {subType === 'warning' && <AlertTriangle size={12} />}
              <span>{sub}</span>
            </div>
          )}
        </div>
        <div
          className="kpi-icon-box"
          style={{ background: iconBg, color: iconColor }}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Area Chart Card Component
// ═══════════════════════════════════════════════════════════════════
function RevenueAreaChart({ data }) {
  const chartData = useMemo(() => (data || []).slice(-14), [data]);

  return (
    <motion.div variants={itemVariants} className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Doanh thu & Lãi gộp</h3>
          <p className="chart-subtitle">14 ngày gần nhất</p>
        </div>
        <div className="chart-badge">
          <Activity size={14} />
          <span>Realtime</span>
        </div>
      </div>

      <div className="chart-body" style={{ height: 290 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-light)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}tr` : `${(v / 1000).toFixed(0)}k`}
              dx={-4}
            />
            <Tooltip content={<CustomAreaTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Doanh thu"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#gradRevenue)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#2563eb' }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="Lãi gộp"
              stroke="#16a34a"
              strokeWidth={2}
              fill="url(#gradProfit)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#16a34a' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        <div className="chart-legend-item">
          <span className="chart-legend-dot" style={{ background: '#2563eb' }} />
          <span>Doanh thu</span>
        </div>
        <div className="chart-legend-item">
          <span className="chart-legend-dot" style={{ background: '#16a34a' }} />
          <span>Lãi gộp</span>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Hourly Bar Chart Component
// ═══════════════════════════════════════════════════════════════════
function HourlyBarChart({ data }) {
  const chartData = useMemo(() => data || [], [data]);

  return (
    <motion.div variants={itemVariants} className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Doanh thu theo giờ</h3>
          <p className="chart-subtitle">Hôm nay</p>
        </div>
        <div className="chart-badge">
          <Clock size={14} />
          <span>Live</span>
        </div>
      </div>

      <div className="chart-body" style={{ height: 290 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d4ed8" stopOpacity={1} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.85} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-light)"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}tr` : `${(v / 1000).toFixed(0)}k`}
              dx={-4}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(37, 99, 235, 0.06)', radius: 6 }} />
            <Bar
              dataKey="revenue"
              fill="url(#barGrad)"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
              activeBar={{ fill: 'url(#barGradHover)' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Yearly Summary & Monthly Chart
// ═══════════════════════════════════════════════════════════════════
function YearlySummaryCard({ yearlyRevenue, yearlySummary, formatCurrency }) {
  return (
    <motion.div variants={itemVariants} className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Tổng kết năm 2026</h3>
          <p className="chart-subtitle">So sánh với năm trước</p>
        </div>
      </div>

      {/* Summary Boxes */}
      <div className="yearly-summary-header">
        <div className="yearly-summary-item">
          <p className="label">DT năm nay</p>
          <p className="value">{formatCurrency(yearlySummary.revenueThisYear)}</p>
        </div>
        <div className="yearly-summary-item">
          <p className="label">DT năm ngoái</p>
          <p className="value">{formatCurrency(yearlySummary.revenueLastYear)}</p>
        </div>
        <div className="yearly-summary-item">
          <p className="label">Lãi gộp năm nay</p>
          <p className="value profit">{formatCurrency(yearlySummary.profitThisYear)}</p>
        </div>
      </div>

      <div className="chart-body" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={yearlyRevenue} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000000000 ? `${(v / 1000000000).toFixed(0)}tỷ` : `${(v / 1000000).toFixed(0)}tr`}
              dx={-4}
            />
            <Tooltip content={<CustomAreaTooltip />} />
            <Bar dataKey="revenueLastYear" name="Năm ngoái" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Bar dataKey="revenueThisYear" name="Năm nay" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        <div className="chart-legend-item">
          <span className="chart-legend-dot" style={{ background: '#2563eb' }} />
          <span>Năm nay</span>
        </div>
        <div className="chart-legend-item">
          <span className="chart-legend-dot" style={{ background: '#cbd5e1' }} />
          <span>Năm ngoái</span>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Top Products Card
// ═══════════════════════════════════════════════════════════════════
function TopProductsCard({ products, formatCurrency }) {
  const rankStyles = ['gold', 'silver', 'bronze'];

  // Use provided data or fallback to mock
  const items = products && products.length > 0 ? products : [
    { id: '1', name: 'Paracetamol 500mg', quantity: 342, revenue: 17100000, profit: 5130000, profitMargin: 0.30 },
    { id: '2', name: 'Amoxicillin 500mg', quantity: 285, revenue: 14250000, profit: 3562500, profitMargin: 0.25 },
    { id: '3', name: 'Vitamin C 1000mg', quantity: 268, revenue: 10720000, profit: 3752000, profitMargin: 0.35 },
    { id: '4', name: 'Omeprazole 20mg', quantity: 195, revenue: 9750000, profit: 2925000, profitMargin: 0.30 },
    { id: '5', name: 'Cetirizine 10mg', quantity: 178, revenue: 7120000, profit: 2136000, profitMargin: 0.30 },
    { id: '6', name: 'Metformin 500mg', quantity: 165, revenue: 6600000, profit: 1650000, profitMargin: 0.25 },
    { id: '7', name: 'Ibuprofen 400mg', quantity: 152, revenue: 6080000, profit: 1824000, profitMargin: 0.30 },
    { id: '8', name: 'Azithromycin 250mg', quantity: 140, revenue: 8400000, profit: 2520000, profitMargin: 0.30 },
  ];

  return (
    <motion.div variants={itemVariants} className="chart-card">
      <div className="chart-header" style={{ paddingBottom: 16 }}>
        <div>
          <h3 className="chart-title">Top thuốc bán chạy</h3>
          <p className="chart-subtitle">Trong tháng này</p>
        </div>
        <div className="chart-badge">
          <Trophy size={14} />
          <span>Top 8</span>
        </div>
      </div>

      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {items.map((product, index) => (
          <div key={product.id} className="top-product-item">
            <div className={`top-product-rank ${rankStyles[index] || 'default'}`}>
              {index + 1}
            </div>
            <div className="top-product-info">
              <div className="top-product-name">{product.name}</div>
              <div className="top-product-qty">SL: {product.quantity.toLocaleString('vi-VN')}</div>
            </div>
            <div className="top-product-revenue">
              <div className="amount">{formatCurrency(product.revenue)}</div>
              {product.profitMargin > 0 && (
                <div className="margin">▲ {(product.profitMargin * 100).toFixed(0)}%</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { data, loading, formatCurrency, formatNumber } = useDashboard();

  // Today's date formatted
  const today = new Date();
  const dateStr = today.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // ── Loading Skeleton ────────────────────────────────────────────
  if (loading || !data || !data.kpi) {
    return (
      <div className="dashboard-page">
        <div className="kpi-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="dashboard-skeleton"
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                border: '1px solid var(--color-border-light)',
              }}
            >
              <Skeleton active paragraph={{ rows: 1 }} />
            </div>
          ))}
        </div>
        <div className="charts-grid" style={{ marginTop: 20 }}>
          <div className="dashboard-skeleton" style={{ background: '#fff', borderRadius: 16, padding: 24, height: 380, border: '1px solid var(--color-border-light)' }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
          <div className="dashboard-skeleton" style={{ background: '#fff', borderRadius: 16, padding: 24, height: 380, border: '1px solid var(--color-border-light)' }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  const { kpi } = data;

  return (
    <motion.div
      className="dashboard-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Dashboard Header ─────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="dashboard-header">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1>Tổng quan</h1>
            <p className="subtitle">Theo dõi hoạt động kinh doanh nhà thuốc</p>
          </div>
          <div className="date-pill">
            <CalendarDays size={15} />
            <span>{dateStr}</span>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Grid (4x2) ────────────────────────────────────────── */}
      <motion.div variants={containerVariants} className="kpi-grid">
        <KPICard
          label="Doanh thu hôm nay"
          value={formatCurrency(kpi.revenueToday)}
          icon={TrendingUp}
          iconBg="var(--color-revenue-bg)"
          iconColor="var(--color-revenue)"
          variant="revenue"
          sub="+12.5% so hôm qua"
          subType="positive"
        />
        <KPICard
          label="Lãi gộp hôm nay"
          value={formatCurrency(kpi.profitToday)}
          icon={BarChart3}
          iconBg="var(--color-profit-bg)"
          iconColor="var(--color-profit)"
          variant="profit"
          sub={`Biên lãi ${kpi.profitMarginToday}%`}
          subType="positive"
        />
        <KPICard
          label="Hóa đơn hôm nay"
          value={formatNumber(kpi.invoicesToday)}
          icon={FileText}
          iconBg="#f5f3ff"
          iconColor="#7c3aed"
          variant="invoices"
          sub={`TB ${formatCurrency(kpi.avgInvoiceValue)}/HĐ`}
          subType="neutral"
        />
        <KPICard
          label="Doanh thu tháng"
          value={formatCurrency(kpi.revenueMonth)}
          icon={CalendarDays}
          iconBg="#ecfeff"
          iconColor="#0891b2"
          variant="month-revenue"
          sub="Tháng hiện tại"
          subType="neutral"
        />
        <KPICard
          label="Công nợ khách hàng"
          value={formatCurrency(kpi.customerDebt)}
          icon={Users}
          iconBg="var(--color-debt-bg)"
          iconColor="var(--color-debt)"
          variant="debt-customer"
          sub={kpi.customerDebt > 0 ? 'Cần thu hồi' : 'Không có nợ'}
          subType={kpi.customerDebt > 0 ? 'warning' : 'neutral'}
        />
        <KPICard
          label="Công nợ nhà cung cấp"
          value={formatCurrency(kpi.supplierDebt)}
          icon={ShoppingCart}
          iconBg="var(--color-warning-bg)"
          iconColor="var(--color-warning)"
          variant="debt-supplier"
          sub={kpi.supplierDebt > 0 ? 'Cần thanh toán' : 'Không có nợ'}
          subType={kpi.supplierDebt > 0 ? 'warning' : 'neutral'}
        />
        <KPICard
          label="Giá trị tồn kho"
          value={formatCurrency(kpi.inventoryValue)}
          icon={Package}
          iconBg="var(--color-inventory-bg)"
          iconColor="var(--color-inventory)"
          variant="inventory-value"
          sub="Tổng giá vốn"
          subType="neutral"
        />
        <KPICard
          label="Biên lãi gộp tháng"
          value={`${kpi.profitMarginMonth}%`}
          icon={Percent}
          iconBg="#ecfdf5"
          iconColor="#059669"
          variant="margin"
          sub={kpi.profitMarginMonth >= 25 ? 'Hiệu suất tốt' : 'Cần cải thiện'}
          subType={kpi.profitMarginMonth >= 25 ? 'positive' : 'warning'}
        />
      </motion.div>

      {/* ── Charts Row: Area + Bar ────────────────────────────────── */}
      <motion.div variants={containerVariants} className="charts-grid">
        <RevenueAreaChart data={data.revenueProfit30Days} />
        <HourlyBarChart data={data.hourlyRevenueToday} />
      </motion.div>

      {/* ── Bottom Row: Yearly + Top Products ─────────────────────── */}
      <motion.div variants={containerVariants} className="bottom-grid">
        <YearlySummaryCard
          yearlyRevenue={data.yearlyRevenue}
          yearlySummary={data.yearlySummary}
          formatCurrency={formatCurrency}
        />
        <TopProductsCard
          products={data.topProducts}
          formatCurrency={formatCurrency}
        />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
