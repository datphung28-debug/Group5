import React from 'react';
import { Button, DatePicker, Input, Select, Space, Segmented } from 'antd';
import { FileBarChart, RotateCcw, Search } from 'lucide-react';

const { RangePicker } = DatePicker;

const InventoryFlowFilter = ({
  filters,
  categories,
  onChange,
  onApply,
  onReset,
  loading,
}) => {
  return (
    <div className="bg-white p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] shadow-[var(--shadow-card)] mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[var(--color-text-secondary)] font-medium text-[13px]">Kỳ báo cáo:</span>
            <Segmented
              value={filters.period}
              onChange={(period) => onChange({ period })}
              options={[
                { value: 'today', label: 'Hôm nay' },
                { value: '7days', label: '7 ngày' },
                { value: 'month', label: 'Tháng này' },
                { value: 'quarter', label: 'Quý này' },
              ]}
              className="bg-[var(--color-bg-subtle)]"
            />
          </div>

          <Space size={12} wrap>
            <Button
              type="primary"
              loading={loading}
              icon={<FileBarChart size={16} className="mr-2 inline" />}
              className="h-10 px-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] font-medium"
              onClick={onApply}
            >
              Xem báo cáo
            </Button>
            <Button
              icon={<RotateCcw size={16} className="mr-2 inline" />}
              className="h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
              onClick={onReset}
            >
              Reset
            </Button>
          </Space>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--color-border-light)]">
          <Input
            allowClear
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Tìm mã thuốc, tên thuốc..."
            prefix={<Search size={16} className="text-[var(--color-text-muted)]" />}
            className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] flex-1 min-w-[260px]"
          />

          <Select
            value={filters.category}
            onChange={(category) => onChange({ category })}
            className="h-10 w-[220px]"
            options={[
              { value: 'all', label: 'Tất cả nhóm thuốc' },
              ...categories.map((category) => ({ value: category, label: category })),
            ]}
          />

          <RangePicker
            value={filters.range}
            onChange={(range) => onChange({ range, period: 'custom' })}
            format="DD/MM/YYYY"
            className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)]"
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryFlowFilter;
