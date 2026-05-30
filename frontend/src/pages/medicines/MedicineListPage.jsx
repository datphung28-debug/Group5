import React, { useEffect } from 'react';
import { Button } from 'antd';
import { Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import FilterBar from './components/FilterBar';
import MedicineTable from './components/MedicineTable';
import useMedicineStore from '../../stores/useMedicineStore';

const MedicineListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchMedicines, setParams, total, loading } = useMedicineStore();

  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('group') || '';

  // Fetch when component mounts or when URL query parameter changes
  useEffect(() => {
    const paramsPayload = { page: 1 };
    if (initialCategory) {
      paramsPayload.category = initialCategory;
    } else {
      paramsPayload.category = '';
    }
    setParams(paramsPayload);
    fetchMedicines(paramsPayload);
  }, [initialCategory, fetchMedicines, setParams]);

  const handleFilter = (values) => {
    setParams({ ...values, page: 1 });
    fetchMedicines({ ...values, page: 1 });
  };

  const handleReset = () => {
    const reset = { search: '', category: '', requiresPrescription: '', lowStock: '' };
    setParams({ ...reset, page: 1 });
    fetchMedicines({ ...reset, page: 1 });
    // Clear URL query parameters
    navigate('/medicines', { replace: true });
  };

  return (
    <div className="p-6 min-h-screen bg-[var(--color-bg-app)]">
      <PageHeader
        title="Danh mục thuốc"
        subtitle="Quản lý danh sách thuốc trong hệ thống"
        actions={
          <Button
            type="primary"
            icon={<Plus size={18} className="mr-2 inline" />}
            className="flex items-center h-10 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] font-medium shadow-[var(--shadow-card)]"
            onClick={() => navigate('/medicines/add')}
          >
            Thêm thuốc mới
          </Button>
        }
      />

      {/* Filter Bar */}
      <FilterBar onFilter={handleFilter} onReset={handleReset} initialCategory={initialCategory} />

      {/* Summary info */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
          Tổng: <span className="font-semibold text-[var(--color-primary)]">{total.toLocaleString('vi-VN')}</span> loại thuốc
        </span>
        {loading && (
          <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)] animate-pulse">
            Đang tải...
          </span>
        )}
      </div>

      {/* Table */}
      <MedicineTable />
    </div>
  );
};

export default MedicineListPage;
