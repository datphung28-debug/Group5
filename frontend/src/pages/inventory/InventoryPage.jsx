import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Space } from 'antd';
import { AlertCircle, PackageSearch, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import KPICards from './components/KPICards';
import InventoryFilter from './components/InventoryFilter';
import InventoryTable from './components/InventoryTable';
import { medicineAPI } from '../../api/api';
import { getInventorySummary, mapMedicineToInventoryRow } from './inventoryUtils';

const InventoryPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', lowStock: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInventory = useCallback(async (nextFilters) => {
    setLoading(true);
    setError('');

    try {
      const params = {
        limit: 200,
        search: nextFilters.search || undefined,
        category: nextFilters.category || undefined,
        lowStock: nextFilters.lowStock || undefined,
      };
      const response = await medicineAPI.getAll(params);
      const medicines = response.data?.medicines || response.data?.data || response.data || [];
      setRows((Array.isArray(medicines) ? medicines : []).map(mapMedicineToInventoryRow));
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu tồn kho');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInventory({ search: '', category: '', lowStock: '' });
  }, [fetchInventory]);

  const summary = useMemo(() => getInventorySummary(rows), [rows]);

  const categoryOptions = useMemo(() => {
    const categoryMap = new Map();
    rows.forEach((row) => {
      if (row.categoryId && row.category) {
        categoryMap.set(row.categoryId, row.category);
      }
    });

    return Array.from(categoryMap, ([value, label]) => ({ value, label }));
  }, [rows]);

  const handleFilter = (nextFilters) => {
    setFilters(nextFilters);
    fetchInventory(nextFilters);
  };

  const handleReset = () => {
    const resetFilters = { search: '', category: '', lowStock: '' };
    setFilters(resetFilters);
    fetchInventory(resetFilters);
  };

  return (
    <div className="p-6 min-h-screen bg-[var(--color-bg-app)]">
      <PageHeader
        title="Tồn kho"
        subtitle="Theo dõi và quản lý hàng tồn kho"
        actions={
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
              onClick={() => handleFilter({ ...filters, lowStock: 'true' })}
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
        }
      />

      {/* KPI Summary */}
      <KPICards summary={summary} />

      {/* Filter Bar */}
      <InventoryFilter
        filters={filters}
        categoryOptions={categoryOptions}
        onFilter={handleFilter}
        onReset={handleReset}
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải dữ liệu tồn kho"
          description={error}
          className="mb-4 rounded-[var(--radius-md)]"
          action={
            <Button size="small" onClick={() => fetchInventory(filters)}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* Inventory Table */}
      <InventoryTable rows={rows} loading={loading} />
    </div>
  );
};

export default InventoryPage;
