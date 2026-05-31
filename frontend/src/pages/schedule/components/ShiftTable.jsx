import React from 'react';
import { Button, Empty, Space, Table, Tag, Tooltip } from 'antd';
import { Eye } from 'lucide-react';
import { SHIFT_META, STATUS_META } from '../scheduleData';

const ShiftTable = ({ data, onSelect, weekDays = [] }) => {
  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'day',
      width: 110,
      render: (dayKey) => {
        const day = weekDays.find((item) => item.key === dayKey);
        return (
          <div>
            <div className="font-semibold text-[var(--color-text-primary)]">{day?.label}</div>
            <div className="text-[12px] text-[var(--color-text-muted)]">{day?.date}</div>
          </div>
        );
      },
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
    {
      title: 'Ca làm',
      dataIndex: 'shiftType',
      width: 150,
      render: (shiftType) => {
        const meta = SHIFT_META[shiftType];
        return <Tag className="m-0 rounded-full border px-3 py-1 font-medium" style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}>{meta.label}</Tag>;
      },
    },
    { title: 'Giờ làm', key: 'time', width: 140, render: (_, record) => <span className="font-medium text-[var(--color-text-primary)]">{record.startTime} - {record.endTime}</span> },
    { title: 'Khu vực', dataIndex: 'area', width: 140, render: (area) => <span className="text-[var(--color-text-secondary)]">{area}</span> },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      render: (status) => {
        const meta = STATUS_META[status];
        return <Tag className="m-0 rounded-full border px-3 py-1 font-medium" style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}>{meta.label}</Tag>;
      },
    },
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
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        locale={{ emptyText: <Empty description="Không có ca làm phù hợp" /> }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} ca`, className: 'px-6 py-4 border-t border-[var(--color-border-light)]' }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default ShiftTable;
