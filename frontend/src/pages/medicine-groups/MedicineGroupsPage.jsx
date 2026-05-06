import { useState } from 'react';
import { Button, Modal, message } from 'antd';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import useCategoryStore from '../../stores/useCategoryStore';
import SummaryCards from './components/SummaryCards';
import CategoryCard from './components/CategoryCard';
import CategoryModal from './components/CategoryModal';

export default function MedicineGroupsPage() {
  const { categories, getSummary, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const summary = getSummary();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

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
      onOk: () => {
        deleteCategory(category.id);
        message.success('Đã xóa nhóm thuốc');
      },
    });
  };

  const handleSave = (values) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, values);
      message.success('Đã cập nhật nhóm thuốc');
    } else {
      addCategory(values);
      message.success('Đã thêm nhóm thuốc mới');
    }
    setModalOpen(false);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <CategoryModal
        open={modalOpen}
        category={editingCategory}
        onCancel={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
