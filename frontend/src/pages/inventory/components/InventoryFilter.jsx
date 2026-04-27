import React from 'react';
import { Card, Input, Select, Button, Space } from 'antd';
import { Search, Filter, RotateCcw } from 'lucide-react';

const { Option } = Select;

const InventoryFilter = ({ onFilter, onReset }) => {
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
            className="rounded-[var(--radius-md)] h-10 border-[var(--color-border)]"
          />
        </div>
        
        <Select
          placeholder="-- Tất cả nhóm --"
          defaultValue="all"
          className="w-[200px] h-10"
          popupClassName="rounded-[var(--radius-md)]"
        >
          <Option value="all">-- Tất cả nhóm --</Option>
          <Option value="khang-sinh">Kháng sinh</Option>
          <Option value="giam-dau">Giảm đau - Hạ sốt</Option>
          <Option value="tieu-hoa">Tiêu hóa</Option>
          <Option value="tim-mach">Tim mạch</Option>
        </Select>

        <Space size={12}>
          <Button 
            type="primary" 
            icon={<Filter size={16} className="mr-2 inline" />}
            className="flex items-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] border-none h-10 px-6 rounded-[var(--radius-md)] font-medium"
            onClick={onFilter}
          >
            Lọc
          </Button>
          <Button 
            icon={<RotateCcw size={16} className="mr-2 inline" />}
            className="flex items-center text-[var(--color-text-secondary)] border-[var(--color-border)] h-10 px-4 rounded-[var(--radius-md)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]"
            onClick={onReset}
          >
            Reset
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default InventoryFilter;
