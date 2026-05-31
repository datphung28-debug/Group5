import React, { useMemo, useState, useEffect } from 'react';
import { Button, Descriptions, Space, Tag, message, Modal, Form, Select, Input, DatePicker, Popconfirm, TimePicker } from 'antd';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import { CalendarPlus, Copy, Save, Trash2, Sparkles } from 'lucide-react';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
import PageHeader from '../../components/PageHeader';
import ScheduleFilter from './components/ScheduleFilter';
import ScheduleKPIs from './components/ScheduleKPIs';
import ScheduleBoard from './components/ScheduleBoard';
import ShiftTable from './components/ShiftTable';
import { SHIFT_META, STATUS_META } from './scheduleData';
import { scheduleAPI, userAPI } from '../../api/api';
import useAuthStore from '../../stores/useAuthStore';

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
  const [schedules, setSchedules] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const [messageApi, contextHolder] = message.useMessage();
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role === 'admin';

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  
  const [autoModalOpen, setAutoModalOpen] = useState(false);
  const [autoForm] = Form.useForm();

  // Tính toán dynamic weekDays dựa trên bộ lọc tuần đang chọn
  const weekDays = useMemo(() => {
    const startOfWeek = activeFilters.week.startOf('isoWeek');
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

  const defaultWeek = useMemo(() => {
    const today = dayjs();
    let startOfThisWeek = today.startOf('week');
    if (today.day() === 0) {
      startOfThisWeek = today.subtract(6, 'day');
    } else {
      startOfThisWeek = startOfThisWeek.add(1, 'day');
    }
    
    // Nếu tuần đang lọc là tuần trong quá khứ, dùng tuần hiện tại
    if (activeFilters.week.isBefore(startOfThisWeek, 'day')) {
      return today;
    }
    return activeFilters.week;
  }, [activeFilters.week]);

  useEffect(() => {
    if (autoModalOpen) {
      autoForm.setFieldsValue({
        strategy: 'rotate',
        week: defaultWeek,
      });
    }
  }, [autoModalOpen, defaultWeek, autoForm]);

  // 1. Tải danh sách nhân sự từ Database
  useEffect(() => {
    const fetchStaff = async () => {
      if (currentUser?.role !== 'admin') {
        setStaffList([
          {
            _id: currentUser?._id || currentUser?.id,
            name: currentUser?.name || 'Nhân viên',
            role: currentUser?.role,
            isActive: true
          }
        ]);
        return;
      }
      try {
        const res = await userAPI.getAll({ limit: 200 });
        const users = res.data?.users || res.data || [];
        setStaffList(users.filter(u => u.isActive && u.role !== 'admin'));
      } catch (err) {
        console.error("Lỗi lấy danh sách nhân viên:", err);
      }
    };
    fetchStaff();
  }, [currentUser]);

  // Map danh sách nhân sự sang Options cho ô chọn Select
  const staffOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Tất cả nhân viên' },
      ...staffList.map(u => ({ value: u._id, label: u.name }))
    ];
  }, [staffList]);

  // 2. Tải danh sách lịch phân ca từ Database
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: activeDateRange.start,
        endDate: activeDateRange.end,
        staffId: activeFilters.staffId,
        shiftType: activeFilters.shiftType,
        status: activeFilters.status,
      };
      const res = await scheduleAPI.getAll(params);
      setSchedules(res.data?.schedules || []);
    } catch (err) {
      messageApi.error("Không thể tải lịch phân ca từ database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [activeFilters, activeDateRange]);

  // Map dữ liệu từ DB thành dữ liệu phù hợp với component UI
  const mappedShifts = useMemo(() => {
    const SHIFT_ORDER = {
      morning: 1,
      afternoon: 2,
      evening: 3,
      fulltime: 4,
      custom: 5,
    };

    const sortedSchedules = [...schedules].sort((a, b) => {
      // Sắp xếp theo thứ tự ca làm mong muốn (Sáng, Chiều, Tối, Fulltime, Custom)
      const orderA = SHIFT_ORDER[a.shiftType] || 99;
      const orderB = SHIFT_ORDER[b.shiftType] || 99;
      if (orderA !== orderB) return orderA - orderB;
      
      // Tiếp theo xếp theo giờ bắt đầu
      const timeComp = (a.startTime || '').localeCompare(b.startTime || '');
      if (timeComp !== 0) return timeComp;

      // Cuối cùng xếp theo tên nhân viên
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

  // Tóm tắt KPIs dựa trên danh sách ca hiện tại
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

  // 3. Xử lý tạo ca làm mới
  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      const dateStr = values.date.format('YYYY-MM-DD');
      const selectedDay = weekDays.find(d => d.fullDate === dateStr);
      
      // Xác định key thứ của tuần
      let dayKey = 'mon';
      if (selectedDay) {
        dayKey = selectedDay.key;
      } else {
        // Tự động tính thứ từ ngày chọn nếu nằm ngoài tuần hiện tại
        const dayNum = values.date.day(); // 0 = CN, 1 = T2
        const mapping = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        dayKey = mapping[dayNum];
      }

      // Lấy thời gian bắt đầu và kết thúc từ timeRange
      let startTime = '07:00';
      let endTime = '12:00';
      if (values.timeRange && values.timeRange.length === 2) {
        startTime = values.timeRange[0].format('HH:mm');
        endTime = values.timeRange[1].format('HH:mm');
      }

      await scheduleAPI.create({
        date: dateStr,
        day: dayKey,
        staffId: values.staffId,
        shiftType: values.shiftType,
        startTime,
        endTime,
        area: values.area,
        status: 'confirmed', // Mặc định đã xác nhận khi tạo mới
        note: values.note,
      });

      messageApi.success("Đã phân ca làm việc thành công!");
      setCreateModalOpen(false);
      createForm.resetFields();
      fetchSchedules();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Lỗi khi phân ca làm việc");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Xử lý cập nhật ca làm
  const handleUpdate = async (values) => {
    if (!selectedShift) return;
    setSubmitting(true);
    try {
      // Lấy thời gian bắt đầu và kết thúc từ timeRange
      let startTime = '07:00';
      let endTime = '12:00';
      if (values.timeRange && values.timeRange.length === 2) {
        startTime = values.timeRange[0].format('HH:mm');
        endTime = values.timeRange[1].format('HH:mm');
      }

      await scheduleAPI.update(selectedShift.id, {
        shiftType: values.shiftType,
        startTime,
        endTime,
        area: values.area,
        status: values.status,
        note: values.note,
      });
      messageApi.success("Cập nhật ca làm thành công!");
      setSelectedShift(null);
      fetchSchedules();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Lỗi khi cập nhật ca làm");
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Xử lý xóa ca làm
  const handleDelete = async () => {
    if (!selectedShift) return;
    try {
      await scheduleAPI.delete(selectedShift.id);
      messageApi.success("Đã xóa ca làm việc!");
      setSelectedShift(null);
      fetchSchedules();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Lỗi khi xóa ca làm");
    }
  };

  // 6. Xử lý sao chép tuần làm việc
  const handleCopyWeek = async () => {
    try {
      const res = await scheduleAPI.copyWeek({ sourceStartDate: activeDateRange.start });
      messageApi.success(res.data?.message || "Sao chép lịch tuần thành công!");
      fetchSchedules();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Không thể sao chép lịch tuần");
    }
  };

  // 7. Xử lý tự động xếp ca làm cả tuần
  const handleAutoAssign = async (values) => {
    setSubmitting(true);
    try {
      const selectedWeek = values.week;
      let startOfWeek = selectedWeek.startOf('week');
      if (selectedWeek.day() === 0) {
        startOfWeek = selectedWeek.subtract(6, 'day');
      } else {
        startOfWeek = startOfWeek.add(1, 'day');
      }
      const startDateStr = startOfWeek.format('YYYY-MM-DD');

      const res = await scheduleAPI.autoAssign({
        startDate: startDateStr,
        strategy: values.strategy,
      });
      messageApi.success(res.data?.message || "Tự động xếp ca tuần thành công!");
      setAutoModalOpen(false);
      fetchSchedules();
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Không thể tự động xếp ca");
    } finally {
      setSubmitting(false);
    }
  };

  // Khi chọn xem chi tiết ca làm, thiết lập giá trị cho Form sửa đổi
  useEffect(() => {
    if (selectedShift) {
      const startTime = selectedShift.startTime || '07:00';
      const endTime = selectedShift.endTime || '12:00';
      editForm.setFieldsValue({
        shiftType: selectedShift.shiftType,
        timeRange: [dayjs(startTime, 'HH:mm'), dayjs(endTime, 'HH:mm')],
        area: selectedShift.area,
        status: selectedShift.status,
        note: selectedShift.note,
      });
    }
  }, [selectedShift]);

  const selectedDay = selectedShift ? weekDays.find((day) => day.key === selectedShift.day) : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
      {contextHolder}
      <PageHeader
        title="Lịch phân ca"
        subtitle="Sắp xếp, theo dõi ca làm việc"
        actions={
          isAdmin && (
            <Space size={12} wrap>
              <Popconfirm
                title="Sao chép lịch làm việc?"
                description="Hệ thống sẽ sao chép toàn bộ ca làm của tuần hiện tại sang tuần sau."
                onConfirm={handleCopyWeek}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button
                  icon={<Copy size={18} className="mr-2 inline" />}
                  className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] bg-white"
                >
                  Sao chép tuần
                </Button>
              </Popconfirm>
              <Button
                icon={<Sparkles size={18} className="mr-2 inline" />}
                className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] bg-white"
                onClick={() => setAutoModalOpen(true)}
              >
                Tự động xếp ca
              </Button>
              <Button
                type="primary"
                icon={<CalendarPlus size={18} className="mr-2 inline" />}
                className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-6 font-medium shadow-[var(--shadow-card)]"
                onClick={() => setCreateModalOpen(true)}
              >
                Tạo ca làm
              </Button>
            </Space>
          )
        }
      />

      <ScheduleFilter
        filters={filters}
        onChange={handleChange}
        staffOptions={staffOptions}
        onApply={() => setActiveFilters(filters)}
        onReset={() => {
          setFilters(initialFilters);
          setActiveFilters(initialFilters);
        }}
      />

      <ScheduleKPIs summary={summary} />

      {activeFilters.view === 'week' ? (
        <div className="overflow-x-auto">
          <ScheduleBoard shifts={mappedShifts} onSelect={setSelectedShift} weekDays={weekDays} />
        </div>
      ) : (
        <ShiftTable data={mappedShifts} onSelect={setSelectedShift} weekDays={weekDays} />
      )}

      {/* Modal Chi tiết & Cập nhật ca làm */}
      <Modal
        title={isAdmin ? "Cập nhật ca làm" : "Chi tiết ca làm"}
        centered
        width={520}
        open={Boolean(selectedShift)}
        onCancel={() => setSelectedShift(null)}
        footer={
          isAdmin ? [
            <Popconfirm
              key="delete"
              title="Xóa ca làm việc này?"
              description="Hành động này không thể hoàn tác."
              onConfirm={handleDelete}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<Trash2 size={16} />} className="float-left rounded-[var(--radius-md)]">
                Xóa ca
              </Button>
            </Popconfirm>,
            <Button key="cancel" onClick={() => setSelectedShift(null)} className="rounded-[var(--radius-md)]">Hủy</Button>,
            <Button
              key="submit"
              type="primary"
              icon={<Save size={16} />}
              loading={submitting}
              className="rounded-[var(--radius-md)] border-none bg-[var(--color-primary)]"
              onClick={() => editForm.submit()}
            >
              Lưu
            </Button>
          ] : [
            <Button key="close" onClick={() => setSelectedShift(null)} className="rounded-[var(--radius-md)]">Đóng</Button>
          ]
        }
      >
        {selectedShift && (
          <div className="space-y-6 pt-4">
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

            {isAdmin ? (
              <Form
                form={editForm}
                layout="vertical"
                onFinish={handleUpdate}
                className="space-y-4"
                onValuesChange={(changedValues) => {
                  if (changedValues.shiftType) {
                    const type = changedValues.shiftType;
                    let range = null;
                    if (type === 'morning') range = [dayjs('07:00', 'HH:mm'), dayjs('12:00', 'HH:mm')];
                    else if (type === 'afternoon') range = [dayjs('12:00', 'HH:mm'), dayjs('17:00', 'HH:mm')];
                    else if (type === 'evening') range = [dayjs('17:00', 'HH:mm'), dayjs('21:00', 'HH:mm')];
                    else if (type === 'fulltime') range = [dayjs('07:00', 'HH:mm'), dayjs('21:00', 'HH:mm')];
                    else if (type === 'custom') range = [dayjs('07:00', 'HH:mm'), dayjs('17:00', 'HH:mm')];
                    
                    if (range) {
                      editForm.setFieldsValue({ timeRange: range });
                    }
                  }
                }}
              >
                <Form.Item label="Ca làm việc" name="shiftType" rules={[{ required: true }]}>
                  <Select options={Object.entries(SHIFT_META).map(([value, meta]) => ({ value, label: `${meta.label} (${meta.time})` }))} />
                </Form.Item>

                <Form.Item label="Thời gian ca làm" name="timeRange" rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}>
                  <TimePicker.RangePicker format="HH:mm" minuteStep={15} className="w-full" />
                </Form.Item>

                <Form.Item label="Khu vực phụ trách" name="area" rules={[{ required: true, message: 'Nhập khu vực làm việc' }]}>
                  <Select
                    options={[
                      { value: 'Quầy thuốc', label: 'Quầy thuốc' },
                      { value: 'Quầy tư vấn', label: 'Quầy tư vấn' },
                      { value: 'Kho', label: 'Kho' },
                      { value: 'POS', label: 'POS' },
                    ]}
                  />
                </Form.Item>

                <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
                  <Select options={Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: meta.label }))} />
                </Form.Item>

                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={3} placeholder="Ghi chú công việc..." />
                </Form.Item>
              </Form>
            ) : (
              <Descriptions column={1} bordered size="middle">
                <Descriptions.Item label="Ngày làm">{selectedDay ? `${selectedDay.label} - ${selectedDay.date}` : '--'}</Descriptions.Item>
                <Descriptions.Item label="Giờ làm">{selectedShift.startTime} - {selectedShift.endTime}</Descriptions.Item>
                <Descriptions.Item label="Khu vực">{selectedShift.area}</Descriptions.Item>
                <Descriptions.Item label="Ghi chú">{selectedShift.note || 'Không có ghi chú'}</Descriptions.Item>
              </Descriptions>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Tạo ca làm mới (Admin Only) */}
      <Modal
        title="Tạo ca làm việc mới"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setCreateModalOpen(false)}>Hủy</Button>,
          <Button key="submit" type="primary" loading={submitting} className="bg-[var(--color-primary)] border-none" onClick={() => createForm.submit()}>Tạo ca</Button>
        ]}
        width={500}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          className="mt-4"
          initialValues={{
            shiftType: 'morning',
            timeRange: [dayjs('07:00', 'HH:mm'), dayjs('12:00', 'HH:mm')],
            area: 'Quầy thuốc',
            status: 'confirmed',
            date: activeFilters.week,
          }}
          onValuesChange={(changedValues) => {
            if (changedValues.shiftType) {
              const type = changedValues.shiftType;
              let range = null;
              if (type === 'morning') range = [dayjs('07:00', 'HH:mm'), dayjs('12:00', 'HH:mm')];
              else if (type === 'afternoon') range = [dayjs('12:00', 'HH:mm'), dayjs('17:00', 'HH:mm')];
              else if (type === 'evening') range = [dayjs('17:00', 'HH:mm'), dayjs('21:00', 'HH:mm')];
              else if (type === 'fulltime') range = [dayjs('07:00', 'HH:mm'), dayjs('21:00', 'HH:mm')];
              else if (type === 'custom') range = [dayjs('07:00', 'HH:mm'), dayjs('17:00', 'HH:mm')];
              
              if (range) {
                createForm.setFieldsValue({ timeRange: range });
              }
            }
          }}
        >
          <Form.Item label="Chọn nhân viên" name="staffId" rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}>
            <Select
              placeholder="Chọn nhân viên phân ca"
              options={staffList.map(u => ({ value: u._id, label: `${u.name} (${u.role === 'admin' ? 'Quản lý' : 'Dược sĩ'})` }))}
            />
          </Form.Item>

          <Form.Item label="Ngày phân ca" name="date" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item label="Ca làm việc" name="shiftType" rules={[{ required: true }]}>
            <Select options={Object.entries(SHIFT_META).map(([value, meta]) => ({ value, label: `${meta.label} (${meta.time})` }))} />
          </Form.Item>

          <Form.Item label="Thời gian ca làm" name="timeRange" rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}>
            <TimePicker.RangePicker format="HH:mm" minuteStep={15} className="w-full" />
          </Form.Item>

          <Form.Item label="Khu vực phụ trách" name="area" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'Quầy thuốc', label: 'Quầy thuốc' },
                { value: 'Quầy tư vấn', label: 'Quầy tư vấn' },
                { value: 'Kho', label: 'Kho' },
                { value: 'POS', label: 'POS' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={3} placeholder="Ghi chú phân công ca..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Tự động xếp ca làm cả tuần */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Sparkles size={19} className="text-[var(--color-primary)]" />
            <span>Tự động xếp ca làm cả tuần</span>
          </div>
        }
        open={autoModalOpen}
        onCancel={() => setAutoModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setAutoModalOpen(false)}>Hủy</Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            className="bg-[var(--color-primary)] border-none"
            onClick={() => autoForm.submit()}
          >
            Bắt đầu xếp ca
          </Button>
        ]}
        width={480}
      >
        <div className="my-4 text-[13px] text-[var(--color-text-secondary)]">
          Hệ thống sẽ tự động phân bổ ca làm việc (Sáng, Chiều, Tối) và luân chuyển khu vực làm việc cho tất cả dược sĩ đang hoạt động trong tuần được chọn.
        </div>
        
        <div className="mb-4 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-700 font-medium">
          ⚠️ Chú ý: Hành động này sẽ xóa toàn bộ ca làm hiện tại trong tuần được chọn trước khi tạo lịch tự động mới.
        </div>

        <Form
          form={autoForm}
          layout="vertical"
          onFinish={handleAutoAssign}
        >
          <Form.Item
            label="Chọn tuần xếp ca"
            name="week"
            rules={[{ required: true, message: 'Vui lòng chọn tuần xếp ca' }]}
          >
            <DatePicker
              picker="week"
              format="YYYY-WW"
              className="w-full"
              disabledDate={(current) => {
                const today = dayjs();
                let startOfThisWeek = today.startOf('week');
                if (today.day() === 0) {
                  startOfThisWeek = today.subtract(6, 'day');
                } else {
                  startOfThisWeek = startOfThisWeek.add(1, 'day');
                }
                return current && current.isBefore(startOfThisWeek, 'day');
              }}
              placeholder="Chọn tuần phân ca làm việc"
            />
          </Form.Item>

          <Form.Item
            label="Chọn chiến lược xếp ca"
            name="strategy"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: 'rotate', label: 'Xoay ca (Xoay ca mỗi ngày tiếp theo, đảm bảo công bằng)' },
                { value: 'fixed', label: 'Cố định (Giữ nguyên cùng 1 ca làm suốt cả tuần)' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SchedulePage;
