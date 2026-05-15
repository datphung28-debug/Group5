import React, { useEffect } from 'react';
import { Button, Space } from 'antd';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import RevenueKPIs from './components/RevenueKPIs';
import RevenueFilter from './components/RevenueFilter';
import RevenueCharts from './components/RevenueCharts';
import useRevenueReportStore from '../../../stores/useRevenueReportStore';

const RevenueReportPage = () => {
  const { fetchReport } = useRevenueReportStore();

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportActions = (
    <Space size={12}>
      <Button
        icon={<FileSpreadsheet size={18} className="mr-2 inline" />}
        className="flex items-center h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        Xuất CSV
      </Button>
      <Button
        icon={<Download size={18} className="mr-2 inline" />}
        className="flex items-center h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        Xuất Excel
      </Button>
      <Button
        icon={<FileText size={18} className="mr-2 inline" />}
        className="flex items-center h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        Xuất PDF
      </Button>
    </Space>
  );

  return (
    <div className="p-6 min-h-screen bg-[var(--color-bg-app)]">
      <PageHeader
        title="Báo cáo doanh thu"
        subtitle="Phân tích doanh thu, lãi gộp và phương thức thanh toán"
        actions={exportActions}
      />

      {/* Filter Section */}
      <RevenueFilter />

      {/* KPI Section */}
      <RevenueKPIs />

      {/* Charts Section - Now the main focus */}
      <RevenueCharts />
    </div>
  );
};

export default RevenueReportPage;
