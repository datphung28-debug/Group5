import { useState, useEffect } from 'react';

// Types for dashboard data
export interface KpiData {
  revenueToday: number;
  profitToday: number;
  profitMarginToday: number;
  invoicesToday: number;
  avgInvoiceValue: number;
  revenueMonth: number;
  customerDebt: number;
  supplierDebt: number;
  inventoryValue: number;
  profitMarginMonth: number;
}

export interface RevenueProfitData {
  date: string;
  revenue: number;
  profit: number;
}

export interface HourlyRevenueData {
  hour: string;
  revenue: number;
}

export interface YearlyRevenueData {
  month: string;
  revenueThisYear: number;
  revenueLastYear: number;
  profitThisYear: number;
}

export interface TopProductData {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  profit: number;
  profitMargin: number;
}

export interface DashboardData {
  kpi: KpiData;
  revenueProfit30Days: RevenueProfitData[];
  hourlyRevenueToday: HourlyRevenueData[];
  yearlyRevenue: YearlyRevenueData[];
  topProducts: TopProductData[];
  yearlySummary: {
    revenueThisYear: number;
    revenueLastYear: number;
    profitThisYear: number;
  };
}

// Mock data generator
const generateMockData = (): DashboardData => {
  // Generate 30 days data
  const revenueProfit30Days: RevenueProfitData[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    // Random revenue between 10M and 30M
    const revenue = Math.floor(Math.random() * 20000000) + 10000000;
    // Profit margin between 20% and 35%
    const profitMargin = (Math.random() * 0.15) + 0.2;
    const profit = Math.floor(revenue * profitMargin);

    revenueProfit30Days.push({ date: dateStr, revenue, profit });
  }

  // Generate hourly data (7h - 21h)
  const hourlyRevenueToday: HourlyRevenueData[] = [];
  for (let i = 7; i <= 21; i++) {
    const hourStr = `${i}h`;
    // Peak hours: 9-11h, 17-19h
    let baseRevenue = 1000000;
    if ((i >= 9 && i <= 11) || (i >= 17 && i <= 19)) {
      baseRevenue = 3000000;
    }

    const revenue = Math.floor(Math.random() * baseRevenue) + 500000;
    hourlyRevenueToday.push({ hour: hourStr, revenue });
  }

  // Generate yearly data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearlyRevenue: YearlyRevenueData[] = [];

  let totalRevThisYear = 0;
  let totalRevLastYear = 0;
  let totalProfitThisYear = 0;

  months.forEach(month => {
    const revenueLastYear = Math.floor(Math.random() * 200000000) + 300000000;
    const revenueThisYear = Math.floor(revenueLastYear * (1 + (Math.random() * 0.4 - 0.1))); // -10% to +30% growth
    const profitThisYear = Math.floor(revenueThisYear * ((Math.random() * 0.1) + 0.25)); // 25-35% margin

    totalRevThisYear += revenueThisYear;
    totalRevLastYear += revenueLastYear;
    totalProfitThisYear += profitThisYear;

    yearlyRevenue.push({ month, revenueThisYear, revenueLastYear, profitThisYear });
  });

  // Generate top products
  const productNames = [
    'Panadol Extra Đỏ', 'Berberin 100mg', 'Vitamin C 500mg', 'Khẩu trang Y tế',
    'Nước muối sinh lý', 'Decolgen', 'Eugica', 'Oresol', 'C sủi Plus', 'Salonpas'
  ];

  const topProducts: TopProductData[] = productNames.map((name, index) => {
    const quantity = Math.floor(Math.random() * 500) + 50;
    const price = Math.floor(Math.random() * 50000) + 10000;
    const revenue = quantity * price;
    const profitMargin = (Math.random() * 0.3) + 0.15; // 15-45%
    const profit = Math.floor(revenue * profitMargin);

    return {
      id: `prod-${index}`,
      name,
      quantity,
      revenue,
      profit,
      profitMargin
    };
  }).sort((a, b) => b.revenue - a.revenue);

  return {
    kpi: {
      revenueToday: 15600000,
      profitToday: 4200000,
      profitMarginToday: 26.9,
      invoicesToday: 124,
      avgInvoiceValue: 125806,
      revenueMonth: 425000000,
      customerDebt: 12500000,
      supplierDebt: 45000000,
      inventoryValue: 350000000,
      profitMarginMonth: 28.5
    },
    revenueProfit30Days,
    hourlyRevenueToday,
    yearlyRevenue,
    topProducts,
    yearlySummary: {
      revenueThisYear: totalRevThisYear,
      revenueLastYear: totalRevLastYear,
      profitThisYear: totalProfitThisYear
    }
  };
};

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // const response = await axios.get('/api/dashboard');
        // setData(response.data);

        // Using mock data for now
        setTimeout(() => {
          setData(generateMockData());
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Formatting helpers
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}tr đ`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return `${value}đ`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return {
    data,
    loading,
    formatCurrency,
    formatNumber
  };
};
