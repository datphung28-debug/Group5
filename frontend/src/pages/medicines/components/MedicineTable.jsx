import React from 'react';
import { Table, Tag, Badge, Button, Dropdown, Menu, Modal, message } from 'antd';
import { MoreVertical, Eye, Edit3, Power, Package, Trash2, PlayCircle } from 'lucide-react';

const { confirm } = Modal;

const MedicineTable = () => {
  const handleDelete = (record) => {
    confirm({
      title: 'Xác nhận xóa thuốc?',
      icon: <Trash2 size={22} className="text-[var(--color-debt)] mr-2" />,
      content: `Bạn có chắc chắn muốn xóa thuốc "${record.name}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa thuốc',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        message.success(`Đã xóa thuốc ${record.code}`);
      },
    });
  };

  const handleToggleStatus = (record) => {
    const action = record.status === 'active' ? 'ngừng bán' : 'kích hoạt';
    message.success(`Đã ${action} thuốc ${record.code}`);
  };

  const data = [
    {
      id: '1',
      code: 'TH001',
      name: 'Paracetamol 500mg',
      ingredient: 'Paracetamol',
      manufacturer: 'DHG Pharma',
      category: 'Giảm đau - Hạ sốt',
      stock: 120,
      price: 1500,
      unit: 'Viên',
      attributes: ['OTC'],
      status: 'active',
    },
    {
      id: '2',
      code: 'TH002',
      name: 'Amoxicillin 500mg',
      ingredient: 'Amoxicillin',
      manufacturer: 'Imexpharm',
      category: 'Kháng sinh',
      stock: 5,
      price: 3200,
      unit: 'Viên',
      attributes: ['Kê đơn', 'KS'],
      status: 'active',
    },
    {
      id: '3',
      code: 'TH003',
      name: 'Panadol Extra',
      ingredient: 'Paracetamol, Caffeine',
      manufacturer: 'GSK',
      category: 'Giảm đau - Hạ sốt',
      stock: 0,
      price: 2500,
      unit: 'Viên',
      attributes: ['OTC'],
      status: 'inactive',
    },
    {
      id: '4',
      code: 'TH004',
      name: 'Berberin',
      ingredient: 'Berberin chloride',
      manufacturer: 'Mekophar',
      category: 'Tiêu hóa',
      stock: 450,
      price: 500,
      unit: 'Viên',
      attributes: ['OTC'],
      status: 'active',
    },
  ];

  const columns = [
    {
      title: 'Mã thuốc',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <a className="text-[var(--color-primary)] font-medium">{text}</a>,
      width: 100,
    },
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--color-text-primary)]">{record.name}</span>
          <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">{record.ingredient}</span>
          <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">{record.manufacturer}</span>
        </div>
      ),
    },
    {
      title: 'Nhóm',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag className="bg-[var(--color-bg-subtle)] border-[var(--color-primary-border)] text-[var(--color-primary-text)] rounded-[var(--radius-sm)]">
          {category}
        </Tag>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, record) => {
        let color = 'var(--color-profit)';
        let bgColor = 'var(--color-profit-bg)';

        if (stock === 0) {
          color = 'var(--color-debt)';
          bgColor = 'var(--color-debt-bg)';
        } else if (stock < 10) {
          color = 'var(--color-warning)';
          bgColor = 'var(--color-warning-bg)';
        }

        return (
          <div 
            className="px-2 py-1 rounded-[var(--radius-sm)] inline-flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            style={{ backgroundColor: bgColor }}
            onClick={() => message.info(`Lịch sử kho của ${record.code}`)}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-medium" style={{ color: color }}>
              {stock} {record.unit}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <span className="font-semibold text-[var(--color-text-primary)]">
          {price.toLocaleString('vi-VN')}đ / Viên
        </span>
      ),
    },
    {
      title: 'Đặc tính',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attributes) => (
        <div className="flex gap-1 flex-wrap">
          {attributes.map((attr) => (
            <Tag key={attr} className="m-0 border-[var(--color-border)] text-[var(--color-text-secondary)] text-[var(--font-size-xs)]">
              {attr}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'success' : 'default'} 
          text={status === 'active' ? 'Đang bán' : 'Ngừng bán'}
          className={status === 'active' ? 'text-[var(--color-profit)]' : 'text-[var(--color-text-muted)]'}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_, record) => {
        const menu = (
          <Menu className="min-w-[160px] rounded-[var(--radius-md)] shadow-[var(--shadow-dropdown)] border-[var(--color-border-light)] p-1">
            <Menu.Item key="view" icon={<Eye size={14} className="text-blue-500" />}>
              Xem chi tiết
            </Menu.Item>
            <Menu.Item key="edit" icon={<Edit3 size={14} className="text-orange-500" />}>
              Chỉnh sửa
            </Menu.Item>
            <Menu.Item key="stock" icon={<Package size={14} className="text-purple-500" />}>
              Xem tồn kho
            </Menu.Item>
            
            <Menu.Divider />
            
            <Menu.Item 
              key="toggle" 
              icon={record.status === 'active' ? <Power size={14} className="text-red-400" /> : <PlayCircle size={14} className="text-green-500" />}
              onClick={() => handleToggleStatus(record)}
            >
              {record.status === 'active' ? 'Ngừng bán' : 'Kích hoạt'}
            </Menu.Item>
            
            <Menu.Divider />
            
            <Menu.Item 
              key="delete" 
              danger 
              icon={<Trash2 size={14} />}
              onClick={() => handleDelete(record)}
            >
              Xóa thuốc
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <Button 
              type="text" 
              className="flex items-center justify-center rounded-full w-8 h-8 hover:bg-[var(--color-bg-subtle)]"
              icon={<MoreVertical size={18} className="text-[var(--color-text-secondary)]" />} 
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--color-border-light)] overflow-hidden">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{
          total: data.length,
          pageSize: 10,
          showSizeChanger: true,
          className: "px-6 py-4 border-t border-[var(--color-border-light)]",
          position: ['bottomRight']
        }}
        className="medicine-table"
        onRow={(record) => ({
          className: 'hover:bg-[var(--color-bg-app)] transition-colors cursor-pointer',
        })}
      />
    </div>
  );
};

export default MedicineTable;

