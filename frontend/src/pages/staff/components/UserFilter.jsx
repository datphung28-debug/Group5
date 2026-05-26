import React from 'react';
import { Button, Input, Select, Space, Segmented } from 'antd';
import { Filter, RotateCcw, Search } from 'lucide-react';

const UserFilter = ({ filters, onChange, onApply, onReset }) => {
  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">Nhóm tài khoản:</span>
            <Segmented
              value={filters.role}
              onChange={(role) => onChange({ role })}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'admin', label: 'Quản trị' },
                { value: 'pharmacist', label: 'Dược sĩ' },
                { value: 'customer', label: 'Khách hàng' },
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
            placeholder="Tìm tên, email, số điện thoại..."
            prefix={<Search size={16} className="text-[var(--color-text-muted)]" />}
            className="h-10 min-w-[280px] flex-1 rounded-[var(--radius-md)] border-[var(--color-border)]"
          />

          <Select
            value={filters.status}
            onChange={(status) => onChange({ status })}
            className="h-10 w-[180px]"
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'active', label: 'Đang hoạt động' },
              { value: 'locked', label: 'Đã khóa' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default UserFilter;
