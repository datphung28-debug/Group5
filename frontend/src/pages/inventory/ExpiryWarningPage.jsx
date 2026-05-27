import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import SummaryCards from './components/SummaryCards';
import TimeFilter from './components/TimeFilter';
import ExpiryTable from './components/ExpiryTable';
import { medicineAPI } from '../../api/api';
import { getExpirySummary, mapMedicineToExpiryRow } from './expiryUtils';

const ExpiryWarningPage = () => {
  const navigate = useNavigate();
  const [activeRange, setActiveRange] = useState(30);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchExpiring = useCallback(async (range) => {
    setLoading(true);
    setError('');

    try {
      const res = await medicineAPI.getExpiring(range);
      const medicines = Array.isArray(res.data) ? res.data : [];
      setRows(medicines.map((medicine) => mapMedicineToExpiryRow(medicine)));
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || 'Không thể tải danh sách thuốc sắp hết hạn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchExpiring(activeRange);
  }, [activeRange, fetchExpiring]);

  const summary = useMemo(() => getExpirySummary(rows), [rows]);

  return (
    <div className="p-6 min-h-screen bg-[var(--color-bg-app)]">
      <PageHeader
        title="Cảnh báo hết hạn"
        subtitle="Danh sách thuốc sắp hết hạn sử dụng"
        actions={
          <Button
            icon={<ArrowLeft size={18} className="mr-2 inline" />}
            className="flex items-center h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
            onClick={() => navigate('/inventory')}
          >
            Quay lại kho
          </Button>
        }
      />

      {/* Summary Cards */}
      <SummaryCards
        emergencyCount={summary.emergencyCount}
        warningCount={summary.warningCount}
        trackingCount={summary.trackingCount}
      />

      {/* Time Filter */}
      <TimeFilter
        activeRange={activeRange}
        onRangeChange={setActiveRange}
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải cảnh báo hết hạn"
          description={error}
          className="mb-4 rounded-[var(--radius-md)]"
          action={
            <Button size="small" onClick={() => fetchExpiring(activeRange)}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* Expiry Table */}
      <ExpiryTable rows={rows} loading={loading} />
    </div>
  );
};

export default ExpiryWarningPage;
