import React from 'react';
import { Button, Input, Select, Space, Segmented } from 'antd';
import { Filter, RotateCcw, Search } from 'lucide-react';

const DebtFilter = ({ filters, onChange, onReset }) => {
  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">Loại công nợ:</span>
            <Segmented
              value={filters.type}
              onChange={(type) => onChange({ type })}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'supplier', label: 'Nhà cung cấp' },
                { value: 'overdue', label: 'Quá hạn' },
              ]}
              className="bg-[var(--color-bg-subtle)]"
            />
          </div>

          <Space size={12} wrap>
            <Button
              type="primary"
              icon={<Filter size={16} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-6 font-medium hover:bg-[var(--color-primary-hover)]"
            >
              Lọc
            </Button>
            <Button
              icon={<RotateCcw size={16} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              onClick={onReset}
            >
              Reset
            </Button>
          </Space>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border-light)] pt-4">
          <Input
            allowClear
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Tìm nhà cung cấp, mã NCC, số điện thoại..."
            prefix={<Search size={16} className="text-[var(--color-text-muted)]" />}
            className="h-10 min-w-[280px] flex-1 rounded-[var(--radius-md)] border-[var(--color-border)]"
          />

          <Select
            value={filters.status}
            onChange={(status) => onChange({ status })}
            className="h-10 w-[190px]"
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'Đang nợ', label: 'Đang nợ' },
              { value: 'Quá hạn', label: 'Quá hạn' },
              { value: 'Bình thường', label: 'Bình thường' },
              { value: 'Tạm ngưng', label: 'Tạm ngưng' },
            ]}
          />

          <Select
            value={filters.risk}
            onChange={(risk) => onChange({ risk })}
            className="h-10 w-[180px]"
            options={[
              { value: 'all', label: 'Tất cả mức rủi ro' },
              { value: 'high', label: 'Rủi ro cao' },
              { value: 'medium', label: 'Cần theo dõi' },
              { value: 'low', label: 'An toàn' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default DebtFilter;
