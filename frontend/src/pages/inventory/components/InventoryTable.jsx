import React from 'react';
import { Empty, message, Spin, Table, Tag, Button } from 'antd';
import { Calendar, Eye, Info, MapPin } from 'lucide-react';
import { getDaysToExpiry, getInventoryStatus } from '../inventoryUtils';

const formatCurrency = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}tr đ`;
  return `${(value / 1000).toFixed(0)}k đ`;
};

const formatLocation = (location) => {
  if (!location) return 'Chưa xếp kho';
  if (location.label) return location.label;
  if (location.zone) return `Khu ${location.zone} - Kệ ${location.shelf || 1}`;
  return 'Chưa xếp kho';
};

const InventoryTable = ({ rows, loading }) => {
  const columns = [
    {
      title: 'Mã thuốc',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <span className="font-medium text-[var(--color-primary)]">{text}</span>,
      width: 110,
    },
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold leading-tight text-[var(--color-text-primary)]">{record.name}</span>
          <span className="mt-0.5 text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">{record.ingredient}</span>
          <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">{record.manufacturer}</span>
        </div>
      ),
      width: 250,
    },
    {
      title: 'Nhóm',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag className="m-0 rounded-[var(--radius-sm)] border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]">
          {category || '--'}
        </Tag>
      ),
      width: 140,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'totalStock',
      key: 'totalStock',
      render: (stock, record) => {
        let color = 'var(--color-profit)';
        if (stock === 0) color = 'var(--color-debt)';
        else if (stock <= record.minStock) color = 'var(--color-warning)';

        return (
          <div className="flex flex-col">
            <span className="text-[15px] font-bold" style={{ color }}>{stock.toLocaleString('vi-VN')}</span>
            <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">{record.unit}</span>
          </div>
        );
      },
      width: 100,
    },
    {
      title: 'Tồn tối thiểu',
      dataIndex: 'minStock',
      key: 'minStock',
      render: (value, record) => (
        <span className="font-medium text-[var(--color-text-secondary)]">
          {Number(value || 0).toLocaleString('vi-VN')} {record.unit}
        </span>
      ),
      width: 130,
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'nearestExpiry',
      key: 'nearestExpiry',
      render: (date) => {
        if (!date) return <span className="text-[var(--color-text-muted)]">--</span>;

        const daysToExpiry = getDaysToExpiry(date);
        let color = 'var(--color-text-primary)';
        if (daysToExpiry <= 30) color = 'var(--color-debt)';
        else if (daysToExpiry <= 90) color = 'var(--color-warning)';

        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1 font-medium" style={{ color }}>
              <Calendar size={13} />
              {new Date(date).toLocaleDateString('vi-VN')}
            </div>
            <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
              {daysToExpiry > 0 ? `Còn ${daysToExpiry} ngày` : 'Đã hết hạn'}
            </span>
          </div>
        );
      },
      width: 150,
    },
    {
      title: 'Vị trí kho',
      dataIndex: 'location',
      key: 'location',
      render: (location) => (
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <MapPin size={14} className="text-[var(--color-primary)]" />
          <span className="font-medium">{formatLocation(location)}</span>
        </div>
      ),
      width: 170,
    },
    {
      title: 'Giá trị tồn',
      dataIndex: 'inventoryValue',
      key: 'inventoryValue',
      render: (value) => <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(value)}</span>,
      width: 120,
    },
    {
      title: 'Tình trạng',
      key: 'status',
      render: (_, record) => {
        const status = getInventoryStatus(record);
        return (
          <div
            className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1"
            style={{ backgroundColor: status.bgColor }}
          >
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
            <span className="text-[var(--font-size-xs)] font-bold uppercase" style={{ color: status.color }}>
              {status.label}
            </span>
          </div>
        );
      },
      width: 140,
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<Eye size={16} className="text-[var(--color-primary)]" />}
          className="flex items-center gap-2 font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
          onClick={() => message.info(`Xem chi tiết tồn kho của ${record.code}`)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-[var(--color-primary)]" />
          <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
            Hiển thị <span className="font-bold text-[var(--color-text-primary)]">{rows.length}</span> kết quả tồn kho
          </span>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={rows}
        rowKey={(record) => record._id || record.id}
        loading={{ spinning: loading, indicator: <Spin size="large" /> }}
        locale={{ emptyText: <Empty description="Chưa có dữ liệu tồn kho" /> }}
        scroll={{ x: 1320 }}
        pagination={{
          total: rows.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} mục`,
          className: 'border-t border-[var(--color-border-light)] px-6 py-4',
          position: ['bottomRight'],
        }}
        onRow={() => ({
          className: 'cursor-pointer transition-colors hover:bg-[var(--color-bg-app)]',
        })}
      />
    </div>
  );
};

export default InventoryTable;
