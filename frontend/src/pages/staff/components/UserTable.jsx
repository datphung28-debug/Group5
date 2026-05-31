import React from 'react';
import { Button, Empty, Space, Table, Tag, Tooltip } from 'antd';
import { Lock, Pencil, ShieldCheck, Unlock } from 'lucide-react';
import { ROLE_META } from '../userData';

const formatDate = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('vi-VN');
};

const RoleTag = ({ role }) => {
  const meta = ROLE_META[role] || ROLE_META.customer;
  return (
    <Tag className="m-0 rounded-full border px-3 py-1 font-medium" style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}>
      {meta.label}
    </Tag>
  );
};

const StatusPill = ({ active }) => (
  <span
    className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1"
    style={{ backgroundColor: active ? 'var(--color-profit-bg)' : 'var(--color-debt-bg)' }}
  >
    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: active ? 'var(--color-profit)' : 'var(--color-debt)' }} />
    <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: active ? 'var(--color-profit)' : 'var(--color-debt)' }}>
      {active ? 'Hoạt động' : 'Đã khóa'}
    </span>
  </span>
);

const UserTable = ({ data, loading, onEdit, onToggleStatus }) => {
  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'name',
      fixed: 'left',
      width: 260,
      sorter: (a, b) => a.name.localeCompare(b.name, 'vi'),
      render: (name, record) => (
        <div className="min-w-0">
          <div className="font-semibold text-[var(--color-text-primary)]">{name}</div>
          <div className="mt-1 text-[12px] font-medium text-[var(--color-text-muted)]">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      width: 130,
      render: (role) => <RoleTag role={role} />,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      width: 150,
      render: (phone) => <span className="font-medium text-[var(--color-text-primary)]">{phone || '--'}</span>,
    },
    {
      title: 'Mã PIN',
      dataIndex: 'clockInPin',
      width: 110,
      render: (pin) => <span className="font-semibold text-slate-700 tracking-wider font-mono">{pin || '--'}</span>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      width: 240,
      render: (address) => <span className="text-[var(--color-text-secondary)]">{address || '--'}</span>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 120,
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      render: (createdAt) => <span className="text-[var(--color-text-secondary)]">{formatDate(createdAt)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 140,
      render: (active) => <StatusPill active={active} />,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<Pencil size={17} />} onClick={() => onEdit(record)} className="text-[var(--color-primary)]" />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
            <Button
              type="text"
              icon={record.isActive ? <Lock size={17} /> : <Unlock size={17} />}
              onClick={() => onToggleStatus(record)}
              className={record.isActive ? 'text-[var(--color-debt)]' : 'text-[var(--color-profit)]'}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="hidden rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)] md:block">
        <Table
          rowKey={(record) => record._id || record.id}
          columns={columns}
          dataSource={data}
          loading={loading}
          locale={{ emptyText: <Empty description="Không có người dùng" /> }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} người dùng`,
            className: 'px-6 py-4 border-t border-[var(--color-border-light)]',
          }}
          scroll={{ x: 1160 }}
          rowClassName="transition-colors hover:bg-[var(--color-bg-subtle)]"
        />
      </div>

      <div className="space-y-3 md:hidden">
        {data.length === 0 && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
            <Empty description="Không có người dùng" />
          </div>
        )}

        {data.map((record) => (
          <div key={record._id || record.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">{record.name}</h3>
                <p className="mt-1 text-[12px] font-medium text-[var(--color-text-muted)]">{record.email}</p>
              </div>
              <RoleTag role={record.role} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-[13px]">
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3">
                <div className="text-[var(--color-text-muted)]">Số điện thoại</div>
                <div className="mt-1 font-semibold text-[var(--color-text-primary)]">{record.phone || '--'}</div>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3">
                <div className="text-[var(--color-text-muted)]">Mã PIN</div>
                <div className="mt-1 font-mono font-semibold text-slate-700 tracking-wider">{record.clockInPin || '--'}</div>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3">
                <div className="text-[var(--color-text-muted)]">Trạng thái</div>
                <div className="mt-1"><StatusPill active={record.isActive} /></div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-[var(--color-border-light)] pt-3">
              <Button size="small" onClick={() => onEdit(record)} className="rounded-[var(--radius-md)]">Sửa</Button>
              <Button size="small" danger={record.isActive} onClick={() => onToggleStatus(record)} className="rounded-[var(--radius-md)]">
                {record.isActive ? 'Khóa' : 'Mở khóa'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default UserTable;
