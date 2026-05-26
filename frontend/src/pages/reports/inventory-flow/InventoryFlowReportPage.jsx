import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Space, message } from 'antd';
import dayjs from 'dayjs';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import PageHeader from '../../../components/PageHeader';
import { importAPI, medicineAPI, saleAPI } from '../../../api/api';
import InventoryFlowFilter from './components/InventoryFlowFilter';
import InventoryFlowKPIs from './components/InventoryFlowKPIs';
import InventoryFlowTable from './components/InventoryFlowTable';

const getId = (value) => {
  if (!value) return '';
  if (typeof value === 'object') return value._id || value.id || '';
  return value;
};

const getName = (value, fallback = '') => {
  if (!value) return fallback;
  if (typeof value === 'object') return value.name || fallback;
  return value;
};

const getPeriodRange = (period) => {
  const now = dayjs();
  if (period === 'today') return [now.startOf('day'), now.endOf('day')];
  if (period === '7days') return [now.subtract(6, 'day').startOf('day'), now.endOf('day')];
  if (period === 'quarter') {
    const quarterStartMonth = Math.floor(now.month() / 3) * 3;
    const quarterStart = now.month(quarterStartMonth).startOf('month');
    return [quarterStart, quarterStart.add(2, 'month').endOf('month')];
  }
  return [now.startOf('month'), now.endOf('month')];
};

const initialRange = getPeriodRange('month');

const buildMovementMap = (documents, dateField) => {
  const map = new Map();

  documents.forEach((document) => {
    const documentDate = document[dateField] || document.createdAt;
    if (!documentDate) return;

    document.items?.forEach((item) => {
      const medicineId = getId(item.medicine);
      if (!medicineId) return;
      map.set(medicineId, (map.get(medicineId) || 0) + Number(item.quantity || 0));
    });
  });

  return map;
};

const InventoryFlowReportPage = () => {
  const [filters, setFilters] = useState({
    period: 'month',
    range: initialRange,
    search: '',
    category: 'all',
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  const categories = useMemo(() => {
    const unique = new Set(rows.map((row) => row.category).filter(Boolean));
    return Array.from(unique);
  }, [rows]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [fromDate, toDate] = filters.range || getPeriodRange(filters.period);
      const params = {
        startDate: fromDate.startOf('day').toISOString(),
        endDate: toDate.endOf('day').toISOString(),
        limit: 1000,
      };

      const [medicineRes, importRes, saleRes] = await Promise.all([
        medicineAPI.getAll({ limit: 1000 }),
        importAPI.getAll(params),
        saleAPI.getAll(params),
      ]);

      const medicines = medicineRes.data?.medicines || medicineRes.data?.data || medicineRes.data || [];
      const imports = importRes.data?.imports || importRes.data?.data || importRes.data || [];
      const sales = saleRes.data?.sales || saleRes.data?.data || saleRes.data || [];

      const importMap = buildMovementMap(Array.isArray(imports) ? imports : [], 'importDate');
      const exportMap = buildMovementMap(
        (Array.isArray(sales) ? sales : []).filter((sale) => sale.status !== 'cancelled'),
        'createdAt'
      );

      const reportRows = (Array.isArray(medicines) ? medicines : []).map((medicine) => {
        const medicineId = getId(medicine._id || medicine.id);
        const imported = importMap.get(medicineId) || 0;
        const exported = exportMap.get(medicineId) || 0;
        const closingStock = Number(medicine.stock || 0);
        const openingStock = Math.max(0, closingStock - imported + exported);

        return {
          _id: medicineId,
          code: medicine.code,
          name: medicine.name,
          ingredients: medicine.ingredients,
          category: getName(medicine.category, 'Chưa phân nhóm'),
          unit: getName(medicine.unit, 'Đơn vị'),
          minStock: Number(medicine.minStock || 0),
          openingStock,
          imported,
          exported,
          closingStock,
          inventoryValue: closingStock * Number(medicine.importPrice || 0),
        };
      });

      setRows(reportRows);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải báo cáo nhập xuất tồn');
    } finally {
      setLoading(false);
    }
  }, [filters.period, filters.range]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchReport();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchReport]);

  const visibleRows = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesKeyword =
        !keyword ||
        row.code?.toLowerCase().includes(keyword) ||
        row.name?.toLowerCase().includes(keyword) ||
        row.ingredients?.toLowerCase().includes(keyword);
      const matchesCategory = filters.category === 'all' || row.category === filters.category;
      return matchesKeyword && matchesCategory;
    });
  }, [filters.category, filters.search, rows]);

  const summary = useMemo(() => {
    return visibleRows.reduce(
      (acc, row) => ({
        itemCount: acc.itemCount + 1,
        openingStock: acc.openingStock + row.openingStock,
        imported: acc.imported + row.imported,
        exported: acc.exported + row.exported,
        closingStock: acc.closingStock + row.closingStock,
        inventoryValue: acc.inventoryValue + row.inventoryValue,
      }),
      { itemCount: 0, openingStock: 0, imported: 0, exported: 0, closingStock: 0, inventoryValue: 0 }
    );
  }, [visibleRows]);

  const handleFilterChange = (nextFilters) => {
    setFilters((current) => {
      const next = { ...current, ...nextFilters };
      if (nextFilters.period && nextFilters.period !== 'custom') {
        next.range = getPeriodRange(nextFilters.period);
      }
      return next;
    });
  };

  const handleReset = () => {
    setFilters({
      period: 'month',
      range: getPeriodRange('month'),
      search: '',
      category: 'all',
    });
  };

  const handleExport = (type) => {
    messageApi.info(`Chức năng xuất ${type} sẽ dùng dữ liệu NXT đang hiển thị.`);
  };

  const exportActions = (
    <Space size={12} wrap>
      <Button
        icon={<FileSpreadsheet size={18} className="mr-2 inline" />}
        className="h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        onClick={() => handleExport('CSV')}
      >
        Xuất CSV
      </Button>
      <Button
        icon={<Download size={18} className="mr-2 inline" />}
        className="h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        onClick={() => handleExport('Excel')}
      >
        Xuất Excel
      </Button>
      <Button
        icon={<FileText size={18} className="mr-2 inline" />}
        className="h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        onClick={() => handleExport('PDF')}
      >
        Xuất PDF
      </Button>
    </Space>
  );

  return (
    <div className="p-6 min-h-screen bg-[var(--color-bg-app)]">
      {contextHolder}
      <PageHeader
        title="Báo cáo NXT"
        subtitle="Theo dõi tồn đầu, nhập, xuất và tồn cuối theo kỳ báo cáo"
        actions={exportActions}
      />

      <InventoryFlowFilter
        filters={filters}
        categories={categories}
        loading={loading}
        onChange={handleFilterChange}
        onApply={fetchReport}
        onReset={handleReset}
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          className="mb-6 rounded-[var(--radius-lg)] border-[var(--color-debt)]"
        />
      )}

      <InventoryFlowKPIs summary={summary} />
      <InventoryFlowTable data={visibleRows} loading={loading} />
    </div>
  );
};

export default InventoryFlowReportPage;
