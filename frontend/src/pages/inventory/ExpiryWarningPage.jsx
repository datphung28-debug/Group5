import React, { useState } from 'react';
import { Button } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SummaryCards from './components/SummaryCards';
import TimeFilter from './components/TimeFilter';
import ExpiryTable from './components/ExpiryTable';

const ExpiryWarningPage = () => {
  const navigate = useNavigate();
  const [activeRange, setActiveRange] = useState(30);

  return (
    <div className="p-6 min-h-screen bg-[var(--color-bg-app)]">
      {/* Top Action Bar */}
      <div className="flex justify-end mb-6">
        <Button 
          icon={<ArrowLeft size={18} className="mr-2 inline" />}
          className="flex items-center h-10 px-4 border-[var(--color-border)] rounded-[var(--radius-md)] font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
          onClick={() => navigate('/inventory')}
        >
          Quay lại kho
        </Button>
      </div>

      {/* Summary Cards */}
      <SummaryCards 
        emergencyCount={1} 
        warningCount={1} 
        trackingCount={1} 
      />

      {/* Time Filter */}
      <TimeFilter 
        activeRange={activeRange} 
        onRangeChange={setActiveRange} 
      />

      {/* Expiry Table */}
      <ExpiryTable range={activeRange} />
    </div>
  );
};

export default ExpiryWarningPage;
