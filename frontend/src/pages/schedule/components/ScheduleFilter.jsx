import React from 'react';
import { Button, DatePicker, Select, Segmented } from 'antd';
import { Filter, RotateCcw } from 'lucide-react';
import { STAFF_OPTIONS } from '../scheduleData';

const ScheduleFilter = ({ filters, onChange, onApply, onReset, staffOptions = STAFF_OPTIONS }) => {
  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4">
        {/* Hàng 1: Chế độ xem */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">Chế độ xem:</span>
            <Segmented
              value={filters.view}
              onChange={(view) => onChange({ view })}
              options={[
                { value: 'week', label: 'Theo tuần' },
                { value: 'list', label: 'Danh sách ca' },
              ]}
              className="bg-[var(--color-bg-subtle)]"
            />
          </div>
        </div>

        {/* Hàng 2: Bộ lọc và các nút Lọc/Reset */}
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border-light)] pt-4">
          <DatePicker
            picker="week"
            value={filters.week}
            onChange={(week) => onChange({ week })}
            format="wo [năm] YYYY"
            className="h-10 min-w-[190px] rounded-[var(--radius-md)] border-[var(--color-border)]"
          />
          <Select
            value={filters.staffId}
            onChange={(staffId) => onChange({ staffId })}
            className="h-10 w-[220px]"
            options={staffOptions}
          />
          <Select
            value={filters.shiftType}
            onChange={(shiftType) => onChange({ shiftType })}
            className="h-10 w-[170px]"
            options={[
              { value: 'all', label: 'Tất cả ca' },
              { value: 'morning', label: 'Ca sáng' },
              { value: 'afternoon', label: 'Ca chiều' },
              { value: 'evening', label: 'Ca tối' },
            ]}
          />
          <Select
            value={filters.status}
            onChange={(status) => onChange({ status })}
            className="h-10 w-[180px]"
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'confirmed', label: 'Có mặt' },
              { value: 'absent', label: 'Vắng mặt' },
              { value: 'late', label: 'Đến muộn' },
            ]}
          />
          <div className="flex items-center gap-3 sm:ml-auto">
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
              className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-secondary)]"
              onClick={onReset}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleFilter;
