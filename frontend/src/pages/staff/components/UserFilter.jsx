import React from 'react';
import { Button, Input, Select, Segmented } from 'antd';
import { RotateCcw, Search } from 'lucide-react';

const UserFilter = ({ filters, onChange, onApply, onReset }) => {
  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4">
        {/* Hàng 1: Bộ lọc vai trò và nút Reset */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">Nhóm tài khoản:</span>
            <Segmented
              value={filters.role}
              onChange={(role) => onChange({ role }, true)}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'admin', label: 'Quản trị' },
                { value: 'pharmacist', label: 'Dược sĩ' },
              ]}
              className="bg-[var(--color-bg-subtle)]"
            />
          </div>

          <Button
            icon={<RotateCcw size={16} className="mr-2 inline" />}
            className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            onClick={onReset}
          >
            Reset bộ lọc
          </Button>
        </div>

        {/* Hàng 2: Bộ lọc Tìm kiếm (Input + Button Search) và Bộ lọc Trạng thái */}
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border-light)] pt-4">
          <div className="flex flex-1 min-w-[280px] gap-2">
            <Input
              allowClear
              value={filters.search}
              onChange={(event) => {
                const value = event.target.value;
                // Nếu click nút x xóa hết hoặc xóa sạch text, kích hoạt lọc tức thì
                const isClear = value === '';
                onChange({ search: value }, isClear);
              }}
              onPressEnter={onApply}
              placeholder="Tìm tên, email, số điện thoại..."
              prefix={<Search size={16} className="text-[var(--color-text-muted)]" />}
              className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)]"
            />
            <Button
              type="primary"
              icon={<Search size={16} className="mr-1 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-5 font-medium hover:bg-[var(--color-primary-hover)] flex items-center justify-center"
              onClick={onApply}
            >
              Tìm kiếm
            </Button>
          </div>

          <Select
            value={filters.status}
            onChange={(status) => onChange({ status }, true)}
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
