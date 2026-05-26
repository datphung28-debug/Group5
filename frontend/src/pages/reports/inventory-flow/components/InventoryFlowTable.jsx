import React from 'react';
import { Empty, Spin, Table, Tag } from 'antd';
import { Info, PackageCheck } from 'lucide-react';

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const getStatus = (record) => {
  if (record.closingStock <= 0) {
    return { label: 'Hết tồn', color: 'var(--color-debt)', bg: 'var(--color-debt-bg)' };
  }
  if (record.closingStock <= record.minStock) {
    return { label: 'Dưới định mức', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' };
  }
  if (record.imported > 0 || record.exported > 0) {
    return { label: 'Có phát sinh', color: 'var(--color-primary)', bg: 'var(--color-primary-light)' };
  }
  return { label: 'Ổn định', color: 'var(--color-profit)', bg: 'var(--color-profit-bg)' };
};

const InventoryFlowTable = ({ data, loading }) => {
  const columns = [
    {
      title: 'Mã thuốc',
      dataIndex: 'code',
      width: 110,
      fixed: 'left',
      render: (code) => <span className="font-semibold text-[var(--color-primary)]">{code}</span>,
    },
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      width: 260,
      fixed: 'left',
      render: (_, record) => (
        <div className="min-w-0">
          <div className="font-semibold text-[var(--color-text-primary)] leading-tight">{record.name}</div>
          <div className="text-[12px] text-[var(--color-text-muted)] mt-0.5 truncate">{record.ingredients || 'Chưa có hoạt chất'}</div>
        </div>
      ),
    },
    {
      title: 'Nhóm',
      dataIndex: 'category',
      width: 150,
      render: (category) => (
        <Tag className="m-0 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-secondary)]">
          {category || 'Chưa phân nhóm'}
        </Tag>
      ),
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
      width: 90,
      render: (unit) => <span className="text-[var(--color-text-secondary)]">{unit || 'Đơn vị'}</span>,
    },
    {
      title: 'Tồn đầu',
      dataIndex: 'openingStock',
      align: 'right',
      width: 110,
      render: (value) => <span className="font-semibold text-[var(--color-text-primary)]">{value.toLocaleString('vi-VN')}</span>,
    },
    {
      title: 'Nhập',
      dataIndex: 'imported',
      align: 'right',
      width: 100,
      render: (value) => <span className="font-semibold text-[var(--color-profit)]">{value.toLocaleString('vi-VN')}</span>,
    },
    {
      title: 'Xuất',
      dataIndex: 'exported',
      align: 'right',
      width: 100,
      render: (value) => <span className="font-semibold text-[var(--color-warning)]">{value.toLocaleString('vi-VN')}</span>,
    },
    {
      title: 'Tồn cuối',
      dataIndex: 'closingStock',
      align: 'right',
      width: 110,
      render: (value) => <span className="font-bold text-[15px] text-[var(--color-inventory)]">{value.toLocaleString('vi-VN')}</span>,
    },
    {
      title: 'Giá trị tồn',
      dataIndex: 'inventoryValue',
      align: 'right',
      width: 140,
      render: (value) => <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(value)}</span>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, record) => {
        const status = getStatus(record);
        return (
          <span
            className="px-2.5 py-1 rounded-[var(--radius-sm)] inline-flex items-center gap-2"
            style={{ backgroundColor: status.bg }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: status.color }}>
              {status.label}
            </span>
          </span>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border-light)] shadow-[var(--shadow-card)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-border-light)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PackageCheck size={17} className="text-[var(--color-primary)]" />
          <span className="text-[15px] font-semibold text-[var(--color-text-primary)]">Chi tiết nhập xuất tồn</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
          <Info size={15} className="text-[var(--color-text-muted)]" />
          <span>Tồn đầu = Tồn cuối - Nhập + Xuất</span>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) => record._id || record.id}
        loading={{ spinning: loading, indicator: <Spin size="large" /> }}
        locale={{ emptyText: <Empty description="Không có dữ liệu NXT trong kỳ đã chọn" /> }}
        scroll={{ x: 1320 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} mặt hàng`,
          className: 'px-6 py-4 border-t border-[var(--color-border-light)]',
          position: ['bottomRight'],
        }}
      />
    </div>
  );
};

export default InventoryFlowTable;
