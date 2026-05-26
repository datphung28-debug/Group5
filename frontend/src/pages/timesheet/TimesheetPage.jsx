import React, { useMemo, useState } from 'react';
import { Button, Descriptions, Drawer, Space, message } from 'antd';
import { Download, FileClock, Save } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import TimesheetFilter from './components/TimesheetFilter';
import TimesheetKPIs from './components/TimesheetKPIs';
import TimesheetTable from './components/TimesheetTable';
import { METHOD_META, STATUS_META, TIMESHEET_RECORDS } from './timesheetData';

const initialFilters = {
  period: 'month',
  staffId: 'all',
  status: 'all',
  method: 'all',
  dateRange: null,
};

const formatDate = (value) => {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

const TimesheetPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const filteredRecords = useMemo(() => (
    TIMESHEET_RECORDS.filter((record) => {
      const matchesStaff = activeFilters.staffId === 'all' || record.staffId === activeFilters.staffId;
      const matchesStatus = activeFilters.status === 'all' || record.status === activeFilters.status;
      const matchesMethod = activeFilters.method === 'all' || record.method === activeFilters.method;
      const matchesDate =
        !activeFilters.dateRange ||
        activeFilters.dateRange.length !== 2 ||
        (() => {
          const fromDay = activeFilters.dateRange[0].format('YYYY-MM-DD');
          const toDay = activeFilters.dateRange[1].format('YYYY-MM-DD');
          return record.date >= fromDay && record.date <= toDay;
        })();

      return matchesStaff && matchesStatus && matchesMethod && matchesDate;
    })
  ), [activeFilters]);

  const summary = useMemo(() => (
    filteredRecords.reduce(
      (acc, record) => ({
        total: acc.total + 1,
        complete: acc.complete + (record.status === 'complete' || record.status === 'overtime' ? 1 : 0),
        exceptions: acc.exceptions + (record.status === 'late' || record.status === 'missing' ? 1 : 0),
        overtimeHours: acc.overtimeHours + record.overtimeHours,
      }),
      { total: 0, complete: 0, exceptions: 0, overtimeHours: 0 }
    )
  ), [filteredRecords]);

  const handleChange = (nextFilters) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
      {contextHolder}
      <PageHeader
        title="Chấm công"
        subtitle="Theo dõi giờ vào ra, trạng thái công và tăng ca của nhân sự"
        actions={
          <Space size={12} wrap>
            <Button
              icon={<Download size={18} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              onClick={() => messageApi.info('Xuất bảng công sẽ được nối với API khi có backend chấm công.')}
            >
              Xuất bảng công
            </Button>
            <Button
              type="primary"
              icon={<FileClock size={18} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-6 font-medium shadow-[var(--shadow-card)]"
              onClick={() => messageApi.info('Bổ sung chấm công thủ công sẽ được nối với API khi có backend chấm công.')}
            >
              Bổ sung công
            </Button>
          </Space>
        }
      />

      <TimesheetFilter
        filters={filters}
        onChange={handleChange}
        onApply={() => setActiveFilters(filters)}
        onReset={() => {
          setFilters(initialFilters);
          setActiveFilters(initialFilters);
        }}
      />

      <TimesheetKPIs summary={summary} />
      <TimesheetTable data={filteredRecords} onSelect={setSelectedRecord} />

      <Drawer
        title="Chi tiết chấm công"
        placement="right"
        width={520}
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        extra={
          <Button
            type="primary"
            icon={<Save size={16} />}
            className="rounded-[var(--radius-md)] border-none bg-[var(--color-primary)]"
            onClick={() => messageApi.info('Lưu điều chỉnh công sẽ được nối với API khi có backend chấm công.')}
          >
            Lưu điều chỉnh
          </Button>
        }
      >
        {selectedRecord && (
          <div className="space-y-5">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] p-4">
              <div className="font-semibold text-[var(--color-text-primary)]">{selectedRecord.staffName}</div>
              <div className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{selectedRecord.role} · {selectedRecord.shift}</div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-medium" style={{ color: STATUS_META[selectedRecord.status].color, backgroundColor: STATUS_META[selectedRecord.status].bg, borderColor: STATUS_META[selectedRecord.status].border }}>
                {STATUS_META[selectedRecord.status].label}
              </div>
            </div>

            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Ngày công">{formatDate(selectedRecord.date)}</Descriptions.Item>
              <Descriptions.Item label="Giờ ca">{selectedRecord.scheduledTime}</Descriptions.Item>
              <Descriptions.Item label="Chấm vào">{selectedRecord.checkIn || '--'}</Descriptions.Item>
              <Descriptions.Item label="Chấm ra">{selectedRecord.checkOut || '--'}</Descriptions.Item>
              <Descriptions.Item label="Giờ công">{selectedRecord.workHours.toFixed(1)}h</Descriptions.Item>
              <Descriptions.Item label="Tăng ca">{selectedRecord.overtimeHours.toFixed(1)}h</Descriptions.Item>
              <Descriptions.Item label="Nguồn chấm công">{METHOD_META[selectedRecord.method]}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{selectedRecord.note}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TimesheetPage;
