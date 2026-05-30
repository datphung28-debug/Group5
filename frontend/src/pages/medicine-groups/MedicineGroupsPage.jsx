import { useState, useEffect, useMemo } from 'react';
import { Alert, Button, Empty, Modal, Spin, message, Tabs, Table, Tag, Space, Input, Select, Tooltip, Form } from 'antd';
import { Plus, Pencil, Trash2, MapPin, Tags } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import useCategoryStore from '../../stores/useCategoryStore';
import useMedicineStore from '../../stores/useMedicineStore';
import SummaryCards from './components/SummaryCards';
import CategoryCard from './components/CategoryCard';
import CategoryModal from './components/CategoryModal';

// System hard-coded standard default zones A to E
const defaultZones = [
  { code: 'A', name: 'Kháng sinh', storageType: 'room_temp', notes: 'Kháng sinh kê đơn và không kê đơn', isDefault: true },
  { code: 'B', name: 'Giảm đau & Hô hấp', storageType: 'room_temp', notes: 'Thuốc hạ sốt, giảm đau, ho', isDefault: true },
  { code: 'C', name: 'Tiêu hóa & Da liễu', storageType: 'room_temp', notes: 'Thuốc tiêu hóa, bôi ngoài da', isDefault: true },
  { code: 'D', name: 'Vitamin & Khoáng chất', storageType: 'cool', notes: 'Vitamin và thực phẩm bổ sung', isDefault: true },
  { code: 'E', name: 'Tim mạch & Thần kinh', storageType: 'cool', notes: 'Thuốc tim mạch, huyết áp, thần kinh', isDefault: true },
];

