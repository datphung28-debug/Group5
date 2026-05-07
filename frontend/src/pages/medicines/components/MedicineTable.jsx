import React from 'react';
import { Table, Tag, Badge, Button, Dropdown, Popconfirm, message, Spin, Empty, Alert } from 'antd';
import {
  MoreVertical,
  Eye,
  Pencil,
  PowerOff,
  CheckCircle,
  Warehouse,
  Trash2
} from 'lucide-react';
import useMedicineStore from '../../../stores/useMedicineStore';

const MedicineTable = () => {
  const { medicines, loading, error, total, params, setParams, fetchMedicines, deleteMedicine, updateMedicine } = useMedicineStore();

  const handleDelete = async (record) => {
    const res = await deleteMedicine(record._id || record.id);
    if (res.success) {
      message.success(`Đã xóa thuốc ${record.code}`);
    } else {
      message.error(res.message || 'Xóa thất bại');
    }
  };

  const handleToggleStatus = async (record) => {
    const newStatus = record.status === 'active' ? 'inactive' : 'active';
    const res = await updateMedicine(record._id || record.id, { status: newStatus });
    if (res.success) {
      const action = newStatus === 'active' ? 'kích hoạt' : 'ngừng bán';
      message.success(`Đã ${action} thuốc ${record.code}`);
    } else {
      message.error(res.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handlePageChange = (page, pageSize) => {
    setParams({ page, limit: pageSize });
    fetchMedicines({ page, limit: pageSize });
  };

  if (error) {
    return (
      <Alert
        type="error"
        message="Lỗi tải dữ liệu"
        description={error}
        className="mb-4"
        action={
          <Button size="small" onClick={() => fetchMedicines()}>
            Thử lại
          </Button>
        }
      />
    );
  }

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
          <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
            {record.ingredients || record.genericName || ''}
          </span>
          <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">{record.manufacturer || ''}</span>
        </div>
      ),
    },
    {
      title: 'Nhóm',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag className="bg-[var(--color-bg-subtle)] border-[var(--color-primary-border)] text-[var(--color-primary-text)] rounded-[var(--radius-sm)]">
          {category?.name || category || '—'}
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
            onClick={(e) => {
              e.stopPropagation();
              message.info(`Lịch sử kho của ${record.code}`);
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-medium" style={{ color: color }}>
              {stock ?? 0} {record.unit || ''}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Giá bán',
      dataIndex: 'sellPrice',
      key: 'sellPrice',
      render: (price, record) => (
        <span className="font-semibold text-[var(--color-text-primary)]">
          {(price || 0).toLocaleString('vi-VN')}đ / {record.unit?.name || record.unit || 'Viên'}
        </span>
      ),
    },
    {
      title: 'Đặc tính',
      key: 'attributes',
      render: (_, record) => {
        const attrs = [];
        if (record.requiresPrescription) attrs.push('Kê đơn');
        if (record.isAntibiotic) attrs.push('KS');
        if (record.isNarcotic) attrs.push('GN');
        if (attrs.length === 0) attrs.push('OTC');
        return (
          <div className="flex gap-1 flex-wrap">
            {attrs.map((attr) => (
              <Tag key={attr} className="m-0 border-[var(--color-border)] text-[var(--color-text-secondary)] text-[var(--font-size-xs)]">
                {attr}
              </Tag>
            ))}
          </div>
        );
      },
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
        const menuItems = [
          {
            key: 'view',
            label: 'Xem chi tiết',
            icon: <Eye size={16} />,
          },
          {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Pencil size={16} />,
          },
          {
            key: 'toggle',
            label: record.status === 'active' ? 'Ngừng bán' : 'Kích hoạt',
            icon: record.status === 'active' ? <PowerOff size={16} /> : <CheckCircle size={16} />,
            onClick: () => handleToggleStatus(record),
          },
          {
            key: 'inventory',
            label: 'Xem tồn kho',
            icon: <Warehouse size={16} />,
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            danger: true,
            icon: <Trash2 size={16} />,
            label: (
              <Popconfirm
                title="Bạn có chắc muốn xóa thuốc này không?"
                onConfirm={() => handleDelete(record)}
                okText="Xóa"
                cancelText="Hủy"
                onPopupClick={(e) => e.stopPropagation()}
              >
                <span className="block w-full">Xóa thuốc</span>
              </Popconfirm>
            ),
          },
        ];

        return (
          <Dropdown
            menu={{
              items: menuItems,
              onClick: ({ domEvent }) => domEvent.stopPropagation()
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              className="flex items-center justify-center rounded-full w-8 h-8 hover:bg-[var(--color-bg-subtle)]"
              icon={<MoreVertical size={18} className="text-[var(--color-text-secondary)]" />}
              onClick={(e) => e.stopPropagation()}
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
        dataSource={medicines}
        rowKey={(record) => record._id || record.id}
        loading={{ spinning: loading, indicator: <Spin size="large" /> }}
        locale={{ emptyText: <Empty description="Chưa có dữ liệu thuốc" /> }}
        pagination={{
          total,
          current: params.page,
          pageSize: params.limit,
          showSizeChanger: true,
          showTotal: (t, range) => `${range[0]}-${range[1]} / ${t} thuốc`,
          onChange: handlePageChange,
          className: 'px-6 py-4 border-t border-[var(--color-border-light)]',
          position: ['bottomRight'],
        }}
        className="medicine-table"
        onRow={(record) => ({
          className: 'hover:bg-[var(--color-bg-app)] transition-colors cursor-pointer',
          onClick: () => {
            console.log('Row clicked:', record._id || record.id);
          },
        })}
      />
    </div>
  );
};

export default MedicineTable;
