import React from 'react';
import { Button, Select, DatePicker, Space, Row, Col, Segmented } from 'antd';
import { Filter, RotateCcw, FileBarChart } from 'lucide-react';
import useRevenueReportStore from '../../../../stores/useRevenueReportStore';

const CashbookFilter = () => {
  const { filters, setFilters, fetchReport, loading } = useRevenueReportStore();

  return (
    <div className="bg-white p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] shadow-[var(--shadow-card)] mb-6">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} lg={12}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[var(--color-text-secondary)] font-medium text-[13px]">Khoảng thời gian:</span>
            <Segmented
              options={['Hôm nay', '7 ngày', 'Tháng này', 'Tháng trước', 'Quý này']}
              className="bg-[var(--color-bg-subtle)]"
              defaultValue="Tháng này"
            />
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="flex justify-end items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-text-secondary)] text-[13px]">So sánh:</span>
              <Select
                className="w-40 h-9"
                defaultValue="none"
                options={[
                  { value: 'none', label: 'Không so sánh' },
                  { value: 'previous_period', label: 'Kỳ trước' },
                  { value: 'previous_month', label: 'Tháng trước' },
                  { value: 'previous_year', label: 'Năm trước' },
                ]}
              />
            </div>
            <Button 
              type="primary"
              loading={loading}
              icon={<FileBarChart size={16} className="mr-2 inline" />}
              className="h-10 px-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] font-medium"
              onClick={fetchReport}
            >
              Xem báo cáo
            </Button>
          </div>
        </Col>

        <Col xs={24}>
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--color-border-light)]">
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-text-secondary)] text-[13px]">Từ ngày:</span>
              <DatePicker className="h-9 w-36" format="DD/MM/YYYY" defaultValue={filters.fromDate} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--color-text-secondary)] text-[13px]">Đến ngày:</span>
              <DatePicker className="h-9 w-36" format="DD/MM/YYYY" defaultValue={filters.toDate} />
            </div>
            <Button 
              type="text"
              icon={<RotateCcw size={14} className="mr-1 inline" />}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] h-9 text-[13px]"
            >
              Đặt lại
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CashbookFilter;
