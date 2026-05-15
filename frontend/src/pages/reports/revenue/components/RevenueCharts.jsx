import React, { useMemo } from 'react';
import { Card, Row, Col, Typography, Spin, Empty } from 'antd';
import { Pie } from '@ant-design/charts';
import { 
  ComposedChart, 
  Bar as ReBar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReTooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Cell,
  LabelList
} from 'recharts';
import useRevenueReportStore from '../../../../stores/useRevenueReportStore';

const { Text } = Typography;

// Helper to format large numbers for axes and labels (Vietnamese format: tr = triệu, k = nghìn)
const formatCompactNumber = (value) => {
  if (value === 0) return '0';
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}tr`;
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toString();
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-lg outline-none">
        <p className="text-[13px] font-bold text-slate-800 mb-2 border-b border-slate-50 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6 mb-1 last:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-[12px] text-slate-500 font-medium">{entry.name}</span>
            </div>
            <span className="text-[12px] font-bold text-slate-800">{entry.value.toLocaleString()}đ</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueCharts = () => {
  const { trendData, paymentData, categoryData, loading } = useRevenueReportStore();

  // Transform trendData for Recharts: [ { date, revenue, profit }, ... ]
  const transformedTrendData = useMemo(() => {
    const map = new Map();
    trendData.forEach(item => {
      if (!map.has(item.date)) {
        map.set(item.date, { date: item.date });
      }
      const entry = map.get(item.date);
      if (item.type === 'Doanh thu') entry.revenue = item.value;
      if (item.type === 'Lãi gộp') entry.profit = item.value;
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [trendData]);

  // Sort categories by revenue descending for Recharts horizontal bar
  const sortedCategoryData = useMemo(() => {
    return [...categoryData].sort((a, b) => b.revenue - a.revenue);
  }, [categoryData]);

  const paymentConfig = {
    data: paymentData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.85,
    innerRadius: 0.65,
    padding: 0,
    label: {
      text: 'value',
      position: 'outside',
      formatter: (v) => formatCompactNumber(v),
      style: {
        fontSize: 12,
        fontWeight: 600,
        fill: '#4a6080',
      },
    },
    legend: {
      color: {
        position: 'bottom',
        layout: {
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        },
      },
    },
    tooltip: {
      items: [
        { channel: 'y', valueFormatter: (v) => v.toLocaleString() + 'đ' }
      ]
    },
    color: ['#16a34a', '#2563eb', '#d97706', '#7c3aed'],
    style: {
      stroke: '#fff',
      inset: 2,
    }
  };

  const renderLoadingOrEmpty = (data) => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <Spin size="large" />
          <span className="text-[13px] text-slate-400 font-medium animate-pulse">Đang xử lý dữ liệu...</span>
        </div>
      );
    }
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <Empty description="Không có dữ liệu báo cáo" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-6">
      <Row gutter={[16, 16]}>
        {/* Revenue Trend - Recharts ComposedChart */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div className="flex flex-col">
                <span className="text-[15px] text-slate-800 font-bold leading-tight">Xu hướng Doanh thu & Lãi gộp</span>
                <span className="text-[12px] text-slate-400 font-normal mt-1">Biểu đồ tổng hợp kết quả kinh doanh theo thời gian</span>
              </div>
            }
            className="shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)] border-slate-100 rounded-xl h-full"
            bodyStyle={{ padding: '24px 16px 12px 16px' }}
          >
            <div className="h-[380px] w-full">
              {renderLoadingOrEmpty(transformedTrendData) || (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={transformedTrendData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={formatCompactNumber}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={formatCompactNumber}
                    />
                    <ReTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle" 
                      wrapperStyle={{ paddingBottom: 20, fontSize: 12, fontWeight: 500 }}
                    />
                    <ReBar 
                      name="Doanh thu" 
                      dataKey="revenue" 
                      fill="#2563eb" 
                      radius={[4, 4, 0, 0]} 
                      barSize={32}
                    />
                    <Line 
                      yAxisId="right"
                      name="Lãi gộp" 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#16a34a" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#16a34a' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </Col>

        {/* Payment Distribution - Ant Design Charts Pie (Unchanged) */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className="flex flex-col">
                <span className="text-[15px] text-slate-800 font-bold leading-tight">Phân bổ Thanh toán</span>
                <span className="text-[12px] text-slate-400 font-normal mt-1">Cơ cấu dòng tiền theo phương thức</span>
              </div>
            }
            className="shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)] border-slate-100 rounded-xl h-full"
            bodyStyle={{ padding: '12px' }}
          >
            <div className="h-[380px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Spin size="large" />
                </div>
              ) : !paymentData || paymentData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Empty description="Không có dữ liệu" />
                </div>
              ) : (
                <Pie {...paymentConfig} />
              )}
            </div>
          </Card>
        </Col>

        {/* Revenue By Category - Recharts BarChart */}
        <Col xs={24}>
          <Card 
            title={
              <div className="flex flex-col">
                <span className="text-[15px] text-slate-800 font-bold leading-tight">Cơ cấu Doanh thu theo Nhóm thuốc</span>
                <span className="text-[12px] text-slate-400 font-normal mt-1">Phân tích hiệu quả kinh doanh của từng danh mục sản phẩm</span>
              </div>
            }
            className="shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)] border-slate-100 rounded-xl"
            bodyStyle={{ padding: '24px 20px' }}
          >
            <div className="h-[450px] w-full">
              {renderLoadingOrEmpty(sortedCategoryData) || (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={sortedCategoryData} 
                    layout="vertical" 
                    margin={{ top: 5, right: 80, left: 40, bottom: 5 }}
                    barSize={24}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="category" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#4a6080', fontSize: 13, fontWeight: 500 }}
                      width={120}
                    />
                    <ReTooltip 
                      content={<CustomTooltip />} 
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <ReBar 
                      dataKey="revenue" 
                      name="Doanh thu" 
                      radius={[0, 4, 4, 0]}
                    >
                      {sortedCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#3b82f6'} fillOpacity={1 - (index * 0.1)} />
                      ))}
                      <LabelList 
                        dataKey="revenue" 
                        position="right" 
                        content={({ x, y, width, value }) => (
                          <text 
                            x={x + width + 10} 
                            y={y + 16} 
                            fill="#1e40af" 
                            fontSize={12} 
                            fontWeight={700} 
                            textAnchor="start"
                          >
                            {formatCompactNumber(value)}
                          </text>
                        )}
                      />
                    </ReBar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RevenueCharts;
