import React, { useState } from 'react';
import { Card, Input, Select, Button, Space } from 'antd';
import { Search, Filter, RotateCcw } from 'lucide-react';

const { Option } = Select;

const InventoryFilter = ({ filters, categoryOptions, onFilter, onReset }) => {
  const [values, setValues] = useState(filters);

  const updateValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleFilter = () => {
    onFilter(values);
  };

  const handleReset = () => {
    const resetValues = { search: '', category: '', lowStock: '' };
    setValues(resetValues);
    onReset();
  };

  return (
    <Card 
      className="mb-4 shadow-[var(--shadow-card)] border-[var(--color-border-light)] rounded-[var(--radius-lg)]"
      styles={{ body: { padding: '16px' } }}
    >
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[280px]">
          <Input
            placeholder="Tìm thuốc (tên, mã, hoạt chất)..."
            prefix={<Search size={18} className="text-[var(--color-text-muted)]" />}
            value={values.search}
            onChange={(event) => updateValue('search', event.target.value)}
            onPressEnter={handleFilter}
            className="rounded-[var(--radius-md)] h-10 border-[var(--color-border)]"
          />
        </div>
        
        <Select
          placeholder="-- Tất cả nhóm --"
          value={values.category}
          onChange={(value) => updateValue('category', value)}
          className="w-[200px] h-10"
          popupClassName="rounded-[var(--radius-md)]"
        >
          <Option value="">-- Tất cả nhóm --</Option>
          {categoryOptions.map((item) => (
            <Option key={item.value} value={item.value}>
              {item.label}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Tồn kho"
          value={values.lowStock}
          onChange={(value) => updateValue('lowStock', value)}
          className="w-[160px] h-10"
          popupClassName="rounded-[var(--radius-md)]"
        >
          <Option value="">Tất cả tồn kho</Option>
          <Option value="true">Sắp hết tồn</Option>
        </Select>

        <Space size={12}>
          <Button 
            type="primary" 
            icon={<Filter size={16} className="mr-2 inline" />}
            className="flex items-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none h-10 px-6 rounded-[var(--radius-md)] font-medium"
            onClick={handleFilter}
          >
            Lọc
          </Button>
          <Button 
            icon={<RotateCcw size={16} className="mr-2 inline" />}
            className="flex items-center text-[var(--color-text-secondary)] border-[var(--color-border)] h-10 px-4 rounded-[var(--radius-md)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
            onClick={handleReset}
          >
            Reset
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default InventoryFilter;
