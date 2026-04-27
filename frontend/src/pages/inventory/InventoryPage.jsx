import React from 'react';
import { Button, Space } from 'antd';
import { AlertCircle, PackageSearch, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KPICards from './components/KPICards';
import InventoryFilter from './components/InventoryFilter';
import InventoryTable from './components/InventoryTable';

const InventoryPage = () => {
  const navigate = useNavigate();
  const handleFilter = () => {
    console.log('Filtering inventory...');
  };

  const handleReset = () => {
    console.log('Resetting inventory filters...');
  };

  return (
    <div className="p-6 min-h-screen bg-[var(--color-bg-app)]">
      {/* Page Actions */}
      <div className="flex justify-end mb-6">
        <Space size={12}>
          <Button 
            icon={<AlertCircle size={18} className="mr-2 inline text-[var(--color-debt)]" />}
            className="flex items-center h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-debt)] hover:text-[var(--color-debt)]"
            onClick={() => navigate('/inventory/expiry')}
          >
            Sắp hết hạn
          </Button>
          <Button 
            icon={<PackageSearch size={18} className="mr-2 inline text-[var(--color-warning)]" />}
            className="flex items-center h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-warning)] hover:text-[var(--color-warning)]"
          >
            Sắp hết tồn
          </Button>
          <Button 
            type="primary" 
            icon={<Settings2 size={18} className="mr-2 inline" />}
            className="flex items-center h-10 px-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none rounded-[var(--radius-md)] font-medium shadow-[var(--shadow-card)]"
          >
            Điều chỉnh kho
          </Button>
        </Space>
      </div>

      {/* KPI Summary */}
      <KPICards />

      {/* Filter Bar */}
      <InventoryFilter onFilter={handleFilter} onReset={handleReset} />

      {/* Inventory Table */}
      <InventoryTable />
    </div>
  );
};

export default InventoryPage;
