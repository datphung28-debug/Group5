import React from 'react';
import { Button, Empty, Space, Table, Tag, Tooltip } from 'antd';
import { Eye, MonitorSmartphone } from 'lucide-react';
import { ACTION_META, MODULE_LABELS } from '../activityData';

const ActionTag = ({ action }) => {
  const meta = ACTION_META[action];
  return (
    <Tag className="m-0 rounded-full border px-3 py-1 font-medium" style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}>
      {meta.label}
    </Tag>
  );
};

const StatusPill = ({ status }) => {
  const isWarning = status === 'warning';
  return (
    <span className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1" style={{ backgroundColor: isWarning ? 'var(--color-warning-bg)' : 'var(--color-profit-bg)' }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: isWarning ? 'var(--color-warning)' : 'var(--color-profit)' }} />
      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: isWarning ? 'var(--color-warning)' : 'var(--color-profit)' }}>
        {isWarning ? 'Cần theo dõi' : 'Thành công'}
      </span>
    </span>
  );
};

const ActivityTable = ({ data, onSelect }) => {
  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      fixed: 'left',
      width: 150,
      sorter: (a, b) => new Date(a.timestamp.replace(' ', 'T')) - new Date(b.timestamp.replace(' ', 'T')),
      render: (value) => {
        const [date, time] = value.split(' ');
        return (
          <div>
            <div className="font-semibold text-[var(--color-text-primary)]">{time}</div>
            <div className="mt-1 text-[12px] text-[var(--color-text-muted)]">{date.split('-').reverse().join('/')}</div>
          </div>
        );
      },
    },
    {
      title: 'Người dùng',
      dataIndex: 'userName',
      width: 210,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-[var(--color-text-primary)]">{record.userName}</div>
          <div className="mt-1 text-[12px] font-medium text-[var(--color-text-muted)]">{record.userRole}</div>
        </div>
      ),
    },
    { title: 'Thao tác', dataIndex: 'action', width: 130, render: (action) => <ActionTag action={action} /> },
    { title: 'Phân hệ', dataIndex: 'module', width: 130, render: (module) => <span className="font-medium text-[var(--color-text-primary)]">{MODULE_LABELS[module]}</span> },
    {
      title: 'Đối tượng',
      dataIndex: 'target',
      width: 190,
      render: (target) => <span className="font-semibold text-[var(--color-primary)]">{target}</span>,
    },
    {
      title: 'Nội dung',
      dataIndex: 'description',
      width: 320,
      render: (description) => <span className="text-[var(--color-text-secondary)]">{description}</span>,
    },
    { title: 'Trạng thái', dataIndex: 'status', width: 140, render: (status) => <StatusPill status={status} /> },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 90,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button type="text" icon={<Eye size={17} />} onClick={() => onSelect(record)} className="text-[var(--color-primary)]" />
        </Tooltip>
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
          locale={{ emptyText: <Empty description="Không có lịch sử hoạt động" /> }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} hoạt động`, className: 'px-6 py-4 border-t border-[var(--color-border-light)]' }}
          scroll={{ x: 1360 }}
          rowClassName="cursor-pointer transition-colors hover:bg-[var(--color-bg-subtle)]"
          onRow={(record) => ({ onClick: () => onSelect(record) })}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {data.length === 0 && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
            <Empty description="Không có lịch sử hoạt động" />
          </div>
        )}
        {data.map((record) => (
          <div key={record.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">{record.userName}</h3>
                <p className="mt-1 text-[12px] font-medium text-[var(--color-text-muted)]">{record.timestamp}</p>
              </div>
              <ActionTag action={record.action} />
            </div>
            <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3 text-[13px] text-[var(--color-text-secondary)]">
              <div className="mb-1 font-semibold text-[var(--color-primary)]">{record.target}</div>
              {record.description}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-light)] pt-3">
              <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
                <MonitorSmartphone size={15} />
                <span>{record.ipAddress}</span>
              </div>
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

export default ActivityTable;
