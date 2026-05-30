import React, { useMemo, useState, useEffect } from 'react';
import { Button, Descriptions, Drawer, Space, message, Modal, Form, Select, DatePicker, TimePicker, Input, InputNumber, Card, Tag } from 'antd';
import { Download, FileClock, Settings, Clock, LogIn, LogOut, FileSpreadsheet, Eye } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import TimesheetFilter from './components/TimesheetFilter';
import TimesheetKPIs from './components/TimesheetKPIs';
import TimesheetTable from './components/TimesheetTable';
import { METHOD_META, STATUS_META, TIMESHEET_RECORDS, STAFF_OPTIONS } from './timesheetData';
import useAuthStore from '../../stores/useAuthStore';
import dayjs from 'dayjs';

const initialFilters = {
  period: 'month',
  staffId: 'all',
  status: 'all',
  method: 'all',
  dateRange: null,
};

const formatDate = (value) => {
  if (!value) return '--';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const TimesheetPage = () => {
  const { user } = useAuthStore();
  const [records, setRecords] = useState(TIMESHEET_RECORDS);
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [selectedRecord, setSelectedRecord] = useState(null); // Selected staff summary
  
  // Wage settings state
  const [hourlyWages, setHourlyWages] = useState({
    'Quản lý': 50000,
    'Dược sĩ': 40000,
    'Thu ngân': 30000,
  });
  
  // Modals visibility states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isWageModalOpen, setIsWageModalOpen] = useState(false);
  
  // Live clock state
  const [currentTime, setCurrentTime] = useState(dayjs());
  
  const [messageApi, contextHolder] = message.useMessage();
  const [addForm] = Form.useForm();
  const [wageForm] = Form.useForm();
  const [exportForm] = Form.useForm();

  // Tick the clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync hourly wages to form values
  useEffect(() => {
    if (isWageModalOpen) {
      wageForm.setFieldsValue({
        adminWage: hourlyWages['Quản lý'],
        pharmacistWage: hourlyWages['Dược sĩ'],
        cashierWage: hourlyWages['Thu ngân'],
      });
    }
  }, [isWageModalOpen, hourlyWages, wageForm]);

  // Determine current user information
  const currentUserId = user?.id || 'admin-gpp';
  const currentUserName = user?.name || 'Admin GPP';
  const currentUserRole = user?.role === 'admin' ? 'Quản lý' : (user?.role === 'cashier' ? 'Thu ngân' : 'Dược sĩ');

  // Today's record of logged in user
  const todayStr = currentTime.format('YYYY-MM-DD');
  const todayRecord = useMemo(() => {
    return records.find((r) => r.date === todayStr && r.staffId === currentUserId);
  }, [records, todayStr, currentUserId]);

  // Clickable KPI card filtering state
  const [activeKpiType, setActiveKpiType] = useState('all');

  // Handle Clock-In (Chấm công vào)
  const handleClockIn = () => {
    const currentHour = dayjs().hour();
    let shiftName = 'Ca sáng';
    let schedTime = '07:00 - 12:00';
    if (currentHour >= 12 && currentHour < 17) {
      shiftName = 'Ca chiều';
      schedTime = '12:00 - 17:00';
    } else if (currentHour >= 17 && currentHour < 21) {
      shiftName = 'Ca tối';
      schedTime = '17:00 - 21:00';
    } else if (currentHour >= 21 || currentHour < 7) {
      shiftName = 'Ca tự chọn';
      schedTime = 'Tùy chỉnh';
    }

    const newRecord = {
      id: `TS-${Date.now()}`,
      date: todayStr,
      staffId: currentUserId,
      staffName: currentUserName,
      role: currentUserRole,
      shift: shiftName,
      scheduledTime: schedTime,
      checkIn: dayjs().format('HH:mm'),
      checkOut: null,
      workHours: 0,
      overtimeHours: 0,
      status: 'missing',
      method: 'pos',
      note: 'Tự động ghi nhận lúc vào ca',
    };

    setRecords((prev) => [newRecord, ...prev]);
    messageApi.success('Chấm công vào thành công!');
  };

  // Handle Clock-Out (Chấm công ra)
  const handleClockOut = () => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.date === todayStr && r.staffId === currentUserId && !r.checkOut) {
          const checkOutTime = dayjs().format('HH:mm');
          const checkInTime = r.checkIn;
          
          const inMins = parseTimeToMinutes(checkInTime);
          const outMins = parseTimeToMinutes(checkOutTime);
          const diffMins = Math.max(0, outMins - inMins);
          const workHours = diffMins / 60;
          
          let overtimeHours = 0;
          let status = 'complete';
          
          if (r.scheduledTime !== 'Tùy chỉnh') {
            const [schedStart, schedEnd] = r.scheduledTime.split(' - ');
            const schedStartMins = parseTimeToMinutes(schedStart);
            const schedEndMins = parseTimeToMinutes(schedEnd);
            const schedDuration = (schedEndMins - schedStartMins) / 60;
            
            if (inMins > schedStartMins + 15) {
              status = 'late';
            }
            if (outMins > schedEndMins) {
              overtimeHours = Math.max(0, (outMins - schedEndMins) / 60);
              if (overtimeHours > 0.5 && status !== 'late') {
                status = 'overtime';
              }
            }
          }

          return {
            ...r,
            checkOut: checkOutTime,
            workHours,
            overtimeHours,
            status,
            note: status === 'late' ? `Đi muộn ${Math.round(inMins - parseTimeToMinutes(r.scheduledTime.split(' - ')[0]))} phút` : 'Đủ công ca',
          };
        }
        return r;
      })
    );
    messageApi.success('Chấm công ra thành công!');
  };

  // Handle manual attendance addition ("Bổ sung công")
  const handleAddRecordSubmit = (values) => {
    const dateStr = values.date.format('YYYY-MM-DD');
    const checkInStr = values.checkIn ? values.checkIn.format('HH:mm') : null;
    const checkOutStr = values.checkOut ? values.checkOut.format('HH:mm') : null;
    
    const staff = STAFF_OPTIONS.find((s) => s.value === values.staffId);
    const staffName = staff ? staff.label : 'Nhân viên';
    
    let schedTime = '07:00 - 12:00';
    if (values.shift === 'Ca chiều') schedTime = '12:00 - 17:00';
    else if (values.shift === 'Ca tối') schedTime = '17:00 - 21:00';
    else if (values.shift === 'Full time') schedTime = '07:00 - 21:00';
    else if (values.shift === 'Ca tự chọn') schedTime = 'Tùy chỉnh';
    
    let workHours = 0;
    let overtimeHours = 0;
    if (checkInStr && checkOutStr) {
      const inMins = parseTimeToMinutes(checkInStr);
      const outMins = parseTimeToMinutes(checkOutStr);
      workHours = Math.max(0, (outMins - inMins) / 60);
      
      if (schedTime !== 'Tùy chỉnh') {
        const [, schedEnd] = schedTime.split(' - ');
        const schedEndMins = parseTimeToMinutes(schedEnd);
        if (outMins > schedEndMins) {
          overtimeHours = Math.max(0, (outMins - schedEndMins) / 60);
        }
      }
    }
    
    const newRecord = {
      id: `TS-${Date.now()}`,
      date: dateStr,
      staffId: values.staffId,
      staffName: staffName,
      role: values.staffId === 'admin-gpp' ? 'Quản lý' : 'Dược sĩ',
      shift: values.shift,
      scheduledTime: schedTime,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      workHours,
      overtimeHours,
      status: values.status,
      method: 'manual',
      note: values.note || 'Bổ sung công thủ công',
    };
    
    setRecords((prev) => [newRecord, ...prev]);
    setIsAddModalOpen(false);
    addForm.resetFields();
    messageApi.success('Đã bổ sung bản ghi chấm công!');
  };

  // Handle Hourly Wage rates configuration save
  const handleWageSubmit = (values) => {
    setHourlyWages({
      'Quản lý': values.adminWage,
      'Dược sĩ': values.pharmacistWage,
      'Thu ngân': values.cashierWage,
    });
    setIsWageModalOpen(false);
    messageApi.success('Đã lưu mức thiết lập lương giờ của các vị trí!');
  };

  // Simulated functional CSV export matching filters
  const handleExportSubmit = (values) => {
    const headers = 'Mã nhân viên,Nhân viên,Vai trò,Tổng số ca,Ca hoàn thành,Ca đi muộn,Ca vắng,Giờ làm,Lương tạm tính';
    const rows = aggregatedRecords.map((r) => {
      return [
        r.staffId,
        r.staffName,
        r.role,
        r.totalShifts,
        r.completeShifts,
        r.lateShifts,
        r.absentShifts,
        r.totalHours.toFixed(1) + 'h',
        r.salary.toFixed(0) + ' đ',
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bang_luong_tam_tinh_${dayjs().format('YYYYMMDD')}.${values.format === 'excel' ? 'csv' : values.format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExportModalOpen(false);
    messageApi.success('Xuất bảng công thành công!');
  };

  // Master Filter Flow (Filtering raw logs)
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesStaff = activeFilters.staffId === 'all' || record.staffId === activeFilters.staffId;
      
      let matchesStatus = activeFilters.status === 'all' || record.status === activeFilters.status;
      if (activeKpiType !== 'all') {
        if (activeKpiType === 'complete') {
          matchesStatus = record.status === 'complete' || record.status === 'overtime';
        } else if (activeKpiType === 'exceptions') {
          matchesStatus = record.status === 'late' || record.status === 'missing' || record.status === 'absent';
        } else if (activeKpiType === 'overtime') {
          matchesStatus = record.status === 'overtime';
        }
      }

      // Date Period Calculation
      const matchesPeriod = (() => {
        if (activeFilters.period === 'all') return true;
        const todayStrLocal = dayjs().format('YYYY-MM-DD');
        
        if (activeFilters.period === 'today') {
          return record.date === todayStrLocal;
        }
        if (activeFilters.period === 'week') {
          const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');
          const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');
          return record.date >= startOfWeek && record.date <= endOfWeek;
        }
        if (activeFilters.period === 'month') {
          const currentMonthStr = dayjs().format('YYYY-MM');
          return record.date.startsWith(currentMonthStr);
        }
        return true;
      })();

      const matchesDateRange =
        !activeFilters.dateRange ||
        activeFilters.dateRange.length !== 2 ||
        (() => {
          const fromDay = activeFilters.dateRange[0].format('YYYY-MM-DD');
          const toDay = activeFilters.dateRange[1].format('YYYY-MM-DD');
          return record.date >= fromDay && record.date <= toDay;
        })();

      return matchesStaff && matchesStatus && matchesPeriod && matchesDateRange;
    });
  }, [records, activeFilters, activeKpiType]);

  // Group and Aggregate Records per Staff Member
  const aggregatedRecords = useMemo(() => {
    const groups = {};
    
    filteredRecords.forEach((record) => {
      if (!groups[record.staffId]) {
        groups[record.staffId] = {
          staffId: record.staffId,
          staffName: record.staffName,
          role: record.role,
          totalShifts: 0,
          completeShifts: 0,
          lateShifts: 0,
          absentShifts: 0,
          totalHours: 0,
        };
      }
      
      const g = groups[record.staffId];
      g.totalShifts += 1;
      if (record.status === 'complete' || record.status === 'overtime') {
        g.completeShifts += 1;
      } else if (record.status === 'late') {
        g.lateShifts += 1;
      } else if (record.status === 'absent' || record.status === 'missing') {
        g.absentShifts += 1;
      }
      g.totalHours += record.workHours + record.overtimeHours;
    });
    
    return Object.values(groups).map((g) => {
      const wageRate = hourlyWages[g.role] || 40000;
      const salary = g.totalHours * wageRate;
      return {
        ...g,
        id: g.staffId,
        salary,
      };
    });
  }, [filteredRecords, hourlyWages]);

  // Master KPI Summarizer
  const summary = useMemo(() => {
    return filteredRecords.reduce(
      (acc, record) => ({
        total: acc.total + 1,
        complete: acc.complete + (record.status === 'complete' || record.status === 'overtime' ? 1 : 0),
        exceptions: acc.exceptions + (record.status === 'late' || record.status === 'missing' || record.status === 'absent' ? 1 : 0),
        overtimeHours: acc.overtimeHours + record.overtimeHours,
      }),
      { total: 0, complete: 0, exceptions: 0, overtimeHours: 0 }
    );
  }, [filteredRecords]);

  // Fetch individual logs of selected staff for Drawer details view
  const staffDetailedLogs = useMemo(() => {
    if (!selectedRecord) return [];
    return filteredRecords.filter((r) => r.staffId === selectedRecord.staffId);
  }, [filteredRecords, selectedRecord]);

  const handleChange = (nextFilters) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
  };

  const handleApplyFilter = (appliedFilters) => {
    setActiveFilters(appliedFilters);
    setActiveKpiType('all');
  };

  const handleKpiCardSelect = (type) => {
    setActiveKpiType(type);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
      {contextHolder}
      <PageHeader
        title="Chấm công"
        subtitle="Theo dõi tổng ca làm, trạng thái công và lương tạm tính của nhân sự"
        actions={
          <Space size={12} wrap>
            <Button
              icon={<Settings size={18} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              onClick={() => setIsWageModalOpen(true)}
            >
              Thiết lập lương giờ
            </Button>
            <Button
              icon={<Download size={18} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              onClick={() => setIsExportModalOpen(true)}
            >
              Xuất bảng công
            </Button>
            <Button
              type="primary"
              icon={<FileClock size={18} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-6 font-medium shadow-[var(--shadow-card)]"
              onClick={() => setIsAddModalOpen(true)}
            >
              Bổ sung công
            </Button>
          </Space>
        }
      />

      {/* CLOCK-IN / CLOCK-OUT SMART WIDGET */}
      <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--color-primary-light)] to-transparent rounded-full filter blur-2xl opacity-50 -z-10" />
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <Clock size={28} className="animate-pulse" />
            </div>
            <div>
              <div className="text-[24px] font-extrabold tracking-tight text-[var(--color-text-primary)]">
                {currentTime.format('HH:mm:ss')}
              </div>
              <div className="text-[13px] font-medium text-[var(--color-text-muted)]">
                {currentTime.format('dddd, [ngày] DD/MM/YYYY')}
              </div>
            </div>
          </div>

          <div className="hidden lg:block h-12 w-px bg-[var(--color-border-light)]" />

          <div className="flex-1 min-w-0 text-center lg:text-left">
            <div className="text-[13px] font-medium text-[var(--color-text-muted)]">Nhân sự đang sử dụng</div>
            <div className="mt-0.5 font-bold text-[var(--color-text-primary)] text-[16px]">{currentUserName}</div>
            <div className="text-[12px] text-[var(--color-text-secondary)]">{currentUserRole}</div>
          </div>

          <div className="hidden lg:block h-12 w-px bg-[var(--color-border-light)]" />

          <div className="flex flex-wrap items-center gap-3">
            {todayRecord ? (
              todayRecord.checkOut ? (
                <div className="rounded-[var(--radius-md)] bg-emerald-50 border border-emerald-200 px-5 py-3 text-center sm:text-right">
                  <div className="text-emerald-700 font-bold text-[14px]">Đã hoàn thành ngày công hôm nay!</div>
                  <div className="text-emerald-600 text-[12px] mt-0.5">Vào: {todayRecord.checkIn} - Ra: {todayRecord.checkOut} ({todayRecord.workHours.toFixed(1)}h công)</div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                      Đang làm việc
                    </span>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-1">Đã vào lúc {todayRecord.checkIn}</div>
                  </div>
                  <Button
                    type="primary"
                    danger
                    icon={<LogOut size={18} className="mr-2 inline" />}
                    className="h-11 rounded-[var(--radius-md)] font-semibold px-6 shadow-md hover:scale-[1.02] transition-transform duration-200"
                    onClick={handleClockOut}
                  >
                    Chấm công ra
                  </Button>
                </div>
              )
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                    Chưa ghi nhận
                  </span>
                  <div className="text-[11px] text-[var(--color-text-muted)] mt-1">Ghi nhận giờ bắt đầu làm việc</div>
                </div>
                <Button
                  type="primary"
                  icon={<LogIn size={18} className="mr-2 inline" />}
                  className="h-11 rounded-[var(--radius-md)] border-none bg-emerald-600 hover:bg-emerald-500 font-semibold px-6 shadow-md hover:scale-[1.02] transition-transform duration-200"
                  onClick={handleClockIn}
                >
                  Chấm công vào
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <TimesheetFilter
        filters={filters}
        onChange={handleChange}
        onApply={handleApplyFilter}
        onReset={() => {
          setFilters(initialFilters);
          setActiveFilters(initialFilters);
          setActiveKpiType('all');
        }}
      />

      <TimesheetKPIs 
        summary={summary} 
        activeType={activeKpiType}
        onSelectType={handleKpiCardSelect}
      />
      
      <TimesheetTable data={aggregatedRecords} onSelect={setSelectedRecord} />

      {/* DRAWER: DETAILED VIEW OF EMPLOYEE ATTENDANCE LOGS */}
      <Drawer
        title="Bảng công chi tiết nhân sự"
        placement="right"
        width={540}
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
      >
        {selectedRecord && (
          <div className="space-y-5">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] p-5">
              <div className="font-bold text-[18px] text-[var(--color-text-primary)]">{selectedRecord.staffName}</div>
              <div className="mt-1 text-[13px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{selectedRecord.role}</div>
              
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--color-border-light)] pt-4">
                <div>
                  <div className="text-[12px] text-[var(--color-text-muted)] font-semibold">TỔNG GIỜ CÔNG:</div>
                  <div className="text-[18px] font-extrabold text-[var(--color-primary)] mt-1">{selectedRecord.totalHours.toFixed(1)} giờ</div>
                </div>
                <div>
                  <div className="text-[12px] text-[var(--color-text-muted)] font-semibold">LƯƠNG TẠM TÍNH:</div>
                  <div className="text-[18px] font-extrabold text-[var(--color-profit)] mt-1">{selectedRecord.salary.toLocaleString('vi-VN')} đ</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-2 mt-6">
              <h4 className="font-bold text-[14px] text-[var(--color-text-primary)]">LỊCH SỬ CA CÔNG CHI TIẾT</h4>
              <Tag className="m-0 font-medium">{staffDetailedLogs.length} ca làm</Tag>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
              {staffDetailedLogs.length === 0 ? (
                <div className="text-center py-6 text-[var(--color-text-muted)]">Không có bản ghi chi tiết nào trong kỳ này.</div>
              ) : (
                staffDetailedLogs.map((log) => (
                  <div key={log.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-white p-4 space-y-3 shadow-sm hover:border-[var(--color-primary)] transition-all duration-150">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[var(--color-text-primary)] text-[13px]">{formatDate(log.date)}</span>
                      <Tag className="m-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: STATUS_META[log.status].color, backgroundColor: STATUS_META[log.status].bg, borderColor: STATUS_META[log.status].border }}>
                        {STATUS_META[log.status].label}
                      </Tag>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-[12px] text-[var(--color-text-secondary)]">
                      <div>
                        <span className="text-[var(--color-text-muted)]">Ca làm: </span>
                        <span className="font-semibold text-[var(--color-text-primary)]">{log.shift}</span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)]">Quy định: </span>
                        <span className="font-semibold text-[var(--color-text-primary)]">{log.scheduledTime}</span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)]">Chấm vào: </span>
                        <span className="font-semibold text-[var(--color-text-primary)]">{log.checkIn || '--'}</span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)]">Chấm ra: </span>
                        <span className="font-semibold text-[var(--color-text-primary)]">{log.checkOut || '--'}</span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)]">Tổng công: </span>
                        <span className="font-semibold text-[var(--color-primary)]">{log.workHours.toFixed(1)}h</span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)]">Tăng ca: </span>
                        <span className="font-semibold text-amber-600">{log.overtimeHours.toFixed(1)}h</span>
                      </div>
                    </div>
                    
                    {log.note && (
                      <div className="text-[11px] bg-[var(--color-bg-subtle)] p-2 rounded text-[var(--color-text-secondary)] border-l-2 border-[var(--color-primary)]">
                        <span className="font-semibold">Ghi chú:</span> {log.note}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* MODAL: MANUAL ADD ATTENDANCE ("BỔ SUNG CÔNG") */}
      <Modal
        title="Yêu cầu bổ sung công thủ công"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        width={540}
        className="rounded-[var(--radius-lg)]"
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddRecordSubmit}
          initialValues={{
            shift: 'Ca sáng',
            status: 'complete',
            date: dayjs(),
          }}
          className="mt-4 space-y-4"
        >
          <Form.Item label="Nhân viên cần bổ sung" name="staffId" rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}>
            <Select className="h-10" options={STAFF_OPTIONS.filter(o => o.value !== 'all')} placeholder="Chọn dược sĩ / thu ngân..." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Ngày chấm công" name="date" rules={[{ required: true, message: 'Vui lòng chọn ngày công' }]}>
              <DatePicker className="w-full h-10 rounded-[var(--radius-md)]" format="DD/MM/YYYY" disabledDate={(current) => current && current > dayjs().endOf('day')} />
            </Form.Item>

            <Form.Item label="Chọn ca làm quy định" name="shift" rules={[{ required: true, message: 'Vui lòng chọn ca' }]}>
              <Select className="h-10" options={[
                { value: 'Ca sáng', label: 'Ca sáng (07:00 - 12:00)' },
                { value: 'Ca chiều', label: 'Ca chiều (12:00 - 17:00)' },
                { value: 'Ca tối', label: 'Ca tối (17:00 - 21:00)' },
                { value: 'Full time', label: 'Full time (07:00 - 21:00)' },
                { value: 'Ca tự chọn', label: 'Ca tự chọn (Tùy chỉnh)' },
              ]} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Thời gian vào ca" name="checkIn">
              <TimePicker format="HH:mm" className="w-full h-10 rounded-[var(--radius-md)]" placeholder="Giờ vào..." />
            </Form.Item>

            <Form.Item label="Thời gian ra ca" name="checkOut">
              <TimePicker format="HH:mm" className="w-full h-10 rounded-[var(--radius-md)]" placeholder="Giờ ra..." />
            </Form.Item>
          </div>

          <Form.Item label="Xét trạng thái công" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái công' }]}>
            <Select className="h-10" options={Object.entries(STATUS_META).map(([key, val]) => ({ value: key, label: val.label }))} />
          </Form.Item>

          <Form.Item label="Ghi chú / Lý do bổ sung" name="note">
            <Input.TextArea rows={3} placeholder="Ghi chú ví dụ: Quên quẹt thẻ lúc vào ca..." className="rounded-[var(--radius-md)]" />
          </Form.Item>

          <div className="flex justify-end gap-3 border-t border-[var(--color-border-light)] pt-4 mt-6">
            <Button className="rounded-[var(--radius-md)] h-10 px-4" onClick={() => setIsAddModalOpen(false)}>Hủy bỏ</Button>
            <Button type="primary" htmlType="submit" className="rounded-[var(--radius-md)] h-10 px-6 bg-[var(--color-primary)] border-none">Xác nhận bổ sung</Button>
          </div>
        </Form>
      </Modal>

      {/* MODAL: HOURLY WAGE RATES SETTINGS */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Settings className="text-[var(--color-primary)]" size={20} />
            <span>Thiết lập mức lương giờ theo vị trí</span>
          </div>
        }
        open={isWageModalOpen}
        onCancel={() => setIsWageModalOpen(false)}
        footer={null}
        width={450}
        className="rounded-[var(--radius-lg)]"
      >
        <Form
          form={wageForm}
          layout="vertical"
          onFinish={handleWageSubmit}
          className="mt-4 space-y-4"
        >
          <Form.Item label="Mức lương vị trí: Quản lý (đ/giờ)" name="adminWage" rules={[{ required: true, message: 'Vui lòng nhập mức lương' }]}>
            <InputNumber className="w-full h-10 rounded-[var(--radius-md)]" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
          </Form.Item>

          <Form.Item label="Mức lương vị trí: Dược sĩ (đ/giờ)" name="pharmacistWage" rules={[{ required: true, message: 'Vui lòng nhập mức lương' }]}>
            <InputNumber className="w-full h-10 rounded-[var(--radius-md)]" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
          </Form.Item>

          <Form.Item label="Mức lương vị trí: Thu ngân (đ/giờ)" name="cashierWage" rules={[{ required: true, message: 'Vui lòng nhập mức lương' }]}>
            <InputNumber className="w-full h-10 rounded-[var(--radius-md)]" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
          </Form.Item>

          <div className="flex justify-end gap-3 border-t border-[var(--color-border-light)] pt-4 mt-6">
            <Button className="rounded-[var(--radius-md)] h-10 px-4" onClick={() => setIsWageModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="rounded-[var(--radius-md)] h-10 px-6 bg-[var(--color-primary)] border-none">Lưu thiết lập</Button>
          </div>
        </Form>
      </Modal>

      {/* MODAL: EXPORT PREVIEW & OPTIONS ("XUẤT BẢNG CÔNG") */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-600" size={22} />
            <span>Xuất dữ liệu chấm công & Lương</span>
          </div>
        }
        open={isExportModalOpen}
        onCancel={() => setIsExportModalOpen(false)}
        footer={null}
        width={480}
        className="rounded-[var(--radius-lg)]"
      >
        <Form
          form={exportForm}
          layout="vertical"
          onFinish={handleExportSubmit}
          initialValues={{
            format: 'excel',
          }}
          className="mt-4 space-y-4"
        >
          <div className="rounded-[var(--radius-lg)] border border-emerald-100 bg-emerald-50/50 p-4 mb-4">
            <div className="text-[13px] text-emerald-800 font-semibold">Tóm tắt dữ liệu sẽ xuất:</div>
            <div className="text-[12px] text-emerald-700 mt-1">
              • Kỳ công đang lọc: <span className="font-semibold">{activeFilters.period === 'all' ? 'Tất cả' : (activeFilters.period === 'today' ? 'Hôm nay' : (activeFilters.period === 'week' ? 'Tuần này' : 'Tháng này'))}</span><br />
              • Số nhân sự được xuất: <span className="font-semibold">{aggregatedRecords.length} nhân viên</span><br />
              • Tổng số giờ công tổng cộng: <span className="font-semibold">{aggregatedRecords.reduce((acc, r) => acc + r.totalHours, 0).toFixed(1)} giờ làm</span>
            </div>
          </div>

          <Form.Item label="Lựa chọn định dạng xuất file" name="format" rules={[{ required: true }]}>
            <Select className="h-10" options={[
              { value: 'excel', label: 'Bảng tính Excel (.xlsx)' },
              { value: 'csv', label: 'Tập tin dữ liệu CSV (.csv)' },
            ]} />
          </Form.Item>

          <div className="flex justify-end gap-3 border-t border-[var(--color-border-light)] pt-4 mt-6">
            <Button className="rounded-[var(--radius-md)] h-10 px-4" onClick={() => setIsExportModalOpen(false)}>Hủy bỏ</Button>
            <Button type="primary" htmlType="submit" className="rounded-[var(--radius-md)] h-10 px-6 bg-emerald-600 hover:bg-emerald-500 border-none">Xuất & Tải xuống</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TimesheetPage;
