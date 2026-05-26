import React from 'react';
import { Button, DatePicker, Input, Select, Space, Segmented } from 'antd';
import { Filter, RotateCcw, Search } from 'lucide-react';

const { RangePicker } = DatePicker;

const ReturnFilter = ({ filters, onChange, onApply, onReset }) => {
  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">Kỳ xử lý:</span>
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
            <Button
              type="primary"
              icon={<Filter size={16} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-6 font-medium hover:bg-[var(--color-primary-hover)]"
              onClick={onApply}
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
            placeholder="Tìm mã phiếu, hóa đơn, khách hàng..."
            prefix={<Search size={16} className="text-[var(--color-text-muted)]" />}
            className="h-10 min-w-[280px] flex-1 rounded-[var(--radius-md)] border-[var(--color-border)]"
          />

          <Select
            value={filters.status}
            onChange={(status) => onChange({ status })}
            className="h-10 w-[180px]"
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'pending', label: 'Chờ duyệt' },
              { value: 'approved', label: 'Đã duyệt' },
              { value: 'completed', label: 'Hoàn tất' },
              { value: 'rejected', label: 'Từ chối' },
            ]}
          />

          <Select
            value={filters.refundMethod}
            onChange={(refundMethod) => onChange({ refundMethod })}
            className="h-10 w-[180px]"
            options={[
              { value: 'all', label: 'Tất cả hình thức' },
              { value: 'cash', label: 'Tiền mặt' },
              { value: 'transfer', label: 'Chuyển khoản' },
              { value: 'store_credit', label: 'Trừ đơn sau' },
            ]}
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

export default ReturnFilter;
