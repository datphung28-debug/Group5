import React from 'react';
import { Button, Empty, Space, Table, Tag, Tooltip } from 'antd';
import { Eye } from 'lucide-react';
import { METHOD_META, STATUS_META } from '../timesheetData';

const StatusTag = ({ status }) => {
  const meta = STATUS_META[status];
  return <Tag className="m-0 rounded-full border px-3 py-1 font-medium" style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}>{meta.label}</Tag>;
};

const formatDate = (value) => {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

const TimesheetTable = ({ data, onSelect }) => {
  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      fixed: 'left',
      width: 120,
      sorter: (a, b) => a.date.localeCompare(b.date),
      render: (date) => <span className="font-semibold text-[var(--color-text-primary)]">{formatDate(date)}</span>,
    },
    {
      title: 'Nhân viên',
      dataIndex: 'staffName',
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-[var(--color-text-primary)]">{record.staffName}</div>
          <div className="mt-1 text-[12px] text-[var(--color-text-muted)]">{record.role}</div>
        </div>
      ),
    },
    { title: 'Ca làm', dataIndex: 'shift', width: 120, render: (shift) => <span className="font-medium text-[var(--color-primary)]">{shift}</span> },
    { title: 'Giờ ca', dataIndex: 'scheduledTime', width: 140, render: (value) => <span className="text-[var(--color-text-secondary)]">{value}</span> },
    { title: 'Vào', dataIndex: 'checkIn', width: 90, render: (value) => <span className="font-semibold text-[var(--color-text-primary)]">{value || '--'}</span> },
    { title: 'Ra', dataIndex: 'checkOut', width: 90, render: (value) => <span className="font-semibold text-[var(--color-text-primary)]">{value || '--'}</span> },
    { title: 'Giờ công', dataIndex: 'workHours', align: 'right', width: 110, render: (value) => <span className="font-bold text-[var(--color-inventory)]">{value.toFixed(1)}h</span> },
    { title: 'Tăng ca', dataIndex: 'overtimeHours', align: 'right', width: 110, render: (value) => <span className="font-bold text-[var(--color-warning)]">{value.toFixed(1)}h</span> },
    { title: 'Nguồn', dataIndex: 'method', width: 110, render: (method) => <Tag className="m-0 rounded-full px-3 py-1">{METHOD_META[method]}</Tag> },
    { title: 'Trạng thái', dataIndex: 'status', width: 150, render: (status) => <StatusTag status={status} /> },
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
          locale={{ emptyText: <Empty description="Không có dữ liệu chấm công" /> }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bản ghi`, className: 'px-6 py-4 border-t border-[var(--color-border-light)]' }}
          scroll={{ x: 1280 }}
          rowClassName="cursor-pointer transition-colors hover:bg-[var(--color-bg-subtle)]"
          onRow={(record) => ({ onClick: () => onSelect(record) })}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {data.length === 0 && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
            <Empty description="Không có dữ liệu chấm công" />
          </div>
        )}
        {data.map((record) => (
          <div key={record.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">{record.staffName}</h3>
                <p className="mt-1 text-[12px] font-medium text-[var(--color-text-muted)]">{formatDate(record.date)} · {record.shift}</p>
              </div>
              <StatusTag status={record.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3">
                <div className="text-[var(--color-text-muted)]">Vào / Ra</div>
                <div className="mt-1 font-semibold text-[var(--color-text-primary)]">{record.checkIn || '--'} - {record.checkOut || '--'}</div>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3">
                <div className="text-[var(--color-text-muted)]">Giờ công</div>
                <div className="mt-1 font-bold text-[var(--color-inventory)]">{record.workHours.toFixed(1)}h</div>
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

export default TimesheetTable;
