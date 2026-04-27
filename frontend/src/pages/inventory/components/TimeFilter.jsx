import React from 'react';
import { Button } from 'antd';

const TimeFilter = ({ activeRange, onRangeChange }) => {
  const options = [
    { label: '7 ngày', value: 7 },
    { label: '15 ngày', value: 15 },
    { label: '30 ngày', value: 30 },
    { label: '60 ngày', value: 60 },
    { label: '90 ngày', value: 90 },
  ];

  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] font-medium mr-2">
        Hiển thị theo:
      </span>
      <div className="flex bg-white p-1 rounded-[var(--radius-md)] border border-[var(--color-border-light)] shadow-sm">
        {options.map((opt) => (
          <Button
            key={opt.value}
            type={activeRange === opt.value ? 'primary' : 'text'}
            onClick={() => onRangeChange(opt.value)}
            className={`
              h-8 px-4 border-none rounded-[var(--radius-sm)] text-[13px] font-medium transition-all
              ${activeRange === opt.value 
                ? 'bg-[var(--color-primary)] text-white shadow-sm' 
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]'
              }
            `}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TimeFilter;
