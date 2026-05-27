import React from 'react';
import { Button, Card, Empty, message, Spin, Table, Tag } from 'antd';
import { Calendar, Eye } from 'lucide-react';

const severityConfig = {
  emergency: { label: 'Khẩn cấp', color: 'var(--color-debt)', bgColor: 'var(--color-debt-bg)' },
  warning: { label: 'Cảnh báo', color: 'var(--color-warning)', bgColor: 'var(--color-warning-bg)' },
  tracking: { label: 'Theo dõi', color: 'var(--color-primary)', bgColor: 'var(--color-primary-light)' },
};

const ExpiryTable = ({ rows, loading }) => {
  const columns = [
    {
      title: 'Tên thuốc',
      key: 'name',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--color-text-primary)]">{record.name}</span>
          <span className="mt-0.5 text-[var(--font-size-xs)] text-[var(--color-text-secondary)]">{record.description}</span>
        </div>
      ),
      width: 250,
    },
    {
      title: 'Mã thuốc',
      dataIndex: 'batch',
      key: 'batch',
      render: (text) => <span className="font-medium text-[var(--color-primary)]">{text}</span>,
      width: 120,
    },
    {
      title: 'Hạn dùng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => (
        <div className="flex items-center gap-2 font-medium text-[var(--color-text-primary)]">
          <Calendar size={14} className="text-[var(--color-text-muted)]" />
          {new Date(date).toLocaleDateString('vi-VN')}
        </div>
      ),
      width: 140,
    },
    {
      title: 'Còn lại',
      dataIndex: 'daysRemaining',
      key: 'daysRemaining',
      sorter: (a, b) => a.daysRemaining - b.daysRemaining,
      defaultSortOrder: 'ascend',
      render: (days) => {
        let color = 'var(--color-text-primary)';
        if (days <= 7) color = 'var(--color-debt)';
        else if (days <= 30) color = 'var(--color-warning)';

        return (
          <span className="font-bold" style={{ color }}>
            {days > 0 ? `${days} ngày` : 'Đã hết hạn'}
          </span>
        );
      },
      width: 120,
    },
    {
      title: 'Tồn kho',
      key: 'stock',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--color-text-primary)]">{record.stock.toLocaleString('vi-VN')}</span>
          <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">{record.unit}</span>
        </div>
      ),
      width: 100,
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      render: (value) => (
        <span className="font-medium text-[var(--color-text-primary)]">
          {value.toLocaleString('vi-VN')}đ
        </span>
      ),
      width: 120,
    },
    {
      title: 'Mức độ',
      key: 'severity',
      render: (_, record) => {
        const status = severityConfig[record.severity] || severityConfig.tracking;
        return (
          <Tag
            className="m-0 rounded-[var(--radius-sm)] border-none px-2 py-0.5 text-[11px] font-bold uppercase"
            style={{ backgroundColor: status.bgColor, color: status.color }}
          >
            {status.label}
          </Tag>
        );
      },
      width: 120,
    },
    {
      title: 'Xử lý',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          icon={<Eye size={16} className="text-[var(--color-primary)]" />}
          className="flex items-center gap-2 font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
          onClick={() => message.info(`Xem chi tiết thuốc ${record.batch}`)}
        >
          Xem
        </Button>
      ),
      width: 100,
    },
  ];

  return (
    <Card
      className="overflow-hidden rounded-[var(--radius-lg)] border-[var(--color-border-light)] shadow-[var(--shadow-card)]"
      styles={{ body: { padding: 0 } }}
    >
      <Table
        columns={columns}
        dataSource={rows}
        rowKey={(record) => record._id || record.id}
        loading={{ spinning: loading, indicator: <Spin size="large" /> }}
        locale={{ emptyText: <Empty description="Không có thuốc sắp hết hạn trong khoảng này" /> }}
        pagination={false}
        rowClassName={(record) =>
          `cursor-pointer transition-colors ${
            record.severity === 'emergency' ? 'bg-[var(--color-debt-bg)]' : ''
          }`
        }
      />
    </Card>
  );
};

export default ExpiryTable;
