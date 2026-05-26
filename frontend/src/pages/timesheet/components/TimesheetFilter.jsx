import React from 'react';
import { Button, DatePicker, Select, Space, Segmented } from 'antd';
import { Filter, RotateCcw } from 'lucide-react';
import { STAFF_OPTIONS } from '../timesheetData';

const { RangePicker } = DatePicker;

const TimesheetFilter = ({ filters, onChange, onApply, onReset }) => {
  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">Kỳ công:</span>
            <Segmented
              value={filters.period}
              onChange={(period) => onChange({ period })}
              options={[
                { value: 'today', label: 'Hôm nay' },
                { value: 'week', label: 'Tuần này' },
                { value: 'month', label: 'Tháng này' },
                { value: 'all', label: 'Tất cả' },
              ]}
              className="bg-[var(--color-bg-subtle)]"
            />
          </div>

          <Space size={12} wrap>
            <Button type="primary" icon={<Filter size={16} className="mr-2 inline" />} className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-6 font-medium" onClick={onApply}>
              Lọc
            </Button>
            <Button icon={<RotateCcw size={16} className="mr-2 inline" />} className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-secondary)]" onClick={onReset}>
              Reset
            </Button>
          </Space>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border-light)] pt-4">
          <Select value={filters.staffId} onChange={(staffId) => onChange({ staffId })} className="h-10 w-[220px]" options={STAFF_OPTIONS} />
          <Select
            value={filters.status}
            onChange={(status) => onChange({ status })}
            className="h-10 w-[190px]"
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'complete', label: 'Đủ công' },
              { value: 'late', label: 'Đi muộn' },
              { value: 'missing', label: 'Thiếu chấm công' },
              { value: 'overtime', label: 'Tăng ca' },
            ]}
          />
          <Select
            value={filters.method}
            onChange={(method) => onChange({ method })}
            className="h-10 w-[170px]"
            options={[
              { value: 'all', label: 'Tất cả nguồn' },
              { value: 'pos', label: 'POS' },
              { value: 'manual', label: 'Thủ công' },
              { value: 'mobile', label: 'Mobile' },
            ]}
          />
          <RangePicker value={filters.dateRange} onChange={(dateRange) => onChange({ dateRange, period: 'custom' })} format="DD/MM/YYYY" className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)]" />
        </div>
      </div>
    </div>
  );
};

export default TimesheetFilter;
