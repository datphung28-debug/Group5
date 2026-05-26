import React from 'react';
import { Button, Input, Select, Space, Segmented } from 'antd';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { PAYROLL_PERIOD_OPTIONS, PAYROLL_STAFF_OPTIONS } from '../payrollData';

const PayrollFilter = ({ filters, onChange, onApply, onReset }) => {
  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">Trạng thái:</span>
            <Segmented
              value={filters.status}
              onChange={(status) => onChange({ status })}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'pending', label: 'Chờ duyệt' },
                { value: 'approved', label: 'Đã duyệt' },
                { value: 'paid', label: 'Đã chi trả' },
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
            prefix={<Search size={16} className="text-[var(--color-text-muted)]" />}
            placeholder="Tìm nhân viên, mã phiếu..."
            className="h-10 w-full rounded-[var(--radius-md)] border-[var(--color-border)] md:w-[280px]"
          />
          <Select value={filters.period} onChange={(period) => onChange({ period })} className="h-10 w-full md:w-[200px]" options={PAYROLL_PERIOD_OPTIONS} />
          <Select value={filters.staffId} onChange={(staffId) => onChange({ staffId })} className="h-10 w-full md:w-[220px]" options={PAYROLL_STAFF_OPTIONS} />
        </div>
      </div>
    </div>
  );
};

export default PayrollFilter;
