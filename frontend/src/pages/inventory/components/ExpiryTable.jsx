import React from 'react';
import { Table, Tag, Button, message, Card } from 'antd';
import { Eye, Calendar } from 'lucide-react';

const ExpiryTable = ({ range }) => {
  const data = [
    {
      id: '1',
      name: 'Amoxicillin 500mg',
      description: 'Kháng sinh / Imexpharm',
      batch: 'B3-1204',
      expiryDate: '2026-04-30',
      daysRemaining: 3,
      stock: 5,
      unit: 'Viên',
      value: 16000,
      severity: 'emergency',
    },
    {
      id: '2',
      name: 'Paracetamol 500mg',
      description: 'Giảm đau / DHG Pharma',
      batch: 'B2-9921',
      expiryDate: '2026-05-20',
      daysRemaining: 23,
      stock: 20,
      unit: 'Viên',
      value: 30000,
      severity: 'warning',
    },
    {
      id: '3',
      name: 'Berberin chloride',
      description: 'Tiêu hóa / Mekophar',
      batch: 'B4-0012',
      expiryDate: '2026-07-15',
      daysRemaining: 79,
      stock: 120,
      unit: 'Viên',
      value: 60000,
      severity: 'tracking',
    },
  ];

  // Filter based on range
  const filteredData = data.filter(item => item.daysRemaining <= range);

  const columns = [
    {
      title: 'Tên thuốc',
      key: 'name',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--color-text-primary)]">{record.name}</span>
          <span className="text-[var(--font-size-xs)] text-[var(--color-text-secondary)] mt-0.5">{record.description}</span>
        </div>
      ),
      width: 250,
    },
    {
      title: 'Số lô',
      dataIndex: 'batch',
      key: 'batch',
      render: (text) => <a className="text-[var(--color-primary)] font-medium hover:underline">{text}</a>,
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
            {days} ngày
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
          <span className="font-medium text-[var(--color-text-primary)]">{record.stock.toLocaleString()}</span>
          <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">{record.unit}</span>
        </div>
      ),
      width: 100,
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      render: (val) => (
        <span className="font-medium text-[var(--color-text-primary)]">
          {val.toLocaleString('vi-VN')}đ
        </span>
      ),
      width: 120,
    },
    {
      title: 'Mức độ',
      key: 'severity',
      render: (_, record) => {
        const config = {
          emergency: { label: 'Khẩn cấp', color: 'var(--color-debt)', bgColor: 'var(--color-debt-bg)' },
          warning: { label: 'Cảnh báo', color: 'var(--color-warning)', bgColor: 'var(--color-warning-bg)' },
          tracking: { label: 'Theo dõi', color: 'var(--color-primary)', bgColor: 'var(--color-primary-light)' },
        };
        const status = config[record.severity] || config.tracking;
        return (
          <Tag 
            className="m-0 border-none font-bold text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-[var(--radius-sm)]"
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
          className="flex items-center gap-2 text-[var(--color-primary)] font-medium hover:bg-[var(--color-primary-light)]"
          onClick={() => message.info(`Xem chi tiết lô ${record.batch}`)}
        >
          Xem lô
        </Button>
      ),
      width: 100,
    },
  ];

  return (
    <Card 
      className="shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)] overflow-hidden" 
      styles={{ body: { padding: 0 } }}
    >
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={false}
        rowClassName={(record) => 
          `transition-colors cursor-pointer ${
            record.severity === 'emergency' ? 'bg-[var(--color-debt-bg)]' : ''
          }`
        }
      />
    </Card>
  );
};

export default ExpiryTable;
