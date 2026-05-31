import React, { useMemo, useState, useEffect } from 'react';
import { Button, Descriptions, Space, Tag, message, Modal, Select, DatePicker, Segmented, Card, Empty } from 'antd';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import { CalendarCheck2, Clock3, UserCheck, UserX, Calendar, Filter, RotateCcw, Eye } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { SHIFT_META, STATUS_META } from './scheduleData';
import { scheduleAPI } from '../../api/api';
import useAuthStore from '../../stores/useAuthStore';
import ScheduleBoard from './components/ScheduleBoard';
import ShiftTable from './components/ShiftTable';
import ScheduleKPIs from './components/ScheduleKPIs';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const initialFilters = {
  view: 'week',
  week: dayjs(),
  shiftType: 'all',
  status: 'all',
};

const MySchedulePage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [selectedShift, setSelectedShift] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const currentUser = useAuthStore((state) => state.user);

  // Tính toán dynamic weekDays dựa trên bộ lọc tuần đang chọn
  const weekDays = useMemo(() => {
    const startOfWeek = activeFilters.week.startOf('week').add(1, 'day');
    return [
      { key: 'mon', label: 'Thứ 2', date: startOfWeek.format('DD/MM'), fullDate: startOfWeek.format('YYYY-MM-DD') },
      { key: 'tue', label: 'Thứ 3', date: startOfWeek.add(1, 'day').format('DD/MM'), fullDate: startOfWeek.add(1, 'day').format('YYYY-MM-DD') },
      { key: 'wed', label: 'Thứ 4', date: startOfWeek.add(2, 'day').format('DD/MM'), fullDate: startOfWeek.add(2, 'day').format('YYYY-MM-DD') },
      { key: 'thu', label: 'Thứ 5', date: startOfWeek.add(3, 'day').format('DD/MM'), fullDate: startOfWeek.add(3, 'day').format('YYYY-MM-DD') },
      { key: 'fri', label: 'Thứ 6', date: startOfWeek.add(4, 'day').format('DD/MM'), fullDate: startOfWeek.add(4, 'day').format('YYYY-MM-DD') },
      { key: 'sat', label: 'Thứ 7', date: startOfWeek.add(5, 'day').format('DD/MM'), fullDate: startOfWeek.add(5, 'day').format('YYYY-MM-DD') },
      { key: 'sun', label: 'CN', date: startOfWeek.add(6, 'day').format('DD/MM'), fullDate: startOfWeek.add(6, 'day').format('YYYY-MM-DD') },
    ];
  }, [activeFilters.week]);

  // Bộ lọc ngày bắt đầu và kết thúc của tuần đang hoạt động
  const activeDateRange = useMemo(() => {
    const start = weekDays[0].fullDate;
    const end = weekDays[6].fullDate;
    return { start, end };
  }, [weekDays]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: activeDateRange.start,
        endDate: activeDateRange.end,
        staffId: currentUser?._id || currentUser?.id,
        shiftType: activeFilters.shiftType,
        status: activeFilters.status,
      };
      const res = await scheduleAPI.getAll(params);
      setSchedules(res.data?.schedules || []);
    } catch (err) {
      messageApi.error("Không thể tải lịch làm việc cá nhân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchSchedules();
    }
  }, [activeFilters, activeDateRange, currentUser]);

  const mappedShifts = useMemo(() => {
    const SHIFT_ORDER = {
      morning: 1,
      afternoon: 2,
      evening: 3,
      fulltime: 4,
      custom: 5,
    };

    const sortedSchedules = [...schedules].sort((a, b) => {
      const orderA = SHIFT_ORDER[a.shiftType] || 99;
      const orderB = SHIFT_ORDER[b.shiftType] || 99;
      if (orderA !== orderB) return orderA - orderB;

      const timeComp = (a.startTime || '').localeCompare(b.startTime || '');
      if (timeComp !== 0) return timeComp;

      return (a.staff?.name || '').localeCompare(b.staff?.name || '');
    });

    return sortedSchedules.map((s) => ({
      id: s._id,
      day: s.day,
      date: s.date,
      staffId: s.staff?._id || '',
      staffName: s.staff?.name || 'Không rõ',
      role: s.staff?.role === 'admin' ? 'Quản lý' : 'Dược sĩ',
      shiftType: s.shiftType,
      area: s.area,
      status: s.status,
      note: s.note,
      startTime: s.startTime,
      endTime: s.endTime,
    }));
  }, [schedules]);

  const summary = useMemo(() => (
    mappedShifts.reduce(
      (acc, shift) => ({
        total: acc.total + 1,
        confirmed: acc.confirmed + (shift.status === 'confirmed' ? 1 : 0),
        absent: acc.absent + (shift.status === 'absent' ? 1 : 0),
        late: acc.late + (shift.status === 'late' ? 1 : 0),
      }),
      { total: 0, confirmed: 0, absent: 0, late: 0 }
    )
  ), [mappedShifts]);

  const handleChange = (nextFilters) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
    if ('view' in nextFilters || 'week' in nextFilters) {
      setActiveFilters((current) => ({ ...current, ...nextFilters }));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
      {contextHolder}
      
      <PageHeader
        title="Lịch làm việc của tôi"
        subtitle="Xem chi tiết các ca làm việc của bạn được quản trị viên sắp xếp và phân công"
      />

      {/* Bộ lọc lịch làm việc cá nhân */}
      <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">Chế độ xem:</span>
              <Segmented
                value={filters.view}
                onChange={(view) => handleChange({ view })}
                options={[
                  { value: 'week', label: 'Theo tuần' },
                  { value: 'list', label: 'Danh sách ca' },
                ]}
                className="bg-[var(--color-bg-subtle)]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border-light)] pt-4">
            <DatePicker
              picker="week"
              value={filters.week}
              onChange={(week) => handleChange({ week })}
              format="wo [năm] YYYY"
              className="h-10 min-w-[190px] rounded-[var(--radius-md)] border-[var(--color-border)]"
            />
            <Select
              value={filters.shiftType}
              onChange={(shiftType) => handleChange({ shiftType })}
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
              onChange={(status) => handleChange({ status })}
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
                onClick={() => setActiveFilters(filters)}
              >
                Lọc
              </Button>
              <Button
                icon={<RotateCcw size={16} className="mr-2 inline" />}
                className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-secondary)]"
                onClick={() => {
                  setFilters(initialFilters);
                  setActiveFilters(initialFilters);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <ScheduleKPIs summary={summary} />

      {/* Schedule Board/Table */}
      {loading ? (
        <Card className="flex h-64 items-center justify-center rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]">
          <div className="text-[var(--color-text-secondary)] font-medium">Đang tải lịch làm việc...</div>
        </Card>
      ) : activeFilters.view === 'week' ? (
        <div className="overflow-x-auto">
          <ScheduleBoard shifts={mappedShifts} onSelect={setSelectedShift} weekDays={weekDays} />
        </div>
      ) : (
        <ShiftTable data={mappedShifts} onSelect={setSelectedShift} weekDays={weekDays} />
      )}

      {/* Modal chi tiết ca làm */}
      <Modal
        title="Chi tiết ca làm"
        centered
        width={520}
        open={Boolean(selectedShift)}
        onCancel={() => setSelectedShift(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedShift(null)} className="rounded-[var(--radius-md)] border-none bg-[var(--color-primary)]">
            Đóng
          </Button>
        ]}
      >
        {selectedShift && (
          <div className="space-y-6 pt-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] p-4">
              <div className="font-semibold text-[var(--color-text-primary)]">{selectedShift.staffName}</div>
              <div className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{selectedShift.role} · Khu vực: {selectedShift.area}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag className="m-0 rounded-full border px-3 py-1 font-medium" style={{ color: SHIFT_META[selectedShift.shiftType].color, backgroundColor: SHIFT_META[selectedShift.shiftType].bg, borderColor: SHIFT_META[selectedShift.shiftType].border }}>
                  {SHIFT_META[selectedShift.shiftType].label}
                </Tag>
                <Tag className="m-0 rounded-full border px-3 py-1 font-medium" style={{ color: STATUS_META[selectedShift.status].color, backgroundColor: STATUS_META[selectedShift.status].bg, borderColor: STATUS_META[selectedShift.status].border }}>
                  {STATUS_META[selectedShift.status].label}
                </Tag>
              </div>
            </div>

            <Descriptions bordered column={1} size="small" className="overflow-hidden rounded-[var(--radius-md)] border-[var(--color-border-light)]">
              <Descriptions.Item label="Thời gian làm việc">
                <span className="font-medium text-[var(--color-text-primary)]">{selectedShift.startTime} - {selectedShift.endTime}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Thứ trong tuần">
                <span className="text-[var(--color-text-secondary)] capitalize">{selectedShift.day === 'sun' ? 'Chủ nhật' : `Thứ ${selectedShift.day === 'mon' ? '2' : selectedShift.day === 'tue' ? '3' : selectedShift.day === 'wed' ? '4' : selectedShift.day === 'thu' ? '5' : selectedShift.day === 'fri' ? '6' : '7'}`}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Khu vực làm việc">
                <span className="text-[var(--color-text-secondary)] font-medium">{selectedShift.area}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú phân công">
                <span className="text-[var(--color-text-secondary)]">{selectedShift.note || 'Không có ghi chú nào'}</span>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MySchedulePage;
