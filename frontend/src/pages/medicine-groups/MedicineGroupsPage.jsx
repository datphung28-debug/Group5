import { useState, useEffect } from 'react';
import { Alert, Button, Empty, Modal, Spin, message } from 'antd';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import useCategoryStore from '../../stores/useCategoryStore';
import SummaryCards from './components/SummaryCards';
import CategoryCard from './components/CategoryCard';
import CategoryModal from './components/CategoryModal';

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
        title="Nhóm thuốc"
        subtitle="Quản lý phân loại danh mục thuốc trong nhà thuốc"
        actions={
          <Button
            type="primary"
            icon={<Plus size={18} />}
            className="flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none"
            onClick={handleAdd}
          >
            Thêm nhóm thuốc
          </Button>
        }
      />

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

      <CategoryModal
        open={modalOpen}
        category={editingCategory}
        onCancel={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
