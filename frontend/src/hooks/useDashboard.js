import { useEffect, useState } from 'react';

const generateMockData = () => {
  const revenueProfit30Days = [];
  const today = new Date();

  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    const revenue = Math.floor(Math.random() * 20000000) + 10000000;
    const profitMargin = (Math.random() * 0.15) + 0.2;
    const profit = Math.floor(revenue * profitMargin);

    revenueProfit30Days.push({ date: dateStr, revenue, profit });
  }

  const hourlyRevenueToday = [];
  for (let i = 7; i <= 21; i += 1) {
    const hourStr = `${i}h`;
    let baseRevenue = 1000000;

    if ((i >= 9 && i <= 11) || (i >= 17 && i <= 19)) {
      baseRevenue = 3000000;
    }

    const revenue = Math.floor(Math.random() * baseRevenue) + 500000;
    hourlyRevenueToday.push({ hour: hourStr, revenue });
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearlyRevenue = [];

  let totalRevThisYear = 0;
  let totalRevLastYear = 0;
  let totalProfitThisYear = 0;

  months.forEach((month) => {
    const revenueLastYear = Math.floor(Math.random() * 200000000) + 300000000;
    const revenueThisYear = Math.floor(revenueLastYear * (1 + (Math.random() * 0.4 - 0.1)));
    const profitThisYear = Math.floor(revenueThisYear * ((Math.random() * 0.1) + 0.25));

    totalRevThisYear += revenueThisYear;
    totalRevLastYear += revenueLastYear;
    totalProfitThisYear += profitThisYear;

    yearlyRevenue.push({ month, revenueThisYear, revenueLastYear, profitThisYear });
  });

  const productNames = [
    'Panadol Extra Đỏ', 'Berberin 100mg', 'Vitamin C 500mg', 'Khẩu trang Y tế',
    'Nước muối sinh lý', 'Decolgen', 'Eugica', 'Oresol', 'C sủi Plus', 'Salonpas',
  ];

  const topProducts = productNames
    .map((name, index) => {
      const quantity = Math.floor(Math.random() * 500) + 50;
      const price = Math.floor(Math.random() * 50000) + 10000;
      const revenue = quantity * price;
      const profitMargin = (Math.random() * 0.3) + 0.15;
      const profit = Math.floor(revenue * profitMargin);

      return {
        id: `prod-${index}`,
        name,
        quantity,
        revenue,
        profit,
        profitMargin,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

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
      profitMarginMonth: 28.5,
    },
    revenueProfit30Days,
    hourlyRevenueToday,
    yearlyRevenue,
    topProducts,
    yearlySummary: {
      revenueThisYear: totalRevThisYear,
      revenueLastYear: totalRevLastYear,
      profitThisYear: totalProfitThisYear,
    },
  };
};

export const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}tr đ`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }

    return `${value}đ`;
  };

  const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(value);

  return {
    data,
    loading,
    formatCurrency,
    formatNumber,
  };
};
