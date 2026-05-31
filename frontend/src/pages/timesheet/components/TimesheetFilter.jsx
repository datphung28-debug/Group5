import React from 'react';
import { Button, DatePicker, Select, Space, Segmented } from 'antd';
import { Filter, RotateCcw } from 'lucide-react';

const { RangePicker } = DatePicker;

const TimesheetFilter = ({ filters, onChange, onApply, onReset, staffOptions = [{ value: 'all', label: 'Tất cả nhân viên' }] }) => {
  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Kỳ công Segmented */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">Kỳ công:</span>
            <Segmented
              value={filters.period}
              onChange={(period) => {
                onChange({ period });
                onApply({ ...filters, period });
              }}
              options={[
                { value: 'today', label: 'Hôm nay' },
                { value: 'week', label: 'Tuần này' },
                { value: 'month', label: 'Tháng này' },
                { value: 'all', label: 'Tất cả' },
              ]}
              className="bg-[var(--color-bg-subtle)]"
            />
          </div>

          <div className="hidden md:block h-6 w-px bg-[var(--color-border-light)]" />

          {/* Chọn nhân viên */}
          <Select 
            value={filters.staffId} 
            onChange={(staffId) => {
              onChange({ staffId });
              onApply({ ...filters, staffId });
            }} 
            className="h-10 w-[200px]" 
            options={staffOptions} 
          />

          {/* Chọn khoảng ngày */}
          <RangePicker 
            value={filters.dateRange} 
            onChange={(dateRange) => {
              onChange({ dateRange, period: 'custom' });
              onApply({ ...filters, dateRange, period: 'custom' });
            }} 
            format="DD/MM/YYYY" 
            className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)]" 
          />
        </div>

        {/* Buttons aligned in the same row */}
        <div className="flex items-center gap-2">
          <Button 
            type="primary" 
            icon={<Filter size={16} className="mr-1.5 inline" />} 
            className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-5 font-medium flex items-center justify-center" 
            onClick={() => onApply(filters)}
          >
            Lọc
          </Button>
          <Button 
            icon={<RotateCcw size={16} className="mr-1.5 inline" />} 
            className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-secondary)] flex items-center justify-center" 
            onClick={onReset}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimesheetFilter;
