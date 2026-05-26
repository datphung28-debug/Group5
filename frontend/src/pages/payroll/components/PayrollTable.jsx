import React from 'react';
import { Button, Empty, Progress, Space, Table, Tag, Tooltip } from 'antd';
import { Eye } from 'lucide-react';
import { PAYROLL_STATUS_META } from '../payrollData';

const formatCurrency = (value) => `${value.toLocaleString('vi-VN')} đ`;

const formatPeriod = (value) => {
  const [year, month] = value.split('-');
  return `Tháng ${month}/${year}`;
};

const StatusTag = ({ status }) => {
  const meta = PAYROLL_STATUS_META[status];
  return <Tag className="m-0 rounded-full border px-3 py-1 font-medium" style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}>{meta.label}</Tag>;
};

const PayrollTable = ({ data, onSelect }) => {
  const columns = [
    {
      title: 'Kỳ lương',
      dataIndex: 'period',
      fixed: 'left',
      width: 140,
      sorter: (a, b) => a.period.localeCompare(b.period),
      render: (period) => <span className="font-semibold text-[var(--color-text-primary)]">{formatPeriod(period)}</span>,
    },
    {
      title: 'Nhân viên',
      dataIndex: 'staffName',
      fixed: 'left',
      width: 230,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-[var(--color-text-primary)]">{record.staffName}</div>
          <div className="mt-1 text-[12px] text-[var(--color-text-muted)]">{record.role} · {record.id}</div>
        </div>
      ),
    },
    {
      title: 'Công',
      dataIndex: 'workDays',
      align: 'right',
      width: 110,
      render: (value, record) => (
        <div className="min-w-[80px]">
          <div className="font-bold text-[var(--color-primary)]">{value}/26</div>
          <Progress percent={Math.round((value / 26) * 100)} showInfo={false} strokeColor="var(--color-primary)" trailColor="var(--color-bg-subtle)" size="small" />
          <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">TC {record.overtimeHours}h</div>
        </div>
      ),
    },
    { title: 'Lương cơ bản', dataIndex: 'baseSalary', align: 'right', width: 150, render: (value) => <span className="font-medium text-[var(--color-text-secondary)]">{formatCurrency(value)}</span> },
    { title: 'Phụ cấp', dataIndex: 'allowance', align: 'right', width: 130, render: (value) => <span className="font-medium text-[var(--color-profit)]">{formatCurrency(value)}</span> },
    { title: 'Thưởng', dataIndex: 'bonus', align: 'right', width: 130, render: (value) => <span className="font-medium text-[var(--color-primary)]">{formatCurrency(value)}</span> },
    { title: 'Khấu trừ', dataIndex: 'deductions', align: 'right', width: 130, render: (value) => <span className="font-medium text-[var(--color-debt)]">{formatCurrency(value)}</span> },
    { title: 'Thực lĩnh', dataIndex: 'netPay', align: 'right', width: 160, sorter: (a, b) => a.netPay - b.netPay, render: (value) => <span className="font-bold text-[var(--color-text-primary)]">{formatCurrency(value)}</span> },
    { title: 'Trạng thái', dataIndex: 'status', width: 140, render: (status) => <StatusTag status={status} /> },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 90,
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<Eye size={17} />} onClick={() => onSelect(record)} className="text-[var(--color-primary)]" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="hidden rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] md:block">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          locale={{ emptyText: <Empty description="Không có dữ liệu bảng lương" /> }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} phiếu lương`, className: 'px-6 py-4 border-t border-[var(--color-border-light)]' }}
          scroll={{ x: 1380 }}
          rowClassName="cursor-pointer transition-colors hover:bg-[var(--color-bg-subtle)]"
          onRow={(record) => ({ onClick: () => onSelect(record) })}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {data.length === 0 && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
            <Empty description="Không có dữ liệu bảng lương" />
          </div>
        )}
        {data.map((record) => (
          <div key={record.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">{record.staffName}</h3>
                <p className="mt-1 text-[12px] font-medium text-[var(--color-text-muted)]">{formatPeriod(record.period)} · {record.role}</p>
              </div>
              <StatusTag status={record.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3">
                <div className="text-[var(--color-text-muted)]">Công / tăng ca</div>
                <div className="mt-1 font-semibold text-[var(--color-text-primary)]">{record.workDays} ngày · {record.overtimeHours}h</div>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3">
                <div className="text-[var(--color-text-muted)]">Thực lĩnh</div>
                <div className="mt-1 font-bold text-[var(--color-primary)]">{formatCurrency(record.netPay)}</div>
              </div>
            </div>
            <div className="mt-4 flex justify-end border-t border-[var(--color-border-light)] pt-3">
              <Button type="primary" size="small" onClick={() => onSelect(record)} className="rounded-[var(--radius-md)] border-none bg-[var(--color-primary)]">
                Chi tiết
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PayrollTable;
