import React from 'react';
import { Table, Tag, Button, Tooltip, message } from 'antd';
import { Layers, Eye, Calendar, Info } from 'lucide-react';

const InventoryTable = () => {
  const data = [
    {
      id: '1',
      code: 'TH001',
      name: 'Paracetamol 500mg',
      ingredient: 'Paracetamol',
      manufacturer: 'DHG Pharma',
      category: 'Giảm đau - Hạ sốt',
      batches: [
        { id: 'B1', quantity: 100, expiryDate: '2026-12-31' },
        { id: 'B2', quantity: 20, expiryDate: '2026-05-20' },
      ],
      totalStock: 120,
      unit: 'Viên',
      nearestExpiry: '2026-05-20',
      inventoryValue: 180000,
    },
    {
      id: '2',
      code: 'TH002',
      name: 'Amoxicillin 500mg',
      ingredient: 'Amoxicillin',
      manufacturer: 'Imexpharm',
      category: 'Kháng sinh',
      batches: [
        { id: 'B3', quantity: 5, expiryDate: '2026-04-30' },
      ],
      totalStock: 5,
      unit: 'Viên',
      nearestExpiry: '2026-04-30',
      inventoryValue: 16000,
    },
    {
      id: '3',
      code: 'TH004',
      name: 'Berberin',
      ingredient: 'Berberin chloride',
      manufacturer: 'Mekophar',
      category: 'Tiêu hóa',
      batches: [
        { id: 'B4', quantity: 450, expiryDate: '2027-01-15' },
      ],
      totalStock: 450,
      unit: 'Viên',
      nearestExpiry: '2027-01-15',
      inventoryValue: 225000,
    },
    {
      id: '4',
      code: 'TH005',
      name: 'Hapacol 250',
      ingredient: 'Paracetamol',
      manufacturer: 'DHG Pharma',
      category: 'Giảm đau - Hạ sốt',
      batches: [],
      totalStock: 0,
      unit: 'Gói',
      nearestExpiry: null,
      inventoryValue: 0,
    },
  ];

  const getStatus = (record) => {
    const today = new Date();
    const expiryDate = record.nearestExpiry ? new Date(record.nearestExpiry) : null;
    const daysToExpiry = expiryDate ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)) : Infinity;
    
    if (record.totalStock === 0) return { label: 'Hết hàng', color: 'var(--color-debt)', bgColor: 'var(--color-debt-bg)' };
    if (daysToExpiry <= 30) return { label: 'Cảnh báo HSD', color: 'var(--color-debt)', bgColor: 'var(--color-debt-bg)' };
    if (record.totalStock < 10) return { label: 'Sắp hết', color: 'var(--color-warning)', bgColor: 'var(--color-warning-bg)' };
    if (daysToExpiry <= 90) return { label: 'Cảnh báo HSD', color: 'var(--color-warning)', bgColor: 'var(--color-warning-bg)' };
    
    return { label: 'Bình thường', color: 'var(--color-profit)', bgColor: 'var(--color-profit-bg)' };
  };

  const columns = [
    {
      title: 'Mã thuốc',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <a className="text-[var(--color-primary)] font-medium hover:underline">{text}</a>,
      width: 100,
    },
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--color-text-primary)] leading-tight">{record.name}</span>
          <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] mt-0.5">{record.ingredient}</span>
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
        <Tag className="bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-[var(--radius-sm)] m-0">
          {category}
        </Tag>
      ),
      width: 140,
    },
    {
      title: 'Số lô',
      dataIndex: 'batches',
      key: 'batches',
      render: (batches) => (
        <div className="flex items-center gap-1.5 text-[var(--color-text-primary)]">
          <Layers size={14} className="text-[var(--color-primary)]" />
          <span className="font-medium">{batches.length} lô</span>
        </div>
      ),
      width: 100,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'totalStock',
      key: 'totalStock',
      render: (stock, record) => {
        let color = 'var(--color-profit)';
        if (stock === 0) color = 'var(--color-debt)';
        else if (stock < 10) color = 'var(--color-warning)';

        return (
          <div className="flex flex-col">
            <span className="font-bold text-[15px]" style={{ color }}>{stock.toLocaleString()}</span>
            <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">{record.unit}</span>
          </div>
        );
      },
      width: 100,
    },
    {
      title: 'Hạn gần nhất',
      dataIndex: 'nearestExpiry',
      key: 'nearestExpiry',
      render: (date) => {
        if (!date) return <span className="text-[var(--color-text-muted)]">--</span>;
        
        const today = new Date();
        const expiryDate = new Date(date);
        const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
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
      title: 'Giá trị tồn',
      dataIndex: 'inventoryValue',
      key: 'inventoryValue',
      render: (value) => {
        const displayValue = value >= 1000000 
          ? `${(value / 1000000).toFixed(2)}tr đ` 
          : `${(value / 1000).toFixed(0)}k đ`;
        return <span className="font-semibold text-[var(--color-text-primary)]">{displayValue}</span>;
      },
      width: 120,
    },
    {
      title: 'Tình trạng',
      key: 'status',
      render: (_, record) => {
        const status = getStatus(record);
        return (
          <div 
            className="px-2.5 py-1 rounded-[var(--radius-sm)] inline-flex items-center gap-2"
            style={{ backgroundColor: status.bgColor }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
            <span className="text-[var(--font-size-xs)] font-bold uppercase tracking-wider" style={{ color: status.color }}>
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
          className="flex items-center gap-2 text-[var(--color-primary)] font-medium hover:bg-[var(--color-primary-light)]"
          onClick={() => message.info(`Xem chi tiết lô của ${record.code}`)}
        >
          Xem lô
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border-light)] shadow-[var(--shadow-card)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-border-light)] flex justify-between items-center bg-white">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-[var(--color-primary)]" />
          <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
            Hiển thị <span className="font-bold text-[var(--color-text-primary)]">{data.length}</span> kết quả tồn kho
          </span>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          total: data.length,
          pageSize: 10,
          showSizeChanger: true,
          className: "px-6 py-4 border-t border-[var(--color-border-light)]",
          position: ['bottomRight']
        }}
        onRow={(record) => ({
          className: 'hover:bg-[var(--color-bg-app)] transition-colors cursor-pointer'
        })}
      />
    </div>
  );
};

export default InventoryTable;
