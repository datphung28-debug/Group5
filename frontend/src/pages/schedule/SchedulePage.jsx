import React, { useMemo, useState } from 'react';
import { Button, Descriptions, Drawer, Space, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { CalendarPlus, Copy, Save } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import ScheduleFilter from './components/ScheduleFilter';
import ScheduleKPIs from './components/ScheduleKPIs';
import ScheduleBoard from './components/ScheduleBoard';
import ShiftTable from './components/ShiftTable';
import { SCHEDULE_SHIFTS, SHIFT_META, STATUS_META, WEEK_DAYS } from './scheduleData';

const initialFilters = {
  view: 'week',
  week: dayjs('2026-05-26'),
  staffId: 'all',
  shiftType: 'all',
  status: 'all',
};

const SchedulePage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [selectedShift, setSelectedShift] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const filteredShifts = useMemo(() => (
    SCHEDULE_SHIFTS.filter((shift) => {
      const matchesStaff = activeFilters.staffId === 'all' || shift.staffId === activeFilters.staffId;
      const matchesShift = activeFilters.shiftType === 'all' || shift.shiftType === activeFilters.shiftType;
      const matchesStatus = activeFilters.status === 'all' || shift.status === activeFilters.status;
      return matchesStaff && matchesShift && matchesStatus;
    })
  ), [activeFilters]);

  const summary = useMemo(() => (
    filteredShifts.reduce(
      (acc, shift) => ({
        total: acc.total + 1,
        confirmed: acc.confirmed + (shift.status === 'confirmed' ? 1 : 0),
        pending: acc.pending + (shift.status === 'pending' ? 1 : 0),
        absent: acc.absent + (shift.status === 'absent' ? 1 : 0),
      }),
      { total: 0, confirmed: 0, pending: 0, absent: 0 }
    )
  ), [filteredShifts]);

  const handleChange = (nextFilters) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
  };

  const selectedDay = selectedShift ? WEEK_DAYS.find((day) => day.key === selectedShift.day) : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
      {contextHolder}
      <PageHeader
        title="Lịch phân ca"
        subtitle="Sắp xếp, theo dõi và xác nhận ca làm của nhân sự nhà thuốc"
        actions={
          <Space size={12} wrap>
            <Button
              icon={<Copy size={18} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              onClick={() => messageApi.info('Sao chép lịch tuần sẽ được nối với API khi có backend phân ca.')}
            >
              Sao chép tuần
            </Button>
            <Button
              type="primary"
              icon={<CalendarPlus size={18} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-6 font-medium shadow-[var(--shadow-card)]"
              onClick={() => messageApi.info('Tạo ca làm sẽ được nối với API khi có backend phân ca.')}
            >
              Tạo ca làm
            </Button>
          </Space>
        }
      />

      <ScheduleFilter
        filters={filters}
        onChange={handleChange}
        onApply={() => setActiveFilters(filters)}
        onReset={() => {
          setFilters(initialFilters);
          setActiveFilters(initialFilters);
        }}
      />

      <ScheduleKPIs summary={summary} />

      {activeFilters.view === 'week' ? (
        <div className="overflow-x-auto">
          <ScheduleBoard shifts={filteredShifts} onSelect={setSelectedShift} />
        </div>
      ) : (
        <ShiftTable data={filteredShifts} onSelect={setSelectedShift} />
      )}

      <Drawer
        title="Chi tiết ca làm"
        placement="right"
        width={520}
        open={Boolean(selectedShift)}
        onClose={() => setSelectedShift(null)}
        extra={
          <Button
            type="primary"
            icon={<Save size={16} />}
            className="rounded-[var(--radius-md)] border-none bg-[var(--color-primary)]"
            onClick={() => messageApi.info('Lưu thay đổi ca làm sẽ được nối với API khi có backend phân ca.')}
          >
            Lưu
          </Button>
        }
      >
        {selectedShift && (
          <div className="space-y-5">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] p-4">
              <div className="font-semibold text-[var(--color-text-primary)]">{selectedShift.staffName}</div>
              <div className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{selectedShift.role} · {selectedShift.area}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag className="m-0 rounded-full border px-3 py-1 font-medium" style={{ color: SHIFT_META[selectedShift.shiftType].color, backgroundColor: SHIFT_META[selectedShift.shiftType].bg, borderColor: SHIFT_META[selectedShift.shiftType].border }}>
                  {SHIFT_META[selectedShift.shiftType].label}
                </Tag>
                <Tag className="m-0 rounded-full border px-3 py-1 font-medium" style={{ color: STATUS_META[selectedShift.status].color, backgroundColor: STATUS_META[selectedShift.status].bg, borderColor: STATUS_META[selectedShift.status].border }}>
                  {STATUS_META[selectedShift.status].label}
                </Tag>
              </div>
            </div>

            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Ngày làm">{selectedDay ? `${selectedDay.label} - ${selectedDay.date}` : '--'}</Descriptions.Item>
              <Descriptions.Item label="Giờ làm">{SHIFT_META[selectedShift.shiftType].time}</Descriptions.Item>
              <Descriptions.Item label="Khu vực">{selectedShift.area}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{selectedShift.note}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SchedulePage;
