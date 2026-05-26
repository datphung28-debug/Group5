import React from 'react';
import { Button, Empty, Space, Table, Tag, Tooltip } from 'antd';
import { Eye, PackageCheck, Printer } from 'lucide-react';

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const STATUS_META = {
  pending: { label: 'Chờ duyệt', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning)' },
  approved: { label: 'Đã duyệt', color: 'var(--color-primary)', bg: 'var(--color-primary-light)', border: 'var(--color-primary-border)' },
  completed: { label: 'Hoàn tất', color: 'var(--color-profit)', bg: 'var(--color-profit-bg)', border: 'var(--color-profit)' },
  rejected: { label: 'Từ chối', color: 'var(--color-debt)', bg: 'var(--color-debt-bg)', border: 'var(--color-debt)' },
};

const REFUND_METHOD_LABELS = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
  store_credit: 'Trừ đơn sau',
};

const StatusTag = ({ status }) => {
  const meta = STATUS_META[status];

  return (
    <Tag
      className="m-0 rounded-full border px-3 py-1 font-medium"
      style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}
    >
      {meta.label}
    </Tag>
  );
};

const ReturnTable = ({ data, onSelect }) => {
  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      fixed: 'left',
      width: 150,
      render: (code, record) => (
        <div>
          <div className="font-semibold text-[var(--color-primary)]">{code}</div>
          <div className="mt-1 text-[12px] text-[var(--color-text-muted)]">{record.createdAt}</div>
        </div>
      ),
    },
    {
      title: 'Hóa đơn gốc',
      dataIndex: 'invoiceCode',
      width: 150,
      render: (value) => <span className="font-medium text-[var(--color-text-primary)]">{value}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      width: 210,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-[var(--color-text-primary)]">{record.customer}</div>
          <div className="mt-1 text-[12px] text-[var(--color-text-muted)]">{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      width: 190,
      render: (reason) => <span className="text-[var(--color-text-secondary)]">{reason}</span>,
    },
    {
      title: 'SL trả',
      dataIndex: 'itemCount',
      align: 'right',
      width: 100,
      render: (value) => <span className="font-bold text-[var(--color-inventory)]">{value.toLocaleString('vi-VN')}</span>,
    },
    {
      title: 'Tiền hoàn',
      dataIndex: 'refundAmount',
      align: 'right',
      width: 140,
      sorter: (a, b) => a.refundAmount - b.refundAmount,
      render: (value) => <span className="font-bold text-[var(--color-debt)]">{formatCurrency(value)}</span>,
    },
    {
      title: 'Hình thức',
      dataIndex: 'refundMethod',
      width: 130,
      render: (value) => <span className="text-[var(--color-text-secondary)]">{REFUND_METHOD_LABELS[value]}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 130,
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 110,
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<Eye size={17} />} onClick={() => onSelect(record)} className="text-[var(--color-primary)]" />
          </Tooltip>
          <Tooltip title="In phiếu">
            <Button type="text" icon={<Printer size={17} />} className="text-[var(--color-text-secondary)]" />
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
          locale={{ emptyText: <Empty description="Không có phiếu trả hàng" /> }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} phiếu`,
            className: 'px-6 py-4 border-t border-[var(--color-border-light)]',
          }}
          scroll={{ x: 1300 }}
          rowClassName="cursor-pointer transition-colors hover:bg-[var(--color-bg-subtle)]"
          onRow={(record) => ({ onClick: () => onSelect(record) })}
        />
      </div>

      <div className="space-y-3 md:hidden">
        {data.length === 0 && (
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-8 shadow-[var(--shadow-card)]">
            <Empty description="Không có phiếu trả hàng" />
          </div>
        )}

        {data.map((record) => (
          <div key={record.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[var(--color-primary)]">{record.code}</h3>
                <p className="mt-1 text-[12px] font-medium text-[var(--color-text-muted)]">{record.invoiceCode} · {record.createdAt}</p>
              </div>
              <StatusTag status={record.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3">
                <div className="text-[var(--color-text-muted)]">Khách hàng</div>
                <div className="mt-1 font-semibold text-[var(--color-text-primary)]">{record.customer}</div>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--color-debt-bg)] p-3">
                <div className="text-[var(--color-text-muted)]">Tiền hoàn</div>
                <div className="mt-1 font-bold text-[var(--color-debt)]">{formatCurrency(record.refundAmount)}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-light)] pt-3">
              <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
                <PackageCheck size={15} />
                <span>{record.itemCount} sản phẩm</span>
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

export default ReturnTable;
