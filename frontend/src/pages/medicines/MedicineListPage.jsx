import React from 'react';
import { Button } from 'antd';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FilterBar from './components/FilterBar';
import MedicineTable from './components/MedicineTable';

const MedicineListPage = () => {
  const navigate = useNavigate();
  const handleFilter = () => {
    console.log('Filtering...');
  };

  const handleReset = () => {
    console.log('Resetting...');
  };

  return (
    <div className="p-6 min-h-screen bg-[var(--color-bg-app)]">
      {/* Action Header */}
      <div className="flex justify-end mb-6">
        <Button 
          type="primary" 
          icon={<Plus size={18} className="mr-2 inline" />}
          className="flex items-center h-10 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] font-medium shadow-[var(--shadow-card)]"
          onClick={() => navigate('/medicines/add')}
        >
          Thêm thuốc mới
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar onFilter={handleFilter} onReset={handleReset} />

      {/* Summary info */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)]">
          Tổng: <span className="font-semibold text-[var(--color-primary)]">1,248</span> loại thuốc
        </span>
        <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Hiển thị 1 - 10 trong 1,248
        </span>
      </div>

      {/* Table */}
      <MedicineTable />
    </div>
  );
};

export default MedicineListPage;
