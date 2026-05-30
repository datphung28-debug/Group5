import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Space, message } from 'antd';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import useSupplierStore from '../../../stores/useSupplierStore';
import DebtFilter from './components/DebtFilter';
import DebtKPIs from './components/DebtKPIs';
import DebtTable from './components/DebtTable';

const initialFilters = {
  type: 'all',
  search: '',
  status: 'all',
  risk: 'all',
};

const getRiskValue = (supplier) => {
  if (supplier.status === 'Quá hạn') return 'high';
  if (supplier.debtRatio >= 75) return 'medium';
  return 'low';
};

const DebtReportPage = () => {
  const suppliers = useSupplierStore((state) => state.suppliers);
  const loading = useSupplierStore((state) => state.loading);
  const error = useSupplierStore((state) => state.error);
  const fetchSuppliers = useSupplierStore((state) => state.fetchSuppliers);
  const [filters, setFilters] = useState(initialFilters);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const debtRows = useMemo(() => (
    suppliers.map((supplier) => ({
      ...supplier,
      debtRatio: supplier.debtLimit > 0 ? (supplier.currentDebt / supplier.debtLimit) * 100 : 0,
      availableLimit: Math.max(0, supplier.debtLimit - supplier.currentDebt),
    }))
  ), [suppliers]);

  const filteredRows = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return debtRows.filter((supplier) => {
      const matchesKeyword =
        !keyword ||
        supplier.name.toLowerCase().includes(keyword) ||
        supplier.code.toLowerCase().includes(keyword) ||
        supplier.phone.toLowerCase().includes(keyword) ||
        supplier.taxCode.toLowerCase().includes(keyword);
      const matchesStatus = filters.status === 'all' || supplier.status === filters.status;
      const matchesType =
        filters.type === 'all' ||
        (filters.type === 'supplier' && supplier.currentDebt > 0) ||
        (filters.type === 'overdue' && supplier.status === 'Quá hạn');
      const matchesRisk = filters.risk === 'all' || getRiskValue(supplier) === filters.risk;

      return matchesKeyword && matchesStatus && matchesType && matchesRisk;
    });
  }, [debtRows, filters]);

  const summary = useMemo(() => (
    debtRows.reduce(
      (acc, supplier) => ({
        totalDebt: acc.totalDebt + supplier.currentDebt,
        overdueDebt: acc.overdueDebt + (supplier.status === 'Quá hạn' ? supplier.currentDebt : 0),
        availableLimit: acc.availableLimit + supplier.availableLimit,
        debtorCount: acc.debtorCount + (supplier.currentDebt > 0 ? 1 : 0),
        overdueCount: acc.overdueCount + (supplier.status === 'Quá hạn' ? 1 : 0),
        fullyPaidCount: acc.fullyPaidCount + (supplier.currentDebt === 0 ? 1 : 0),
      }),
      { totalDebt: 0, overdueDebt: 0, availableLimit: 0, debtorCount: 0, overdueCount: 0, fullyPaidCount: 0 }
    )
  ), [debtRows]);

  const handleFilterChange = (nextFilters) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
  };

  const handleExport = (type) => {
    messageApi.info(`Chức năng xuất ${type} sẽ dùng danh sách công nợ đang hiển thị.`);
  };

  const exportActions = (
    <Space size={12} wrap>
      <Button
        icon={<FileSpreadsheet size={18} className="mr-2 inline" />}
        className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        onClick={() => handleExport('CSV')}
      >
        Xuất CSV
      </Button>
      <Button
        icon={<Download size={18} className="mr-2 inline" />}
        className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        onClick={() => handleExport('Excel')}
      >
        Xuất Excel
      </Button>
      <Button
        icon={<FileText size={18} className="mr-2 inline" />}
        className="h-10 rounded-[var(--radius-md)] border-[var(--color-border)] px-4 font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        onClick={() => handleExport('PDF')}
      >
        Xuất PDF
      </Button>
    </Space>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-6">
      {contextHolder}
      <PageHeader
        title="Báo cáo công nợ"
        subtitle="Theo dõi công nợ nhà cung cấp, hạn mức và trạng thái thanh toán"
        actions={exportActions}
      />

      <DebtFilter
        filters={filters}
        onChange={handleFilterChange}
        onReset={() => setFilters(initialFilters)}
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          className="mb-6 rounded-[var(--radius-lg)] border-[var(--color-debt)]"
        />
      )}

      <DebtKPIs summary={summary} />
      <DebtTable data={filteredRows} loading={loading} />
    </div>
  );
};

export default DebtReportPage;
