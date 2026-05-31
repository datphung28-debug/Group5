import React, { useMemo, useState, useEffect } from 'react';
import { Button, Descriptions, Drawer, Space, message } from 'antd';
import { Download, FileCheck2, Save } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import PayrollFilter from './components/PayrollFilter';
import PayrollKPIs from './components/PayrollKPIs';
import PayrollTable from './components/PayrollTable';
import { PAYROLL_RECORDS, PAYROLL_STATUS_META } from './payrollData';
import { userAPI } from '../../api/api';

const initialFilters = {
  search: '',
  period: '2026-05',
  staffId: 'all',
  status: 'all',
};

const formatCurrency = (value) => `${value.toLocaleString('vi-VN')} đ`;

const formatPeriod = (value) => {
  const [year, month] = value.split('-');
  return `Tháng ${month}/${year}`;
};

const formatDate = (value) => {
  if (!value) return 'Chưa chi trả';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

const PayrollPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await userAPI.getAll();
        const users = res.data?.users || res.data || [];
        setStaffList(users.filter(u => u.isActive));
      } catch (err) {
        console.error("Lỗi lấy danh sách nhân viên:", err);
      }
    };
    fetchStaff();
  }, []);

  const staffOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Tất cả nhân viên' },
      ...staffList.map(u => ({
        value: u._id,
        label: `${u.name} (${u.role === 'admin' ? 'Quản lý' : 'Dược sĩ'})`
      }))
    ];
  }, [staffList]);

  const mappedPayrollRecords = useMemo(() => {
    return PAYROLL_RECORDS.map(record => {
      const realUser = staffList.find(u => u.name === record.staffName);
      return {
        ...record,
        staffId: realUser ? realUser._id : record.staffId,
      };
    });
  }, [staffList]);

  const filteredRecords = useMemo(() => {
    const keyword = activeFilters.search.trim().toLowerCase();

    return mappedPayrollRecords.filter((record) => {
      const matchesKeyword =
        !keyword ||
        record.id.toLowerCase().includes(keyword) ||
        record.staffName.toLowerCase().includes(keyword) ||
        record.role.toLowerCase().includes(keyword);
      const matchesPeriod = activeFilters.period === 'all' || record.period === activeFilters.period;
      const matchesStaff = activeFilters.staffId === 'all' || record.staffId === activeFilters.staffId;
      const matchesStatus = activeFilters.status === 'all' || record.status === activeFilters.status;

      return matchesKeyword && matchesPeriod && matchesStaff && matchesStatus;
    });
  }, [activeFilters, mappedPayrollRecords]);

  const summary = useMemo(() => (
    filteredRecords.reduce(
      (acc, record) => ({
        netPay: acc.netPay + record.netPay,
        paid: acc.paid + (record.status === 'paid' ? record.netPay : 0),
        pending: acc.pending + (record.status !== 'paid' ? record.netPay : 0),
        deductions: acc.deductions + record.deductions,
      }),
      { netPay: 0, paid: 0, pending: 0, deductions: 0 }
    )
  ), [filteredRecords]);

  const handleChange = (nextFilters) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
      {contextHolder}
      <PageHeader
        title="Bảng lương"
        subtitle="Theo dõi kỳ lương, khoản phụ cấp, khấu trừ và trạng thái chi trả nhân sự"
        actions={
          <Space size={12} wrap>
            <Button
              icon={<Download size={18} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              onClick={() => messageApi.info('Xuất bảng lương sẽ được nối với API khi có backend nhân sự.')}
            >
              Xuất bảng lương
            </Button>
            <Button
              type="primary"
              icon={<FileCheck2 size={18} className="mr-2 inline" />}
              className="h-10 rounded-[var(--radius-md)] border-none bg-[var(--color-primary)] px-6 font-medium shadow-[var(--shadow-card)]"
              onClick={() => messageApi.info('Duyệt kỳ lương sẽ được nối với API khi có backend nhân sự.')}
            >
              Duyệt kỳ lương
            </Button>
          </Space>
        }
      />

      <PayrollFilter
        filters={filters}
        onChange={handleChange}
        onApply={() => setActiveFilters(filters)}
        onReset={() => {
          setFilters(initialFilters);
          setActiveFilters(initialFilters);
        }}
        staffOptions={staffOptions}
      />

      <PayrollKPIs summary={summary} />
      <PayrollTable data={filteredRecords} onSelect={setSelectedRecord} />

      <Drawer
        title="Chi tiết phiếu lương"
        placement="right"
        width={560}
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        extra={
          <Button
            type="primary"
            icon={<Save size={16} />}
            className="rounded-[var(--radius-md)] border-none bg-[var(--color-primary)]"
            onClick={() => messageApi.info('Lưu điều chỉnh lương sẽ được nối với API khi có backend nhân sự.')}
          >
            Lưu điều chỉnh
          </Button>
        }
      >
        {selectedRecord && (
          <div className="space-y-5">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-[var(--color-bg-subtle)] p-4">
              <div className="font-semibold text-[var(--color-text-primary)]">{selectedRecord.staffName}</div>
              <div className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{selectedRecord.role} · {formatPeriod(selectedRecord.period)}</div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-medium" style={{ color: PAYROLL_STATUS_META[selectedRecord.status].color, backgroundColor: PAYROLL_STATUS_META[selectedRecord.status].bg, borderColor: PAYROLL_STATUS_META[selectedRecord.status].border }}>
                {PAYROLL_STATUS_META[selectedRecord.status].label}
              </div>
            </div>

            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Mã phiếu">{selectedRecord.id}</Descriptions.Item>
              <Descriptions.Item label="Ngày công">{selectedRecord.workDays} ngày</Descriptions.Item>
              <Descriptions.Item label="Tăng ca">{selectedRecord.overtimeHours}h</Descriptions.Item>
              <Descriptions.Item label="Lương cơ bản">{formatCurrency(selectedRecord.baseSalary)}</Descriptions.Item>
              <Descriptions.Item label="Phụ cấp">{formatCurrency(selectedRecord.allowance)}</Descriptions.Item>
              <Descriptions.Item label="Thưởng">{formatCurrency(selectedRecord.bonus)}</Descriptions.Item>
              <Descriptions.Item label="Khấu trừ">{formatCurrency(selectedRecord.deductions)}</Descriptions.Item>
              <Descriptions.Item label="Thực lĩnh">{formatCurrency(selectedRecord.netPay)}</Descriptions.Item>
              <Descriptions.Item label="Ngày chi trả">{formatDate(selectedRecord.paidAt)}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{selectedRecord.note}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PayrollPage;