// Inline Tab component to manage Warehouse Zones
const WarehouseZonesTab = () => {
  const { medicines, fetchMedicines } = useMedicineStore();

  useEffect(() => {
    // Load medicines to count active shelf items
    fetchMedicines({ limit: 1000 });
  }, [fetchMedicines]);

  // Load custom zones configured by user
  const [customZones, setCustomZones] = useState(() => {
    const saved = localStorage.getItem('gpp_custom_zones');
    return saved ? JSON.parse(saved) : [];
  });

  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneForm] = Form.useForm();

  // Calculate live count of medicines stored in each warehouse zone
  const zoneCounts = useMemo(() => {
    const counts = {};
    if (Array.isArray(medicines)) {
      medicines.forEach(m => {
        const z = m.location?.zone;
        if (z) {
          counts[z] = (counts[z] || 0) + 1;
        }
      });
    }
    return counts;
  }, [medicines]);

  // Merge default and user custom zones into a single dataset
  const allZones = useMemo(() => {
    return [...defaultZones, ...customZones.map(z => ({ ...z, isDefault: false }))];
  }, [customZones]);

  const handleOpenAdd = () => {
    setEditingZone(null);
    zoneForm.resetFields();
    setIsZoneModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingZone(record);
    zoneForm.setFieldsValue(record);
    setIsZoneModalOpen(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa khu vực "${record.code} — ${record.name}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: () => {
        const nextCustom = customZones.filter(z => z.code !== record.code);
        setCustomZones(nextCustom);
        localStorage.setItem('gpp_custom_zones', JSON.stringify(nextCustom));
        message.success('Đã xóa khu vực lưu kho');
      }
    });
  };

  const handleSave = async () => {
    try {
      const values = await zoneForm.validateFields();
      const code = values.code.trim().toUpperCase();
      
      if (!editingZone) {
        // Create new dynamic zone
        if (allZones.some(z => z.code === code)) {
          message.error('Mã khu vực này đã tồn tại!');
          return;
        }
        const newZone = {
          code,
          name: values.name.trim(),
          storageType: values.storageType,
          notes: values.notes?.trim() || '',
        };
        const nextCustom = [...customZones, newZone];
        setCustomZones(nextCustom);
        localStorage.setItem('gpp_custom_zones', JSON.stringify(nextCustom));
        message.success('Đã thêm khu vực mới');
      } else {
        // Update existing zone parameters
        const nextCustom = customZones.map(z => {
          if (z.code === editingZone.code) {
            return {
              ...z,
              name: values.name.trim(),
              storageType: values.storageType,
              notes: values.notes?.trim() || '',
            };
          }
          return z;
        });
        setCustomZones(nextCustom);
        localStorage.setItem('gpp_custom_zones', JSON.stringify(nextCustom));
        message.success('Đã cập nhật thông tin khu vực');
      }
      setIsZoneModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      title: 'Mã khu vực',
      dataIndex: 'code',
      key: 'code',
      render: (code) => {
        let tagColor = 'blue';
        if (code === 'A') tagColor = 'blue';
        else if (code === 'B') tagColor = 'green';
        else if (code === 'C') tagColor = 'orange';
        else if (code === 'D') tagColor = 'purple';
        else if (code === 'E') tagColor = 'red';
        else tagColor = 'cyan';
        return <Tag color={tagColor} className="font-bold px-3 py-0.5 text-sm rounded-[var(--radius-sm)]">Khu {code}</Tag>;
      },
      width: 140,
    },
    {
      title: 'Tên khu vực',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span className="font-semibold text-slate-800">
          {text} 
          {record.isDefault && (
            <Tag className="ml-2 bg-slate-100 text-slate-500 border-none text-[10px] font-bold uppercase rounded">
              Mặc định
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: 'Điều kiện bảo quản',
      dataIndex: 'storageType',
      key: 'storageType',
      render: (type) => {
        if (type === 'cool') return <Tag color="cyan">Mát (8-15°C)</Tag>;
        if (type === 'cold') return <Tag color="blue">Lạnh (2-8°C)</Tag>;
        if (type === 'freezer') return <Tag color="geekblue">Đông lạnh (&lt; 0°C)</Tag>;
        return <Tag color="gold">Thường (15-30°C)</Tag>;
      },
      width: 180,
    },
    {
      title: 'Mô tả / Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (text) => <span className="text-slate-500 text-sm">{text || '—'}</span>,
    },
    {
      title: 'Số thuốc lưu trữ',
      key: 'count',
      render: (_, record) => {
        const count = zoneCounts[record.code] || 0;
        return (
          <span className={`font-bold ${count > 0 ? 'text-[var(--color-primary)]' : 'text-slate-400'}`}>
            {count} sản phẩm
          </span>
        );
      },
      width: 150,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {!record.isDefault ? (
            <>
              <Button 
                type="text" 
                icon={<Pencil size={15} />} 
                onClick={() => handleOpenEdit(record)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex items-center justify-center rounded-full w-8 h-8"
              />
              <Button 
                type="text" 
                danger 
                icon={<Trash2 size={15} />} 
                onClick={() => handleDelete(record)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 flex items-center justify-center rounded-full w-8 h-8"
              />
            </>
          ) : (
            <Tooltip title="Không thể chỉnh sửa hoặc xóa khu vực mặc định của hệ thống">
              <Button 
                type="text" 
                disabled
                icon={<Pencil size={15} />} 
                className="text-slate-300 flex items-center justify-center rounded-full w-8 h-8"
              />
              <Button 
                type="text" 
                disabled
                icon={<Trash2 size={15} />} 
                className="text-slate-300 flex items-center justify-center rounded-full w-8 h-8"
              />
            </Tooltip>
          )}
        </Space>
      ),
      width: 120,
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 m-0">Danh sách Khu vực</h3>
          <p className="text-xs text-slate-500 m-0 mt-1">Cấu hình vị trí tủ thuốc, quầy kệ vật lý tại nhà thuốc</p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} className="inline mr-1" />}
          onClick={handleOpenAdd}
          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 border-none rounded-[var(--radius-md)] font-medium h-9 px-4 shadow-sm"
        >
          Thêm khu vực
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={allZones} 
        rowKey="code" 
        pagination={false}
        className="gpp-zones-table"
      />

      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <MapPin size={20} className="text-emerald-600" />
            <span>{editingZone ? 'Chỉnh sửa khu vực lưu trữ' : 'Thêm khu vực lưu trữ mới'}</span>
          </div>
        }
        open={isZoneModalOpen}
        onOk={handleSave}
        onCancel={() => setIsZoneModalOpen(false)}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
        okButtonProps={{ className: "bg-emerald-600 border-none" }}
        centered
        width={500}
      >
        <Form form={zoneForm} layout="vertical" className="mt-4">
          <Form.Item 
            name="code" 
            label="Mã khu vực" 
            rules={[
              { required: true, message: 'Vui lòng nhập mã khu vực (ví dụ: F)' },
              { pattern: /^[a-zA-Z0-9]+$/, message: 'Mã khu vực chỉ chứa chữ cái hoặc chữ số' }
            ]}
          >
            <Input 
              placeholder="VD: F" 
              maxLength={3} 
              disabled={Boolean(editingZone)} 
              className="rounded-[var(--radius-sm)] uppercase"
            />
          </Form.Item>
          <Form.Item 
            name="name" 
            label="Tên khu vực" 
            rules={[{ required: true, message: 'Vui lòng nhập tên khu vực (ví dụ: Thuốc đông y)' }]}
          >
            <Input placeholder="VD: Thuốc Đông Y" className="rounded-[var(--radius-sm)]" />
          </Form.Item>
          <Form.Item 
            name="storageType" 
            label="Điều kiện bảo quản" 
            initialValue="room_temp"
          >
            <Select className="rounded-[var(--radius-sm)]">
              <Select.Option value="room_temp">Nhiệt độ thường (15-30°C)</Select.Option>
              <Select.Option value="cool">Mát (8-15°C)</Select.Option>
              <Select.Option value="cold">Lạnh (2-8°C)</Select.Option>
              <Select.Option value="freezer">Đông lạnh (&lt; 0°C)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú mô tả">
            <Input.TextArea placeholder="Nhập ghi chú thêm..." rows={3} className="rounded-[var(--radius-sm)]" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default function MedicineGroupsPage() {
  const { categories, loading, error, fetchCategories, getSummary, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const summary = getSummary();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Fetch categories từ API khi component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = (category) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa nhóm thuốc "${category.name}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        const result = await deleteCategory(category._id || category.id);
        if (result.success) {
          message.success('Đã xóa nhóm thuốc');
        } else {
          message.error(result.message || 'Không thể xóa nhóm thuốc');
        }
      },
    });
  };

  const handleSave = async (values) => {
    let result;
    if (editingCategory) {
      result = await updateCategory(editingCategory._id || editingCategory.id, values);
    } else {
      result = await addCategory(values);
    }

    if (result.success) {
      message.success(editingCategory ? 'Đã cập nhật nhóm thuốc' : 'Đã thêm nhóm thuốc mới');
      setModalOpen(false);
    } else {
      message.error(result.message || 'Không thể lưu nhóm thuốc');
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Danh mục & Cấu hình"
        subtitle="Quản lý các phân loại danh mục, tủ kệ và vị trí lưu trữ thuốc"
      />

      <Tabs
        defaultActiveKey="groups"
        className="mt-6 gpp-config-tabs"
        items={[
          {
            key: 'groups',
            label: (
              <span className="flex items-center gap-2 font-semibold text-[15px] pb-1">
                <Tags size={16} />
                Nhóm thuốc
              </span>
            ),
            children: (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 m-0">Phân loại Nhóm thuốc</h3>
                    <p className="text-xs text-slate-500 m-0 mt-1">Cấu hình danh mục nhóm thuốc hỗ trợ tìm kiếm và báo cáo doanh thu</p>
                  </div>
                  <Button
                    type="primary"
                    icon={<Plus size={18} />}
                    className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none"
                    onClick={handleAdd}
                  >
                    Thêm nhóm thuốc
                  </Button>
                </div>

                <SummaryCards 
                  total={summary.total} 
                  totalMedicines={summary.totalMedicines} 
                  emptyCount={summary.emptyCount} 
                />

                {error && (
                  <Alert type="error" showIcon message={error} className="mb-4 rounded-[var(--radius-md)]" />
                )}

                {loading ? (
                  <div className="flex min-h-[240px] items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white">
                    <Spin />
                  </div>
                ) : categories.length === 0 ? (
                  <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] bg-white p-8">
                    <Empty description="Chưa có nhóm thuốc" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category, index) => (
                      <CategoryCard
                        key={category._id || category.id}
                        category={category}
                        index={index}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'zones',
            label: (
              <span className="flex items-center gap-2 font-semibold text-[15px] pb-1">
                <MapPin size={16} />
                Khu vực lưu kho
              </span>
            ),
            children: <WarehouseZonesTab />
          }
        ]}
      />

      <CategoryModal
        open={modalOpen}
        category={editingCategory}
        onCancel={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
