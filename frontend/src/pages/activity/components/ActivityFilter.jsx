import React from 'react';
import { Button, DatePicker, Input, Select, Space, Segmented } from 'antd';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { ACTION_META, MODULE_LABELS } from '../activityData';

const { RangePicker } = DatePicker;

const ActivityFilter = ({ filters, onChange, onApply, onReset }) => {
  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">Thời gian:</span>
            <Segmented
              value={filters.period}
              onChange={(period) => onChange({ period })}
              options={[
                { value: 'today', label: 'Hôm nay' },
                { value: '7days', label: '7 ngày' },
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
          <Input
            allowClear
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Tìm người dùng, đối tượng, nội dung..."
            prefix={<Search size={16} className="text-[var(--color-text-muted)]" />}
            className="h-10 min-w-[280px] flex-1 rounded-[var(--radius-md)] border-[var(--color-border)]"
          />
          <Select
            value={filters.module}
            onChange={(module) => onChange({ module })}
            className="h-10 w-[180px]"
            options={[{ value: 'all', label: 'Tất cả phân hệ' }, ...Object.entries(MODULE_LABELS).map(([value, label]) => ({ value, label }))]}
          />
          <Select
            value={filters.action}
            onChange={(action) => onChange({ action })}
            className="h-10 w-[160px]"
            options={[{ value: 'all', label: 'Tất cả thao tác' }, ...Object.entries(ACTION_META).map(([value, meta]) => ({ value, label: meta.label }))]}
          />
          <RangePicker
            value={filters.dateRange}
            onChange={(dateRange) => onChange({ dateRange, period: 'custom' })}
            format="DD/MM/YYYY"
            className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)]"
          />
        </div>
      </div>
    </div>
  );
};

export default ActivityFilter;
