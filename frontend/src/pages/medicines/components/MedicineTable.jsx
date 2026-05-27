import React from 'react';
import { Table, Tag, Badge, Button, Dropdown, Popconfirm, message, Spin, Empty, Alert } from 'antd';
import {
  MoreVertical,
  Eye,
  Pencil,
  Warehouse,
  Trash2,
  MapPin
} from 'lucide-react';
import useMedicineStore from '../../../stores/useMedicineStore';
import { Form, Input, Select, InputNumber, Modal as AntModal } from 'antd';

const MedicineTable = () => {
  const { medicines, loading, error, total, params, setParams, fetchMedicines, deleteMedicine, updateMedicine } = useMedicineStore();
  
  // State quản lý Modal cập nhật vị trí
  const [isLocModalVisible, setIsLocModalVisible] = React.useState(false);
  const [isPriceModalVisible, setIsPriceModalVisible] = React.useState(false);
  const [editingMedicine, setEditingMedicine] = React.useState(null);
  const [locForm] = Form.useForm();
  const [priceForm] = Form.useForm();

  const handleDelete = async (record) => {
    const res = await deleteMedicine(record._id || record.id);
    if (res.success) {
      message.success(`Đã xóa thuốc ${record.code}`);
    } else {
      message.error(res.message || 'Xóa thất bại');
    }
  };

  const handlePageChange = (page, pageSize) => {
    setParams({ page, limit: pageSize });
    fetchMedicines({ page, limit: pageSize });
  };

  const handleOpenPriceModal = (record) => {
    setEditingMedicine(record);
    priceForm.setFieldsValue({
      importPrice: Number(record.importPrice || 0),
      sellPrice: Number(record.sellPrice || 0),
      minStock: Number(record.minStock || 0),
    });
    setIsPriceModalVisible(true);
  };

  const handleSavePrice = async () => {
    try {
      const values = await priceForm.validateFields();
      const res = await updateMedicine(editingMedicine._id || editingMedicine.id, values);
      if (res.success) {
        message.success(`Đã cập nhật giá bán thuốc ${editingMedicine.code}`);
        setIsPriceModalVisible(false);
        return;
      }

      message.error(res.message || 'Cập nhật giá bán thất bại');
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenLocationModal = (record) => {
    setEditingMedicine(record);
    const loc = record.location || {};
    locForm.setFieldsValue({
      storageType: loc.storageType || 'room_temp',
      zone: loc.zone || 'A',
      shelf: loc.shelf || 1,
      row: loc.row || 1,
      column: loc.column || 1,
    });
    setIsLocModalVisible(true);
  };

  const handleSaveLocation = async () => {
    try {
      const values = await locForm.validateFields();
      values.label = `${values.zone}-${String(values.shelf).padStart(2,'0')}-${values.row}-${values.column}`;
      
      const res = await updateMedicine(editingMedicine._id || editingMedicine.id, { location: values });
      if (res.success) {
        message.success(`Đã cập nhật vị trí kho cho thuốc ${editingMedicine.name}`);
        setIsLocModalVisible(false);
      } else {
        message.error('Lỗi khi cập nhật vị trí');
      }
    } catch (err) {
      console.error(err);
    }
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
          {typeof category === 'object' ? (category?.name || '—') : (category || '—')}
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
        } else if (stock <= Number(record.minStock || 0)) {
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
              {stock ?? 0} {typeof record.unit === 'object' ? (record.unit?.name || '') : (record.unit || '')}
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
      title: 'Vị trí kho',
      dataIndex: 'location',
      key: 'location',
      render: (loc) => {
        if (!loc || !loc.zone) return <span className="text-[11px] text-slate-400 italic">Chưa xếp kho</span>;
        return (
          <div className="flex flex-col">
            <Tag className="w-max mb-1 border-blue-200 bg-blue-50 text-blue-700 m-0 font-semibold">
              Khu {loc.zone}
            </Tag>
            <span className="text-[10px] text-slate-500">
              Kệ {loc.shelf} - Hàng {loc.row}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === false ? 'default' : 'success'}
          text={status === false ? 'Ngừng bán' : 'Đang bán'}
          className={status === false ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-profit)]'}
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
            onClick: () => handleOpenPriceModal(record),
          },
          {
            key: 'update_loc',
            label: 'Cập nhật vị trí',
            icon: <MapPin size={16} />,
            onClick: () => handleOpenLocationModal(record),
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
        onRow={() => ({
          className: 'hover:bg-[var(--color-bg-app)] transition-colors cursor-pointer',
        })}
      />

      <AntModal
        title={
          <div className="flex items-center gap-2 text-teal-700">
            <MapPin size={20} />
            <span>Xếp vị trí thuốc vào kho</span>
          </div>
        }
        open={isLocModalVisible}
        onOk={handleSaveLocation}
        onCancel={() => setIsLocModalVisible(false)}
        okText="Lưu vị trí"
        cancelText="Hủy bỏ"
        okButtonProps={{ className: "bg-teal-600 border-none" }}
      >
        {editingMedicine && (
          <div className="mb-4 text-sm text-slate-500">
            Đang xếp vị trí cho thuốc: <strong className="text-slate-800">{editingMedicine.name}</strong>
          </div>
        )}
        <Form form={locForm} layout="vertical" className="grid grid-cols-2 gap-x-4">
          <Form.Item name="storageType" label="Điều kiện bảo quản" className="col-span-2">
            <Select>
              <Select.Option value="room_temp">Nhiệt độ thường (15-30°C)</Select.Option>
              <Select.Option value="cool">Mát (8-15°C)</Select.Option>
              <Select.Option value="cold">Lạnh (2-8°C)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="zone" label="Khu vực (Zone)">
            <Select>
              <Select.Option value="A">Khu A (Kháng sinh)</Select.Option>
              <Select.Option value="B">Khu B (Giảm đau/Hô hấp)</Select.Option>
              <Select.Option value="C">Khu C (Tiêu hóa/Da liễu)</Select.Option>
              <Select.Option value="D">Khu D (Vitamin)</Select.Option>
              <Select.Option value="E">Khu E (Tim mạch/Thần kinh)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="shelf" label="Kệ số">
            <InputNumber min={1} max={10} className="w-full" />
          </Form.Item>
          <Form.Item name="row" label="Hàng (Tầng) số">
            <InputNumber min={1} max={10} className="w-full" />
          </Form.Item>
          <Form.Item name="column" label="Ô số">
            <InputNumber min={1} max={10} className="w-full" />
          </Form.Item>
        </Form>
      </AntModal>

      <AntModal
        title={
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <Pencil size={20} />
            <span>Chỉnh sửa giá thuốc</span>
          </div>
        }
        open={isPriceModalVisible}
        onOk={handleSavePrice}
        onCancel={() => setIsPriceModalVisible(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy bỏ"
        okButtonProps={{ className: "bg-[var(--color-primary)] border-none" }}
      >
        {editingMedicine && (
          <div className="mb-4 text-sm text-[var(--color-text-secondary)]">
            Thuốc: <strong className="text-[var(--color-text-primary)]">{editingMedicine.name}</strong>
          </div>
        )}
        <Form form={priceForm} layout="vertical">
          <Form.Item name="importPrice" label="Giá nhập" rules={[{ type: 'number', min: 0, message: 'Giá nhập không được âm' }]}>
            <InputNumber
              min={0}
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/,/g, '')}
              addonAfter="đ"
            />
          </Form.Item>
          <Form.Item
            name="sellPrice"
            label="Giá bán"
            rules={[
              { required: true, message: 'Vui lòng nhập giá bán' },
              { type: 'number', min: 1, message: 'Giá bán phải lớn hơn 0' },
            ]}
          >
            <InputNumber
              min={1}
              className="w-full"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/,/g, '')}
              addonAfter="đ"
            />
          </Form.Item>
          <Form.Item name="minStock" label="Tồn kho tối thiểu" rules={[{ type: 'number', min: 0, message: 'Tồn tối thiểu không được âm' }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </Form>
      </AntModal>
    </div>
  );
};

export default MedicineTable;
